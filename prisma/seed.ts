import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  // Criar usuários
  const password1 = await bcrypt.hash("usuario1", 10);
  const password2 = await bcrypt.hash("usuario2", 10);
  const password3 = await bcrypt.hash("usuario3", 10);

  await prisma.user.upsert({
    where: { email: "usuario1@leads.com" },
    update: {},
    create: { name: "Usuário 1", email: "usuario1@leads.com", password: password1 },
  });
  await prisma.user.upsert({
    where: { email: "usuario2@leads.com" },
    update: {},
    create: { name: "Usuário 2", email: "usuario2@leads.com", password: password2 },
  });
  await prisma.user.upsert({
    where: { email: "usuario3@leads.com" },
    update: {},
    create: { name: "Usuário 3", email: "usuario3@leads.com", password: password3 },
  });

  console.log("Usuários criados com sucesso!");

  // Importar leads do CSV
  const csvPath = path.join(__dirname, "..", "Desenovlvimento de software_SP.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").filter((line) => line.trim());

  // Pular header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(";");
    if (parts.length < 7) continue;

    const [nome, bairro, cidade, uf, telefone1, telefone2, email] = parts.map((p) =>
      p.trim()
    );

    await prisma.lead.create({
      data: {
        nome: nome || "Sem nome",
        bairro: bairro || null,
        cidade: cidade || null,
        uf: uf || null,
        telefone1: telefone1 || null,
        telefone2: telefone2 || null,
        email: email || null,
      },
    });

    if (i % 100 === 0) {
      console.log(`${i} leads importados...`);
    }
  }

  console.log(`Total: ${lines.length - 1} leads importados!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
