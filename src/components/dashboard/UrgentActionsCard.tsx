'use client';

import React from 'react';
import { Publicacion } from '@/types/database';
import { AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface UrgentActionsCardProps {
  publicaciones: Publicacion[];
  onSeleccionarPublicacion: (p: Publicacion) => void;
}

export function UrgentActionsCard({
  publicaciones,
  onSeleccionarPublicacion,
}: UrgentActionsCardProps) {
  const itemsEnRiesgo = publicaciones.filter(
    (p) => (p.stock_publicado || 0) > (p.stock_fisico || 0) || (p.stock_fisico || 0) <= 1
  );

  const primerCritico = itemsEnRiesgo[0];

  return (
    <div className="bg-white/[0.035] hover:bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-5 shadow-lg flex flex-col justify-between transition-colors">
      <div>
        <h4 className="text-sm font-bold text-white mb-0.5">Atención Requerida</h4>
        <p className="text-xs text-white/50">
          Decisiones pendientes para proteger reputación
        </p>
      </div>

      <div className="mt-4">
        {primerCritico ? (
          <div
            onClick={() => onSeleccionarPublicacion(primerCritico)}
            className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 cursor-pointer transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${(primerCritico.stock_publicado || 0) > (primerCritico.stock_fisico || 0)
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="max-w-[190px]">
                <p className="text-xs font-bold text-white truncate">
                  {primerCritico.codigo_ml}
                </p>
                <p className="text-[11px] text-white/60 truncate">
                  {(primerCritico.stock_publicado || 0) > (primerCritico.stock_fisico || 0)
                    ? `Sobreventa: ${primerCritico.stock_publicado} pub vs ${primerCritico.stock_fisico} fís`
                    : `Stock crítico: ${primerCritico.stock_fisico} unidad restante`}
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/15 flex items-center justify-center text-white/70 group-hover:text-white transition">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Inventario 100% en zona segura, sin riesgos de sobreventa hoy.</span>
          </div>
        )}
      </div>
    </div>
  );
}
