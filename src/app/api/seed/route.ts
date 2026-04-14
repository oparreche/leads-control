import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export const maxDuration = 60;

async function createTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER NOT NULL AUTO_INCREMENT,
      name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL,
      password VARCHAR(191) NOT NULL,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE INDEX users_email_key(email),
      PRIMARY KEY (id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER NOT NULL AUTO_INCREMENT,
      nome VARCHAR(191) NOT NULL,
      bairro VARCHAR(191) NULL,
      cidade VARCHAR(191) NULL,
      uf VARCHAR(191) NULL,
      telefone1 VARCHAR(191) NULL,
      telefone2 VARCHAR(191) NULL,
      email VARCHAR(191) NULL,
      status ENUM('NOVO','EM_ATENDIMENTO','CONTATO_REALIZADO','INTERESSADO','NAO_INTERESSADO','FECHADO_GANHO','FECHADO_PERDIDO') NOT NULL DEFAULT 'NOVO',
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS lead_interactions (
      id INTEGER NOT NULL AUTO_INCREMENT,
      leadId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      action VARCHAR(191) NOT NULL,
      notes TEXT NULL,
      status ENUM('NOVO','EM_ATENDIMENTO','CONTATO_REALIZADO','INTERESSADO','NAO_INTERESSADO','FECHADO_GANHO','FECHADO_PERDIDO') NOT NULL,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE lead_interactions ADD CONSTRAINT lead_interactions_leadId_fkey
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE RESTRICT ON UPDATE CASCADE
  `).catch(() => {});
  await prisma.$executeRawUnsafe(`
    ALTER TABLE lead_interactions ADD CONSTRAINT lead_interactions_userId_fkey
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
  `).catch(() => {});
}

export async function GET() {
  try {
    await createTables();

    const count = await prisma.user.count();
    if (count > 0) {
      const leadCount = await prisma.lead.count();
      return NextResponse.json({ message: "Already seeded", users: count, leads: leadCount });
    }

    const p1 = await bcrypt.hash("usuario1", 10);
    const p2 = await bcrypt.hash("usuario2", 10);
    const p3 = await bcrypt.hash("usuario3", 10);

    await prisma.user.create({ data: { name: "Osvaldo", email: "osvaldo@leads.com", password: p1 } });
    await prisma.user.create({ data: { name: "João", email: "joao@leads.com", password: p2 } });
    await prisma.user.create({ data: { name: "Douglas", email: "douglas@leads.com", password: p3 } });

    const csvPath = path.join(process.cwd(), "leads-data.csv");
    let leadsImported = 0;

    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, "utf-8");
      const lines = csvContent.split("\n").filter((l) => l.trim());

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
        leadsImported++;
      }
    }

    return NextResponse.json({ message: "Seed complete", users: 3, leads: leadsImported });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
