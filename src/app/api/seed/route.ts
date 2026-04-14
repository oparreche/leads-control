import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Check if already seeded
    const count = await prisma.user.count();
    if (count > 0) {
      const leadCount = await prisma.lead.count();
      return NextResponse.json({ message: "Already seeded", users: count, leads: leadCount });
    }

    // Create users
    const p1 = await bcrypt.hash("usuario1", 10);
    const p2 = await bcrypt.hash("usuario2", 10);
    const p3 = await bcrypt.hash("usuario3", 10);

    await prisma.user.create({ data: { name: "Osvaldo", email: "osvaldo@leads.com", password: p1 } });
    await prisma.user.create({ data: { name: "João", email: "joao@leads.com", password: p2 } });
    await prisma.user.create({ data: { name: "Douglas", email: "douglas@leads.com", password: p3 } });

    // Import leads
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
