'use client';

import React from 'react';
import { Publicacion } from '@/types/database';
import { Sparkles } from 'lucide-react';

interface SeoProgressCardProps {
  publicaciones: Publicacion[];
}

export function SeoProgressCard({ publicaciones }: SeoProgressCardProps) {
  const total = publicaciones.length;

  if (total === 0) {
    return (
      <div className="bg-white/[0.035] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white mb-1">Optimización del Catálogo</h4>
        <p className="text-xs text-white/50">Sin publicaciones registradas.</p>
      </div>
    );
  }

  const puntosObtenidos = publicaciones.reduce((acc, p) => {
    let pts = 0;
    if (p.portada_fondo_blanco) pts += 1;
    if (p.ficha_tecnica_completa) pts += 1;
    if (p.palabras_clave_seo) pts += 1;
    if (p.envio_gratis) pts += 1;
    return acc + pts;
  }, 0);

  const porcentaje = Math.min(100, Math.round((puntosObtenidos / (total * 4)) * 100));

  return (
    <div className="bg-white/[0.035] hover:bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-5 shadow-lg flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Calidad y SEO del Catálogo</span>
        </h4>
        <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-500/20">
          {porcentaje}%
        </span>
      </div>

      <div className="space-y-2 mt-1">
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-500"
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-white/50 font-medium">
          <span>{puntosObtenidos} optimizaciones activas</span>
          <span>{total * 4} checklist ideal</span>
        </div>
      </div>
    </div>
  );
}
