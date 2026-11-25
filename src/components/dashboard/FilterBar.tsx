'use client';

import React from 'react';
import { Search, Plus, Download, AlertTriangle, X } from 'lucide-react';
import { EstadoPublicacion, TipoPublicacion } from '@/types/database';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedEstado: string;
  onEstadoChange: (val: string) => void;
  selectedTipo: string;
  onTipoChange: (val: string) => void;
  soloAlertas: boolean;
  onSoloAlertasToggle: () => void;
  onOpenNuevoModal: () => void;
  onExportarCSV: () => void;
  totalFiltrados: number;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  selectedEstado,
  onEstadoChange,
  selectedTipo,
  onTipoChange,
  soloAlertas,
  onSoloAlertasToggle,
  onOpenNuevoModal,
  onExportarCSV,
  totalFiltrados,
}: FilterBarProps) {
  const estados: { label: string; value: string }[] = [
    { label: 'Todos los estados', value: 'TODOS' },
    { label: 'Activa', value: 'Activa' },
    { label: 'Pausada', value: 'Pausada' },
    { label: 'Sin Stock', value: 'Sin Stock' },
    { label: 'En Revisión', value: 'En Revisión' },
    { label: 'Finalizada', value: 'Finalizada' },
  ];

  const tipos: { label: string; value: string }[] = [
    { label: 'Todos los tipos', value: 'TODOS' },
    { label: 'Gratuita', value: 'Gratuita' },
    { label: 'Clásica', value: 'Clásica' },
    { label: 'Premium', value: 'Premium' },
  ];

  const hayFiltrosActivos =
    searchTerm !== '' ||
    selectedEstado !== 'TODOS' ||
    selectedTipo !== 'TODOS' ||
    soloAlertas;

  const resetFiltros = () => {
    onSearchChange('');
    onEstadoChange('TODOS');
    onTipoChange('TODOS');
    if (soloAlertas) onSoloAlertasToggle();
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 space-y-3.5">
      {/* Upper row: Search and Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título, SKU o código ML (ej. MLV-...)"
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Buttons: Export & New */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportarCSV}
            title="Descargar respaldo CSV para Excel"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenNuevoModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Publicación</span>
          </button>
        </div>
      </div>

      {/* Lower row: Filters and Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        {/* Selector de Estado */}
        <select
          value={selectedEstado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {estados.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        {/* Selector de Tipo */}
        <select
          value={selectedTipo}
          onChange={(e) => onTipoChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {tipos.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        {/* Toggle Alertas */}
        <button
          onClick={onSoloAlertasToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
            soloAlertas
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${soloAlertas ? 'text-white' : 'text-amber-500'}`} />
          <span>Solo con alertas</span>
        </button>

        {/* Clear Filters indicator */}
        {hayFiltrosActivos && (
          <button
            onClick={resetFiltros}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-auto flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
        )}

        <div className="ml-auto text-xs text-slate-400 font-medium">
          {totalFiltrados} {totalFiltrados === 1 ? 'resultado' : 'resultados'}
        </div>
      </div>
    </div>
  );
}
