'use client';

import React from 'react';
import { Package, LogOut, Bell, Download, Plus, Upload } from 'lucide-react';
import { NexusLogo } from '@/components/ui/NexusLogo';
import { ExchangeRateWidget } from '@/components/layout/ExchangeRateWidget';

interface NavbarProps {
  userEmail?: string;
  totalAlertas: number;
  onNuevaPublicacion: () => void;
  onExportarCSV: () => void;
  onFiltrarAlertas: () => void;
  onAbrirImportar: () => void;
}

export function Navbar({
  userEmail,
  totalAlertas,
  onNuevaPublicacion,
  onExportarCSV,
  onFiltrarAlertas,
  onAbrirImportar,
}: NavbarProps) {
  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="flex items-center justify-between gap-4 py-2">
        {/* Left: Brand Avatar / Workspace */}
        <div className="flex items-center gap-3">
          <NexusLogo className="w-10 h-10" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">ML</span>
              </span>
              <span className="bg-white/10 text-white/80 text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-white/40 truncate max-w-[150px] sm:max-w-none">
              {userEmail || 'Command Center'}
            </p>
          </div>
        </div>

        {/* Center: Search / Assistant Pill (Exacto a la barra con esfera brillante de la imagen) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="w-full relative flex items-center bg-[#1e1b18]/80 backdrop-blur-2xl border border-white/10 rounded-full py-2 px-4 shadow-inner">
            {/* Esfera luminosa animada */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_10px_rgba(56,189,248,0.5)] shrink-0 mr-3 animate-pulse" />
            <input
              type="text"
              readOnly
              onClick={onFiltrarAlertas}
              placeholder="¿Qué requiere atención en tu inventario hoy?..."
              className="bg-transparent text-xs text-white/80 placeholder-white/40 outline-none w-full cursor-pointer"
            />
            {totalAlertas > 0 && (
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/30 whitespace-nowrap">
                {totalAlertas} alertas
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick actions & User controls */}
        <div className="flex items-center gap-2">
          {/* Widget de Tasa de Cambio BCV / Monedas */}
          <ExchangeRateWidget />

          {/* Botón Importar Excel / CSV */}
          <button
            onClick={onAbrirImportar}
            title="Importar catálogo masivo desde archivo de Mercado Libre"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar Excel</span>
          </button>

          {/* Botón Exportar CSV */}
          <button
            onClick={onExportarCSV}
            title="Exportar respaldo CSV para Excel"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white/80 border border-white/10 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          {/* Notificaciones Campana */}
          <button
            onClick={onFiltrarAlertas}
            title="Ver alertas de inventario"
            className="relative w-9 h-9 rounded-full bg-[#1e1b18] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition"
          >
            <Bell className="w-4 h-4" />
            {totalAlertas > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#1e1b18] animate-pulse" />
            )}
          </button>

          {/* Cerrar Sesión */}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              title="Cerrar Sesión"
              className="w-9 h-9 rounded-full bg-[#1e1b18] border border-white/10 flex items-center justify-center text-white/60 hover:text-rose-400 hover:border-rose-500/30 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
