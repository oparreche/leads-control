"use client";

import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Leads Control</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Olá, <strong>{session?.user?.name}</strong>
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-red-600 hover:text-red-800 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
