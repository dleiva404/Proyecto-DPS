"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, TrendingUp, FileText, ClipboardList, LogOut } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reportes", href: "/reportes", icon: TrendingUp },
  { name: "Constancias", href: "/constancias", icon: FileText },
  { name: "Solicitudes", href: "/solicitudes", icon: ClipboardList, badge: "12" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col h-screen sticky top-0 border-r border-slate-200 shadow-sm">
      {/* 1. Logo y Título de Empresa */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <Image src="/LogoGC.png" alt="Logo" width={36} height={36} className="object-contain" />
        <div>
          <span className="font-bold text-slate-900 text-base block leading-tight">GRUPO CALMA</span>
          <span className="text-xs text-slate-400">Recursos Humanos</span>
        </div>
      </div>

      {/* 2. Menú Principal */}
      <div className="px-6 pt-6 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        Menú Principal
      </div>

      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-colors font-medium text-sm ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {item.name}
              </div>
              {item.badge && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. Perfil de Usuario Abajo (subido) */}
      <div className="mt-auto p-4 m-4 mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 min-w-[36px] rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            CC
          </div>
          <div className="overflow-hidden leading-tight">
            <p className="text-xs font-bold text-slate-800 truncate">Carlos Calderón</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Gerente</p>
          </div>
        </div>
        <button
          type="button"
          title="Cerrar sesión"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200/50"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}