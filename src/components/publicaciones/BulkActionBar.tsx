'use client';

import React from 'react';
import {
  Boxes,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
  Trash2,
  X,
  Layers,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { BulkEditField } from './BulkEditModal';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onOpenBulkEdit: (tab: BulkEditField) => void;
  onDeleteSelected: () => void;
  isDeleting?: boolean;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onOpenBulkEdit,
  onDeleteSelected,
  isDeleting = false,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="pointer-events-auto bg-[#181615]/95 border border-white/20 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] rounded-full py-2.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 sm:gap-4 max-w-4xl w-full">
        {/* Contador y Desmarcar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-extrabold text-white">
              {selectedCount}{' '}
              <span className="text-xs font-normal text-white/60">
                de {totalCount} seleccionados
              </span>
            </span>
          </div>

          <button
            onClick={onClearSelection}
            className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"
            title="Deseleccionar todos"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Acciones Rápidas en Masa */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* 1. Ajustar Stock */}
          <button
            onClick={() => onOpenBulkEdit('stock')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition shadow-xs"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Ajustar Stock</span>
          </button>

          {/* 2. Cambiar Tipo / Comisión */}
          <button
            onClick={() => onOpenBulkEdit('tipo')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-bold transition"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tipo / Comisión</span>
            <span className="sm:hidden">Comisión</span>
          </button>

          {/* 3. Cambiar Estado */}
          <button
            onClick={() => onOpenBulkEdit('estado')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Estado</span>
          </button>

          {/* 4. Precios */}
          <button
            onClick={() => onOpenBulkEdit('precio')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Precios</span>
          </button>

          {/* 5. Calidad SEO */}
          <button
            onClick={() => onOpenBulkEdit('seo')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Calidad SEO</span>
          </button>

          {/* 6. Edición Múltiple Completa */}
          <button
            onClick={() => onOpenBulkEdit('stock')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/40 text-white text-xs font-extrabold transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Múltiples Cambios</span>
          </button>

          {/* Separador */}
          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* 5. Borrado Masivo */}
          <button
            onClick={onDeleteSelected}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition disabled:opacity-50"
            title="Eliminar las publicaciones seleccionadas"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Borrando...' : 'Borrar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
