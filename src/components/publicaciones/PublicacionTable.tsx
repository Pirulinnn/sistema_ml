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
}: PublicacionTableProps) {
  const [itemParaEliminar, setItemParaEliminar] = useState<Publicacion | null>(null);
  const { formatearBs } = useExchangeRate();

  const getStatusBadge = (estado: string, sobreventa: boolean) => {
    if (sobreventa) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Sobreventa
        </span>
      );
    }

    switch (estado) {
      case 'Activa':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Activa
          </span>
        );
      case 'Pausada':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Pausada
          </span>
        );
      case 'Sin Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            Sin Stock
          </span>
        );
      case 'En Revisión':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            En Revisión
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/60 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="bg-white/[0.035] hover:bg-white/[0.045] backdrop-blur-xl border border-white/[0.08] rounded-[28px] p-5 sm:p-6 shadow-xl space-y-4 transition-colors">
      {/* Header de la Tabla */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="text-base font-bold text-white">Catálogo de Publicaciones</h3>
          <p className="text-xs text-white/50">
            {publicaciones.length} {publicaciones.length === 1 ? 'publicación auditada' : 'publicaciones auditadas'}
          </p>
        </div>

        {/* Buscador y Filtro */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por código o título..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-black/30 border border-white/10 focus:border-white/30 text-xs text-white placeholder-white/40 outline-none transition"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
              <SearchIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedEstado}
              onChange={(e) => onEstadoChange(e.target.value)}
              className="appearance-none pl-7 pr-8 py-1.5 rounded-full bg-black/30 border border-white/10 text-xs text-white/80 font-medium outline-none cursor-pointer hover:border-white/20 transition"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todos los estados</option>
              <option value="Activa" className="bg-slate-900 text-white">Activas</option>
              <option value="Pausada" className="bg-slate-900 text-white">Pausadas</option>
              <option value="Sin Stock" className="bg-slate-900 text-white">Sin Stock</option>
              <option value="En Revisión" className="bg-slate-900 text-white">En Revisión</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-white/40">
              <Filter className="w-3 h-3" />
            </div>
          </div>

          {onAbrirImportar && (
            <button
              onClick={onAbrirImportar}
              title="Importar archivo Excel o CSV de Mercado Libre"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Importar</span>
            </button>
          )}
        </div>
      </div>

      {/* Vista Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-white/40 font-medium text-[11px] pb-3">
            <tr className="border-b border-white/[0.05]">
              <th className="py-2.5 px-3">Publicación / Código</th>
              <th className="py-2.5 px-3">Tipo & Comisión</th>
              <th className="py-2.5 px-3">Estado</th>
              <th className="py-2.5 px-3">Precio USD</th>
              <th className="py-2.5 px-3">Neto Estimado</th>
              <th className="py-2.5 px-3 text-center">Físico / ML</th>
              <th className="py-2.5 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-white/80 font-medium">
            {publicaciones.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-white/40">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>No hay publicaciones que coincidan con los filtros seleccionados.</p>
                    {onAbrirImportar && (
                      <button
                        onClick={onAbrirImportar}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
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

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.04] transition-colors group"
                  >
                    <td className="py-3 px-3 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[11px] font-bold text-white bg-white/10 px-2 py-0.5 rounded-md">
                          {item.codigo_ml}
                        </span>
                        {item.sku && (
                          <span className="text-[10px] text-white/40 font-mono">
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
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-white/90 font-medium truncate max-w-[280px]" title={item.titulo}>
                        {item.titulo}
                      </p>
                    </td>

                    <td className="py-3 px-3 text-white/60">
                      <span className="text-white font-semibold text-xs">{item.tipo_publicacion}</span>
                      <p className="text-[10px] text-white/40">{item.porcentaje_comision}% comisión</p>
                    </td>

                    <td className="py-3 px-3">
                      {getStatusBadge(item.estado, sobreventa)}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-white text-xs block">
                        ${Number(item.precio_usd).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400/80 block">
                        {formatearBs(item.precio_usd)}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-400 text-xs block">
                        ${ingresoNeto.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-mono text-white/40 block">
                        {formatearBs(ingresoNeto)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold ${
                            critico ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/10 text-white'
                          }`}
                          title="Físico en almacén"
                        >
                          {item.stock_fisico}
                        </span>
                        <span className="text-white/20">/</span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold ${
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

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onVerHistorial(item)}
                          title="Ver historial de auditoría"
                          className="p-1.5 text-white/50 hover:text-cyan-300 hover:bg-white/10 rounded-lg transition"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditar(item)}
                          title="Editar"
                          className="p-1.5 text-white/50 hover:text-amber-300 hover:bg-white/10 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setItemParaEliminar(item)}
                          title="Eliminar"
                          className="p-1.5 text-white/50 hover:text-rose-400 hover:bg-white/10 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
      <div className="lg:hidden space-y-3">
        {publicaciones.length === 0 ? (
          <div className="text-center py-8 text-xs text-white/40 flex flex-col items-center justify-center gap-2">
            <p>No se encontraron publicaciones.</p>
            {onAbrirImportar && (
              <button
                onClick={onAbrirImportar}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Excel / CSV</span>
              </button>
            )}
          </div>
        ) : (
          publicaciones.map((item) => {
            const { ingresoNeto } = calcularComision(item.precio_usd, item.porcentaje_comision);
            const sobreventa = (item.stock_publicado || 0) > (item.stock_fisico || 0);
            const critico = (item.stock_fisico || 0) <= 1;

            return (
              <div
                key={item.id}
                className="bg-black/25 border border-white/5 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                      {item.codigo_ml}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{item.titulo}</h4>
                  </div>
                  {getStatusBadge(item.estado, sobreventa)}
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-white/40 block">Precio / Tipo</span>
                    <span className="font-bold text-white">${Number(item.precio_usd).toFixed(2)}</span>
                    <span className="text-[10px] text-white/40 ml-1">({item.tipo_publicacion})</span>
                    <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                      {formatearBs(item.precio_usd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 block">Margen Neto Est.</span>
                    <span className="font-bold text-emerald-400">${ingresoNeto.toFixed(2)}</span>
                    <span className="text-[10px] font-mono text-white/40 block mt-0.5">
                      {formatearBs(ingresoNeto)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-white/50 text-[10px]">Físico: <strong className="text-white">{item.stock_fisico}</strong></span>
                    <span className="text-white/20">|</span>
                    <span className="text-white/50 text-[10px]">Publicado: <strong className={sobreventa ? 'text-rose-400' : 'text-cyan-300'}>{item.stock_publicado}</strong></span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onVerHistorial(item)}
                      className="p-1.5 text-white/60 hover:text-white rounded-lg bg-white/5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditar(item)}
                      className="p-1.5 text-white/60 hover:text-white rounded-lg bg-white/5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setItemParaEliminar(item)}
                      className="p-1.5 text-rose-400/80 hover:text-rose-400 rounded-lg bg-white/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Diálogo de Eliminación */}
      {itemParaEliminar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#181615] rounded-[28px] p-6 max-w-sm w-full border border-white/10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">¿Eliminar publicación?</h3>
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
