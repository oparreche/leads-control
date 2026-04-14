const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  // Check if users already exist
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("Seed already ran, skipping...");
    return;
  }

  // Create users
  const password1 = await bcrypt.hash("usuario1", 10);
  const password2 = await bcrypt.hash("usuario2", 10);
  const password3 = await bcrypt.hash("usuario3", 10);

  await prisma.user.create({ data: { name: "Osvaldo", email: "osvaldo@leads.com", password: password1 } });
  await prisma.user.create({ data: { name: "João", email: "joao@leads.com", password: password2 } });
  await prisma.user.create({ data: { name: "Douglas", email: "douglas@leads.com", password: password3 } });

  console.log("Users created!");

  // Import leads from CSV
  const csvPath = path.join(process.cwd(), "leads-data.csv");
  if (!fs.existsSync(csvPath)) {
    console.log("CSV file not found, skipping lead import");
    return;
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").filter((line) => line.trim());

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(";");
    if (parts.length < 7) continue;

    const [nome, bairro, cidade, uf, telefone1, telefone2, email] = parts.map((p) => p.trim());

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

    if (i % 100 === 0) console.log(`${i} leads imported...`);
  }

  console.log(`Total: ${lines.length - 1} leads imported!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
