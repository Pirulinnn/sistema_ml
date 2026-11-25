'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Calendar, FileText } from 'lucide-react';
import { HistorialActualizacion, Publicacion, TipoCambioAuditoria } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface HistorialDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  publicacion: Publicacion | null;
}

export function HistorialDrawer({ isOpen, onClose, publicacion }: HistorialDrawerProps) {
  const [historial, setHistorial] = useState<HistorialActualizacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [nuevaNota, setNuevaNota] = useState('');
  const [tipoNota, setTipoNota] = useState<TipoCambioAuditoria>('General');
  const [savingNota, setSavingNota] = useState(false);

  useEffect(() => {
    if (!publicacion || !isOpen) return;

    const fetchHistorial = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('historial_actualizaciones')
        .select('*')
        .eq('publicacion_id', publicacion.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHistorial(data);
      }
      setLoading(false);
    };

    fetchHistorial();
  }, [publicacion, isOpen]);

  if (!isOpen || !publicacion) return null;

  const handleAgregarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;

    setSavingNota(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('historial_actualizaciones')
        .insert({
          publicacion_id: publicacion.id,
          user_id: user.id,
          tipo_cambio: tipoNota,
          nota: nuevaNota.trim(),
        })
        .select()
        .single();

      if (!error && data) {
        setHistorial([data, ...historial]);
        setNuevaNota('');
      }
    }
    setSavingNota(false);
  };

  const getBadgeColor = (tipo: TipoCambioAuditoria) => {
    switch (tipo) {
      case 'Creación':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
      case 'Precio':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30';
      case 'Stock':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/30';
      case 'SEO/Fotos':
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30';
      case 'Estado':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/30';
      default:
        return 'bg-white/5 text-white/70 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-md bg-[#181615] h-full shadow-2xl flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-200 text-white">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Bitácora de Auditoría</h2>
              <p className="text-[11px] text-white/50 font-mono">{publicacion.codigo_ml}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product preview info */}
        <div className="px-5 py-3.5 bg-black/30 border-b border-white/[0.05] text-xs">
          <p className="font-semibold text-white truncate">{publicacion.titulo}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/50">
            <span>Físico: <strong className="text-white">{publicacion.stock_fisico}</strong></span>
            <span>Publicado: <strong className="text-cyan-300">{publicacion.stock_publicado}</strong></span>
            <span>Precio: <strong className="text-white">${Number(publicacion.precio_usd).toFixed(2)}</strong></span>
          </div>
        </div>

        {/* Formulario para agregar nota manual */}
        <form onSubmit={handleAgregarNota} className="p-5 border-b border-white/[0.08] bg-black/20">
          <label className="block text-xs font-semibold text-white/80 mb-2">
            Agregar Nota Manual a la Bitácora
          </label>
          <div className="flex gap-2 mb-2.5">
            <select
              value={tipoNota}
              onChange={(e) => setTipoNota(e.target.value as TipoCambioAuditoria)}
              className="text-xs bg-black/50 border border-white/10 rounded-xl px-2.5 py-2 font-medium text-white outline-none focus:border-cyan-400"
            >
              <option value="General" className="bg-slate-900">General</option>
              <option value="Precio" className="bg-slate-900">Precio</option>
              <option value="Stock" className="bg-slate-900">Stock</option>
              <option value="SEO/Fotos" className="bg-slate-900">SEO/Fotos</option>
              <option value="Estado" className="bg-slate-900">Estado</option>
            </select>
            <input
              type="text"
              required
              value={nuevaNota}
              onChange={(e) => setNuevaNota(e.target.value)}
              placeholder="Escribe un motivo o comentario..."
              className="flex-1 text-xs px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-white placeholder-white/40 outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={savingNota || !nuevaNota.trim()}
            className="w-full py-2 bg-white text-black hover:bg-white/90 active:scale-[0.99] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{savingNota ? 'Guardando...' : 'Registrar en Bitácora'}</span>
          </button>
        </form>

        {/* Timeline Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : historial.length === 0 ? (
            <div className="text-center py-12 text-white/30">
              <FileText className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p className="text-xs">No hay registros de historial para esta publicación.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-white/10 ml-3.5 space-y-5">
              {historial.map((item) => (
                <div key={item.id} className="relative pl-6">
                  {/* Bullet */}
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#181615] border-2 border-cyan-400" />

                  <div className="bg-black/30 p-3.5 rounded-2xl border border-white/[0.06] shadow-md">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(
                          item.tipo_cambio
                        )}`}
                      >
                        {item.tipo_cambio}
                      </span>
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-white/90 font-medium whitespace-pre-wrap leading-relaxed">
                      {item.nota}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
