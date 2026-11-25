'use client';

import React from 'react';
import { Publicacion } from '@/types/database';
import { TrendingUp } from 'lucide-react';

interface InventoryChartProps {
  publicaciones: Publicacion[];
}

export function InventoryChart({ publicaciones }: InventoryChartProps) {
  const topItems = publicaciones.slice(0, 7);

  const maxStock = Math.max(
    ...topItems.map((p) => Math.max(p.stock_fisico || 0, p.stock_publicado || 0)),
    10
  );

  return (
    <div className="bg-white/[0.035] hover:bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-[28px] p-5 sm:p-6 shadow-xl flex flex-col justify-between transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Balance de Inventario
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Comparativa físico vs publicado
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium bg-black/25 px-3 py-1.5 rounded-full border border-white/5">
          <span className="flex items-center gap-1.5 text-white/90">
            <span className="w-2 h-2 rounded-full bg-white" />
            Físico
          </span>
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Publicado
          </span>
        </div>
      </div>

      {/* Gráfico de Barras */}
      <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-white/[0.06]">
        {topItems.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-white/40">
            Sin publicaciones para graficar
          </div>
        ) : (
          topItems.map((item) => {
            const fisHeight = Math.max(8, Math.round(((item.stock_fisico || 0) / maxStock) * 100));
            const pubHeight = Math.max(4, Math.round(((item.stock_publicado || 0) / maxStock) * 100));
            const esSobreventa = (item.stock_publicado || 0) > (item.stock_fisico || 0);

            return (
              <div
                key={item.id}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-black/90 text-[10px] text-white py-1 px-2.5 rounded-lg border border-white/10 whitespace-nowrap z-20 shadow-lg">
                  <p className="font-bold">{item.codigo_ml}</p>
                  <p className="text-white/70">
                    Físico: <strong>{item.stock_fisico}</strong> | Publicado: <strong>{item.stock_publicado}</strong>
                  </p>
                </div>

                {/* Barra */}
                <div className="w-full max-w-[28px] sm:max-w-[34px] flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-2xl overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:scale-105"
                    style={{ height: `${Math.max(fisHeight, pubHeight)}%` }}
                  >
                    <div
                      className={`w-full transition-all ${
                        esSobreventa
                          ? 'bg-gradient-to-t from-red-500 to-rose-400'
                          : 'bg-gradient-to-t from-cyan-500 to-cyan-300'
                      }`}
                      style={{ height: `${Math.min(100, Math.max(15, (pubHeight / Math.max(fisHeight, pubHeight)) * 40))}%` }}
                    />
                    <div className="w-full bg-white/90 flex-1" />
                  </div>
                </div>

                <span className="text-[10px] font-mono font-medium text-white/50 mt-2 truncate max-w-[42px]">
                  {item.codigo_ml.replace('MLV-', '').slice(0, 4)}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-white/40 pt-3">
        <span>Top publicaciones monitoreadas</span>
        <span className="text-cyan-300/80 font-medium flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          En tiempo real
        </span>
      </div>
    </div>
  );
}
