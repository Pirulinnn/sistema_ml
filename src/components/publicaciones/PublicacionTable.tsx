'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  Search as SearchIcon,
  Filter,
  Upload,
  Check,
} from 'lucide-react';
import { Publicacion } from '@/types/database';
import { calcularComision } from '@/lib/utils/comisiones';
import { useExchangeRate } from '@/context/ExchangeRateContext';

interface PublicacionTableProps {
  publicaciones: Publicacion[];
  onEditar: (item: Publicacion) => void;
  onVerHistorial: (item: Publicacion) => void;
  onEliminar: (item: Publicacion) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedEstado: string;
  onEstadoChange: (val: string) => void;
  onAbrirImportar?: () => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

export function PublicacionTable({
  publicaciones,
  onEditar,
  onVerHistorial,
  onEliminar,
  searchTerm,
  onSearchChange,
  selectedEstado,
  onEstadoChange,
  onAbrirImportar,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onClearSelection,
}: PublicacionTableProps) {
  const [itemParaEliminar, setItemParaEliminar] = useState<Publicacion | null>(null);
  const { formatearBs } = useExchangeRate();

  const allSelected =
    publicaciones.length > 0 && selectedIds.length === publicaciones.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < publicaciones.length;

  const getStatusBadge = (estado: string, sobreventa: boolean) => {
    if (sobreventa) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold bg-rose-950/60 text-rose-200 border border-rose-500/40">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          Sobreventa
        </span>
      );
    }

    switch (estado) {
      case 'Activa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-emerald-950/50 text-emerald-200 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Activa
          </span>
        );
      case 'Pausada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-amber-950/50 text-amber-200 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Pausada
          </span>
        );
      case 'Sin Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white/10 text-white/60 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-white/50" />
            Sin Stock
          </span>
        );
      case 'En Revisión':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-cyan-950/50 text-cyan-200 border border-cyan-500/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            En Revisión
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white/10 text-white/70 border border-white/15">
            <span className="w-2 h-2 rounded-full bg-white/50" />
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="bg-white/[0.035] hover:bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-[28px] p-5 sm:p-7 shadow-xl space-y-5 transition-colors">
      {/* Header de la Tabla */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Catálogo de Publicaciones
            </h3>
            {selectedIds.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
                {selectedIds.length} seleccionadas
              </span>
            )}
          </div>
          <p className="text-sm text-white/50 mt-0.5">
            {publicaciones.length}{' '}
            {publicaciones.length === 1
              ? 'publicación auditada'
              : 'publicaciones auditadas'}
          </p>
        </div>

        {/* Buscador y Filtro */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por código, SKU o título..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-black/40 border border-white/15 focus:border-cyan-400 text-sm text-white placeholder-white/40 outline-none transition"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
              <SearchIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedEstado}
              onChange={(e) => onEstadoChange(e.target.value)}
              className="appearance-none pl-8 pr-9 py-2 rounded-full bg-black/40 border border-white/15 text-sm text-white/90 font-medium outline-none cursor-pointer hover:border-white/30 transition"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todos los estados</option>
              <option value="Activa" className="bg-slate-900 text-white">Activas</option>
              <option value="Pausada" className="bg-slate-900 text-white">Pausadas</option>
              <option value="Sin Stock" className="bg-slate-900 text-white">Sin Stock</option>
              <option value="En Revisión" className="bg-slate-900 text-white">En Revisión</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          {onAbrirImportar && (
            <button
              onClick={onAbrirImportar}
              title="Importar archivo Excel o CSV de Mercado Libre"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-sm font-bold transition shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>
          )}
        </div>
      </div>

      {/* Vista Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-white/50 font-bold text-xs uppercase tracking-wider pb-3">
            <tr className="border-b border-white/[0.08]">
              {/* Checkbox Columna Maestra */}
              <th className="py-3.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={() => {
                    if (allSelected) {
                      onClearSelection?.();
                    } else {
                      onSelectAll?.();
                    }
                  }}
                  className="w-4 h-4 rounded text-cyan-500 bg-black/50 border-white/30 cursor-pointer accent-cyan-400"
                  title="Seleccionar todas las publicaciones"
                />
              </th>
              <th className="py-3.5 px-3">Publicación / Código</th>
              <th className="py-3.5 px-3">Tipo & Comisión</th>
              <th className="py-3.5 px-3">Estado</th>
              <th className="py-3.5 px-3">Precio USD / Bs.</th>
              <th className="py-3.5 px-3">Neto Estimado</th>
              <th className="py-3.5 px-3 text-center">Físico / ML</th>
              <th className="py-3.5 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-white/90">
            {publicaciones.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-white/40">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm">No hay publicaciones que coincidan con los filtros seleccionados.</p>
                    {onAbrirImportar && (
                      <button
                        onClick={onAbrirImportar}
                        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-sm font-bold transition"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Cargar catálogo desde Excel / CSV de Mercado Libre</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              publicaciones.map((item) => {
                const { ingresoNeto } = calcularComision(item.precio_usd, item.porcentaje_comision);
                const sobreventa = (item.stock_publicado || 0) > (item.stock_fisico || 0);
                const critico = (item.stock_fisico || 0) <= 1;
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group ${
                      isSelected
                        ? 'bg-cyan-500/[0.08] hover:bg-cyan-500/[0.12]'
                        : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Checkbox de fila */}
                    <td className="py-4 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(item.id)}
                        className="w-4 h-4 rounded text-cyan-500 bg-black/50 border-white/30 cursor-pointer accent-cyan-400"
                      />
                    </td>

                    {/* Columna Publicación / Código */}
                    <td className="py-4 px-3 max-w-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs sm:text-sm font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
                          {item.codigo_ml}
                        </span>
                        {item.sku && (
                          <span className="text-xs text-white/50 font-mono">
                            SKU: {item.sku}
                          </span>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-cyan-300 ml-1 transition"
                            title="Abrir en Mercado Libre"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-white font-semibold line-clamp-1" title={item.titulo}>
                        {item.titulo}
                      </p>
                    </td>

                    {/* Tipo & Comisión */}
                    <td className="py-4 px-3">
                      <span className="text-white font-bold text-sm sm:text-base block">
                        {item.tipo_publicacion}
                      </span>
                      <p className="text-xs text-white/50 font-medium">
                        {item.porcentaje_comision}% comisión
                      </p>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-3">
                      {getStatusBadge(item.estado, sobreventa)}
                    </td>

                    {/* Precio USD y Bs. */}
                    <td className="py-4 px-3">
                      <span className="font-black text-white text-base sm:text-lg block tracking-tight">
                        ${Number(item.precio_usd).toFixed(2)}
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 block mt-0.5">
                        {formatearBs(item.precio_usd)}
                      </span>
                    </td>

                    {/* Margen Neto Estimado */}
                    <td className="py-4 px-3">
                      <span className="font-black text-emerald-400 text-base sm:text-lg block tracking-tight">
                        ${ingresoNeto.toFixed(2)}
                      </span>
                      <span className="text-xs sm:text-sm font-mono text-white/40 block mt-0.5">
                        {formatearBs(ingresoNeto)}
                      </span>
                    </td>

                    {/* Físico / Publicado */}
                    <td className="py-4 px-3 text-center">
                      <div className="inline-flex items-center gap-2 font-mono">
                        <span
                          className={`px-3 py-1 rounded-lg font-black text-sm sm:text-base ${
                            critico
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-white/10 text-white border border-white/10'
                          }`}
                          title="Físico en almacén"
                        >
                          {item.stock_fisico}
                        </span>
                        <span className="text-white/30 text-base font-bold">/</span>
                        <span
                          className={`px-3 py-1 rounded-lg font-black text-sm sm:text-base ${
                            sobreventa
                              ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse'
                              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                          }`}
                          title="Publicado en Mercado Libre"
                        >
                          {item.stock_publicado}
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onVerHistorial(item)}
                          title="Ver historial de auditoría"
                          className="p-2 text-white/60 hover:text-cyan-300 hover:bg-white/10 rounded-xl transition"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditar(item)}
                          title="Editar"
                          className="p-2 text-white/60 hover:text-amber-300 hover:bg-white/10 rounded-xl transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemParaEliminar(item)}
                          title="Eliminar"
                          className="p-2 text-white/60 hover:text-rose-400 hover:bg-white/10 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile */}
      <div className="lg:hidden space-y-3.5">
        {publicaciones.length === 0 ? (
          <div className="text-center py-10 text-sm text-white/40 flex flex-col items-center justify-center gap-2">
            <p>No se encontraron publicaciones.</p>
            {onAbrirImportar && (
              <button
                onClick={onAbrirImportar}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm font-bold"
              >
                <Upload className="w-4 h-4" />
                <span>Importar Excel / CSV</span>
              </button>
            )}
          </div>
        ) : (
          publicaciones.map((item) => {
            const { ingresoNeto } = calcularComision(item.precio_usd, item.porcentaje_comision);
            const sobreventa = (item.stock_publicado || 0) > (item.stock_fisico || 0);
            const critico = (item.stock_fisico || 0) <= 1;
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`border rounded-2xl p-4 sm:p-5 space-y-3.5 transition ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-500/40'
                    : 'bg-black/35 border-white/10'
                }`}
              >
                {/* Header Móvil con Checkbox */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect?.(item.id)}
                      className="w-5 h-5 mt-0.5 rounded text-cyan-500 bg-black/50 border-white/30 cursor-pointer accent-cyan-400"
                    />
                    <div>
                      <span className="font-mono text-xs font-bold text-white bg-white/10 px-2.5 py-0.5 rounded">
                        {item.codigo_ml}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white mt-1 line-clamp-2">
                        {item.titulo}
                      </h4>
                    </div>
                  </div>
                  {getStatusBadge(item.estado, sobreventa)}
                </div>

                {/* Precios Móvil */}
                <div className="grid grid-cols-2 gap-3 bg-white/[0.04] p-3 rounded-xl">
                  <div>
                    <span className="text-xs text-white/50 block font-medium">Precio ({item.tipo_publicacion})</span>
                    <span className="font-black text-white text-base block mt-0.5">
                      ${Number(item.precio_usd).toFixed(2)}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
                      {formatearBs(item.precio_usd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-white/50 block font-medium">Margen Neto Est.</span>
                    <span className="font-black text-emerald-400 text-base block mt-0.5">
                      ${ingresoNeto.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono text-white/40 block mt-0.5">
                      {formatearBs(ingresoNeto)}
                    </span>
                  </div>
                </div>

                {/* Stock y Acciones Móvil */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-xs text-white/60">
                      Físico: <strong className={`text-sm px-2 py-0.5 rounded ${critico ? 'bg-amber-500/20 text-amber-300' : 'text-white'}`}>{item.stock_fisico}</strong>
                    </span>
                    <span className="text-white/20">|</span>
                    <span className="text-xs text-white/60">
                      ML: <strong className={`text-sm px-2 py-0.5 rounded ${sobreventa ? 'bg-rose-500/20 text-rose-300' : 'text-cyan-300'}`}>{item.stock_publicado}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onVerHistorial(item)}
                      className="p-2 text-white/70 hover:text-white rounded-lg bg-white/5"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditar(item)}
                      className="p-2 text-white/70 hover:text-white rounded-lg bg-white/5"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setItemParaEliminar(item)}
                      className="p-2 text-rose-400/80 hover:text-rose-400 rounded-lg bg-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Diálogo de Eliminación Individual */}
      {itemParaEliminar && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181615] rounded-[28px] p-6 max-w-sm w-full border border-white/10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">¿Eliminar publicación?</h3>
              <p className="text-xs text-white/60 mt-1">
                Se eliminará <strong>{itemParaEliminar.codigo_ml}</strong> junto con toda su bitácora de auditoría.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setItemParaEliminar(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-white/70 bg-white/5 hover:bg-white/10 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onEliminar(itemParaEliminar);
                  setItemParaEliminar(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
