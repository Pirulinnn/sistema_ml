'use client';

import React from 'react';
import { Publicacion } from '@/types/database';
import { calcularComision } from '@/lib/utils/comisiones';
import { useExchangeRate } from '@/context/ExchangeRateContext';
import {
  PackageCheck,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  ShieldAlert,
} from 'lucide-react';

interface KpiCardsProps {
  publicaciones: Publicacion[];
  onNuevaPublicacion: () => void;
  onFiltrarAlertas: () => void;
}

export function KpiCards({
  publicaciones,
  onNuevaPublicacion,
  onFiltrarAlertas,
}: KpiCardsProps) {
  const { formatearBs, nombreTasaActiva, tasaActiva } = useExchangeRate();
  const activas = publicaciones.filter((p) => p.estado === 'Activa').length;
  const totalStockFisico = publicaciones.reduce((acc, p) => acc + (p.stock_fisico || 0), 0);
  
  const sobreventas = publicaciones.filter(
    (p) => (p.stock_publicado || 0) > (p.stock_fisico || 0)
  ).length;

  const stockCritico = publicaciones.filter(
    (p) => (p.stock_fisico || 0) <= 1
  ).length;

  let totalVentaBruta = 0;
  let totalComisiones = 0;
  let totalNetoReal = 0;

  publicaciones.forEach((p) => {
    const unidades = p.stock_fisico || 0;
    const precio = Number(p.precio_usd) || 0;
    const { montoComision, ingresoNeto } = calcularComision(precio, p.porcentaje_comision);
    totalVentaBruta += unidades * precio;
    totalComisiones += unidades * montoComision;
    totalNetoReal += unidades * ingresoNeto;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 1. Tarjeta Financiera Ultra-Transparente */}
      <div className="lg:col-span-7 bg-white/[0.035] hover:bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-[28px] p-6 shadow-xl flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs sm:text-sm font-bold text-white/70 tracking-wider">
              VALOR PROYECTADO DE INVENTARIO
            </span>
            <span className="text-xs font-mono font-bold bg-white/10 text-white/90 px-3 py-0.5 rounded-full border border-white/10">
              USD
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              ${totalNetoReal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h2>
            <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs sm:text-sm bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
              <span>Neto Estimado</span>
            </div>
          </div>
          {/* Equivalente en Bolívares */}
          <p className="text-sm sm:text-base font-mono font-bold text-emerald-300 mb-3">
            ≈ {formatearBs(totalNetoReal)} <span className="text-xs text-white/50 font-normal">({nombreTasaActiva}: {tasaActiva.toFixed(2)})</span>
          </p>

          <div className="flex items-center gap-2.5 mt-5 mb-6">
            <button
              onClick={onNuevaPublicacion}
              className="px-5 py-2.5 rounded-full bg-white text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:bg-white/90 active:scale-[0.98] transition"
            >
              <span>Nueva Publicación</span>
              <Plus className="w-4 h-4" />
            </button>

            <button
              onClick={onFiltrarAlertas}
              className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold text-xs sm:text-sm border border-white/10 flex items-center gap-2 active:scale-[0.98] transition"
            >
              <span>Ver Alertas</span>
              <ArrowUpRight className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.08] text-left">
          <div>
            <span className="text-xs text-white/50 block font-semibold">Venta Bruta</span>
            <span className="text-base sm:text-lg font-black text-white">
              ${totalVentaBruta.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          <div>
            <span className="text-xs text-white/50 block font-semibold">Comisiones ML</span>
            <span className="text-base sm:text-lg font-black text-rose-300">
              -${totalComisiones.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          <div>
            <span className="text-xs text-white/50 block font-semibold">Margen Neto</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              ${totalNetoReal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Mini Bento Cards Ultra-Translúcidas */}
      <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
        
        {/* Card 1: Activas (Verde Esmeralda suave translúcido) */}
        <div className="bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12] backdrop-blur-xl border border-emerald-500/25 rounded-[24px] p-4.5 flex flex-col justify-between shadow-lg transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-emerald-300">Activas</span>
            <PackageCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <span className="text-3xl sm:text-4xl font-black text-white">{activas}</span>
          </div>
          <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
            <span>↗ {Math.round((activas / (publicaciones.length || 1)) * 100)}% del catálogo</span>
          </div>
        </div>

        {/* Card 2: Stock Físico */}
        <div className="bg-white/[0.035] hover:bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-4.5 flex flex-col justify-between shadow-lg transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-white/70">Stock Físico</span>
            <Boxes className="w-4 h-4 text-white/50" />
          </div>
          <div className="my-1.5">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {totalStockFisico.toLocaleString('es-ES')}
            </span>
          </div>
          <div className="text-xs text-cyan-300 font-semibold">
            <span>unidades en almacén</span>
          </div>
        </div>

        {/* Card 3: Sobreventas */}
        <div
          onClick={onFiltrarAlertas}
          className={`backdrop-blur-xl rounded-[24px] p-4.5 flex flex-col justify-between shadow-lg cursor-pointer transition border ${
            sobreventas > 0
              ? 'bg-rose-500/[0.1] border-rose-500/30 hover:bg-rose-500/[0.15]'
              : 'bg-white/[0.035] border-white/[0.08] hover:bg-white/[0.05]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold ${sobreventas > 0 ? 'text-rose-300' : 'text-white/70'}`}>
              Sobreventas
            </span>
            <AlertTriangle className={`w-4 h-4 ${sobreventas > 0 ? 'text-rose-400 animate-pulse' : 'text-white/50'}`} />
          </div>
          <div className="my-1.5">
            <span className={`text-3xl sm:text-4xl font-black ${sobreventas > 0 ? 'text-rose-400' : 'text-white'}`}>
              {sobreventas}
            </span>
          </div>
          <div className="text-xs text-white/60 font-semibold">
            <span>{sobreventas > 0 ? '🚨 Riesgo de reputación' : '0 sin sobreventas'}</span>
          </div>
        </div>

        {/* Card 4: Stock Crítico */}
        <div className="bg-white/[0.035] hover:bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-4.5 flex flex-col justify-between shadow-lg transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-white/70">Stock Crítico</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-1.5">
            <span className="text-3xl sm:text-4xl font-black text-amber-400">{stockCritico}</span>
          </div>
          <div className="text-xs text-white/60 font-semibold">
            <span>≤ 1 unid. para pausar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
