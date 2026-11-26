'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Boxes,
  Tag,
  SlidersHorizontal,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Check,
  Plus,
  Percent,
} from 'lucide-react';
import { TipoPublicacion, EstadoPublicacion } from '@/types/database';
import { getComisionDefault } from '@/lib/utils/comisiones';

export type BulkEditField = 'stock' | 'tipo' | 'estado' | 'precio' | 'seo';

export interface BulkEditChanges {
  // Stock options
  applyStock?: boolean;
  syncFisicoFromPublicado?: boolean;
  stockFisico?: number;
  stockPublicado?: number;

  // Tipo / Comisión
  applyTipo?: boolean;
  tipoPublicacion?: TipoPublicacion;
  porcentajeComision?: number;

  // Estado
  applyEstado?: boolean;
  estado?: EstadoPublicacion;

  // Precios
  applyPrecio?: boolean;
  modoPrecio?: 'fijo' | 'porcentaje';
  precioFijo?: number;
  porcentajeAjuste?: number; // ej. +10 o -5

  // SEO
  applySeo?: boolean;
  portadaFondoBlanco?: boolean;
  fichaTecnicaCompleta?: boolean;
  palabrasClaveSeo?: boolean;
  envioGratis?: boolean;
}

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  initialTab?: BulkEditField;
  onApplyChanges: (changes: BulkEditChanges, actionSummary: string) => Promise<void>;
}

export function BulkEditModal({
  isOpen,
  onClose,
  selectedCount,
  initialTab = 'stock',
  onApplyChanges,
}: BulkEditModalProps) {
  const [activeTab, setActiveTab] = useState<BulkEditField>(initialTab);
  const [applying, setApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Switches de activación de campos (para permitir modificaciones múltiples a la vez)
  const [applyStock, setApplyStock] = useState(false);
  const [applyTipo, setApplyTipo] = useState(false);
  const [applyEstado, setApplyEstado] = useState(false);
  const [applyPrecio, setApplyPrecio] = useState(false);
  const [applySeo, setApplySeo] = useState(false);

  // States: Stock
  const [stockMode, setStockMode] = useState<'sync' | 'fisico' | 'publicado' | 'ambos'>('sync');
  const [valorStockFisico, setValorStockFisico] = useState<number>(5);
  const [valorStockPublicado, setValorStockPublicado] = useState<number>(5);

  // States: Tipo / Comisión
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoPublicacion>('Clásica');
  const [comisionPersonalizada, setComisionPersonalizada] = useState<number>(14);

  // States: Estado
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoPublicacion>('Activa');

  // States: Precio
  const [modoPrecio, setModoPrecio] = useState<'fijo' | 'porcentaje'>('porcentaje');
  const [precioFijo, setPrecioFijo] = useState<number>(20);
  const [porcentajeAjuste, setPorcentajeAjuste] = useState<number>(10);

  // States: SEO
  const [seoPortada, setSeoPortada] = useState<boolean>(true);
  const [seoFicha, setSeoFicha] = useState<boolean>(true);
  const [seoKeywords, setSeoKeywords] = useState<boolean>(true);
  const [seoEnvio, setSeoEnvio] = useState<boolean>(false);

  // Al abrir el modal en una pestaña específica, activar esa sección por defecto
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (initialTab === 'stock') setApplyStock(true);
      if (initialTab === 'tipo') setApplyTipo(true);
      if (initialTab === 'estado') setApplyEstado(true);
      if (initialTab === 'precio') setApplyPrecio(true);
      if (initialTab === 'seo') setApplySeo(true);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleTipoChange = (tipo: TipoPublicacion) => {
    setTipoSeleccionado(tipo);
    setComisionPersonalizada(getComisionDefault(tipo));
    setApplyTipo(true);
  };

  // Construir resumen visual de todos los cambios activos
  const activeChangesList: string[] = [];
  if (applyStock) {
    if (stockMode === 'sync') activeChangesList.push('Sincronizar Stock (Físico = Publicado)');
    else if (stockMode === 'fisico') activeChangesList.push(`Stock Físico: ${valorStockFisico} unid.`);
    else if (stockMode === 'publicado') activeChangesList.push(`Stock Publicado: ${valorStockPublicado} unid.`);
    else if (stockMode === 'ambos') activeChangesList.push(`Stock: Físico ${valorStockFisico} / Pub. ${valorStockPublicado}`);
  }
  if (applyTipo) {
    activeChangesList.push(`Tipo: ${tipoSeleccionado} (${comisionPersonalizada}%)`);
  }
  if (applyEstado) {
    activeChangesList.push(`Estado: ${estadoSeleccionado}`);
  }
  if (applyPrecio) {
    if (modoPrecio === 'fijo') activeChangesList.push(`Precio Fijo: $${precioFijo}`);
    else activeChangesList.push(`Ajuste Precio: ${porcentajeAjuste > 0 ? `+${porcentajeAjuste}%` : `${porcentajeAjuste}%`}`);
  }
  if (applySeo) {
    activeChangesList.push('Checklist SEO actualizado');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeChangesList.length === 0) {
      setErrorMsg('Debes activar al menos una modificación marcando la casilla correspondiente.');
      return;
    }

    setApplying(true);

    try {
      const changes: BulkEditChanges = {};
      const summaryParts: string[] = [];

      // 1. Stock
      if (applyStock) {
        changes.applyStock = true;
        if (stockMode === 'sync') {
          changes.syncFisicoFromPublicado = true;
          summaryParts.push('Stock físico sincronizado con publicado');
        } else if (stockMode === 'fisico') {
          changes.stockFisico = valorStockFisico;
          summaryParts.push(`Stock físico fijado en ${valorStockFisico}`);
        } else if (stockMode === 'publicado') {
          changes.stockPublicado = valorStockPublicado;
          summaryParts.push(`Stock publicado fijado en ${valorStockPublicado}`);
        } else if (stockMode === 'ambos') {
          changes.stockFisico = valorStockFisico;
          changes.stockPublicado = valorStockPublicado;
          summaryParts.push(`Stock físico: ${valorStockFisico}, publicado: ${valorStockPublicado}`);
        }
      }

      // 2. Tipo / Comisión
      if (applyTipo) {
        changes.applyTipo = true;
        changes.tipoPublicacion = tipoSeleccionado;
        changes.porcentajeComision = comisionPersonalizada;
        summaryParts.push(`Tipo ${tipoSeleccionado} (${comisionPersonalizada}%)`);
      }

      // 3. Estado
      if (applyEstado) {
        changes.applyEstado = true;
        changes.estado = estadoSeleccionado;
        summaryParts.push(`Estado ${estadoSeleccionado}`);
      }

      // 4. Precio
      if (applyPrecio) {
        changes.applyPrecio = true;
        changes.modoPrecio = modoPrecio;
        if (modoPrecio === 'fijo') {
          changes.precioFijo = precioFijo;
          summaryParts.push(`Precio fijado en $${precioFijo}`);
        } else {
          changes.porcentajeAjuste = porcentajeAjuste;
          summaryParts.push(`Precios ajustados en ${porcentajeAjuste}%`);
        }
      }

      // 5. SEO
      if (applySeo) {
        changes.applySeo = true;
        changes.portadaFondoBlanco = seoPortada;
        changes.fichaTecnicaCompleta = seoFicha;
        changes.palabrasClaveSeo = seoKeywords;
        changes.envioGratis = seoEnvio;
        summaryParts.push('Ficha SEO optimizada');
      }

      const finalSummary = `Actualización masiva combinada (${summaryParts.join(' • ')}) en ${selectedCount} productos`;
      await onApplyChanges(changes, finalSummary);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al aplicar cambios masivos.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#181615] rounded-[32px] shadow-2xl border border-white/15 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Modificación Masiva Simultánea
              </h2>
              <span className="text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full">
                {selectedCount} seleccionados
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              Puedes activar y configurar <strong>varias modificaciones a la vez</strong> para aplicarlas en un solo clic.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs con Indicador de Activación */}
        <div className="flex border-b border-white/[0.08] px-4 pt-2 bg-black/25 gap-1.5 overflow-x-auto">
          {/* Tab Stock */}
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap transition relative ${
              activeTab === 'stock'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10 rounded-t-xl'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock</span>
            {applyStock && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            )}
          </button>

          {/* Tab Tipo */}
          <button
            type="button"
            onClick={() => setActiveTab('tipo')}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap transition relative ${
              activeTab === 'tipo'
                ? 'border-blue-400 text-blue-300 bg-blue-500/10 rounded-t-xl'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Tipo & Comisión</span>
            {applyTipo && (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse ml-1" />
            )}
          </button>

          {/* Tab Estado */}
          <button
            type="button"
            onClick={() => setActiveTab('estado')}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap transition relative ${
              activeTab === 'estado'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-xl'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Estado</span>
            {applyEstado && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-1" />
            )}
          </button>

          {/* Tab Precios */}
          <button
            type="button"
            onClick={() => setActiveTab('precio')}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap transition relative ${
              activeTab === 'precio'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 rounded-t-xl'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Precios</span>
            {applyPrecio && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-1" />
            )}
          </button>

          {/* Tab SEO */}
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-1.5 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap transition relative ${
              activeTab === 'seo'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10 rounded-t-xl'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Calidad SEO</span>
            {applySeo && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse ml-1" />
            )}
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: STOCK & ALMACÉN */}
          {/* ======================================================== */}
          {activeTab === 'stock' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Checkbox de Activación de esta modificación */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition">
                <input
                  type="checkbox"
                  checked={applyStock}
                  onChange={(e) => setApplyStock(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-500 accent-emerald-400 cursor-pointer"
                />
                <div>
                  <span className="text-sm sm:text-base font-bold text-white block">
                    Modificar inventario en esta operación
                  </span>
                  <span className="text-xs text-white/50">
                    Marca esta casilla para incluir cambios de stock al guardar.
                  </span>
                </div>
              </label>

              {applyStock && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-semibold text-white/60">
                    Selecciona cómo recalibrar el inventario de las {selectedCount} publicaciones:
                  </p>

                  <div className="space-y-2.5">
                    {/* Opción 1: Sincronizar Físico = Publicado */}
                    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                      stockMode === 'sync'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                    }`}>
                      <input
                        type="radio"
                        name="stockMode"
                        value="sync"
                        checked={stockMode === 'sync'}
                        onChange={() => setStockMode('sync')}
                        className="mt-1 accent-emerald-400"
                      />
                      <div>
                        <strong className="block text-sm sm:text-base font-bold text-white">
                          Sincronizar: Stock Físico = Stock Publicado
                        </strong>
                        <span className="text-xs text-white/50 block mt-0.5">
                          Asigna automáticamente a cada producto en almacén la misma cantidad que ya tiene publicada en Mercado Libre.
                        </span>
                      </div>
                    </label>

                    {/* Opción 2: Fijar Stock Físico */}
                    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                      stockMode === 'fisico'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                    }`}>
                      <input
                        type="radio"
                        name="stockMode"
                        value="fisico"
                        checked={stockMode === 'fisico'}
                        onChange={() => setStockMode('fisico')}
                        className="mt-1 accent-emerald-400"
                      />
                      <div className="flex-1">
                        <strong className="block text-sm sm:text-base font-bold text-white">
                          Fijar Stock Físico (Almacén)
                        </strong>
                        <span className="text-xs text-white/50 block mt-0.5 mb-2">
                          Asigna una cantidad fija de unidades reales a todos los seleccionados.
                        </span>
                        {stockMode === 'fisico' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={valorStockFisico}
                              onChange={(e) => setValorStockFisico(parseInt(e.target.value) || 0)}
                              className="w-32 px-3 py-1.5 rounded-lg bg-black/50 border border-white/20 text-sm font-black text-white outline-none focus:border-emerald-400 font-mono"
                            />
                            <span className="text-xs text-white/60">unidades por producto</span>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Opción 3: Fijar Stock Publicado */}
                    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                      stockMode === 'publicado'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                    }`}>
                      <input
                        type="radio"
                        name="stockMode"
                        value="publicado"
                        checked={stockMode === 'publicado'}
                        onChange={() => setStockMode('publicado')}
                        className="mt-1 accent-emerald-400"
                      />
                      <div className="flex-1">
                        <strong className="block text-sm sm:text-base font-bold text-white">
                          Fijar Stock Publicado en Mercado Libre
                        </strong>
                        <span className="text-xs text-white/50 block mt-0.5 mb-2">
                          Define la cantidad disponible visible en Mercado Libre para los compradores.
                        </span>
                        {stockMode === 'publicado' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={valorStockPublicado}
                              onChange={(e) => setValorStockPublicado(parseInt(e.target.value) || 0)}
                              className="w-32 px-3 py-1.5 rounded-lg bg-black/50 border border-white/20 text-sm font-black text-white outline-none focus:border-emerald-400 font-mono"
                            />
                            <span className="text-xs text-white/60">unidades por producto</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: TIPO / COMISIÓN */}
          {/* ======================================================== */}
          {activeTab === 'tipo' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition">
                <input
                  type="checkbox"
                  checked={applyTipo}
                  onChange={(e) => setApplyTipo(e.target.checked)}
                  className="w-5 h-5 rounded text-blue-500 accent-blue-400 cursor-pointer"
                />
                <div>
                  <span className="text-sm sm:text-base font-bold text-white block">
                    Modificar Tipo de Publicación & Comisión en esta operación
                  </span>
                  <span className="text-xs text-white/50">
                    Marca esta casilla para actualizar modalidad y porcentajes en bloque.
                  </span>
                </div>
              </label>

              {applyTipo && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">
                      Selecciona la nueva modalidad de publicación:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Gratuita', 'Clásica', 'Premium'] as TipoPublicacion[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleTipoChange(t)}
                          className={`p-3.5 rounded-2xl border text-center transition ${
                            tipoSeleccionado === t
                              ? 'bg-blue-500/25 border-blue-400 text-white font-extrabold shadow-md'
                              : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          <span className="text-sm sm:text-base block">{t}</span>
                          <span className="text-xs opacity-70">~{getComisionDefault(t)}% com.</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Porcentaje de Comisión Aplicado (%):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={comisionPersonalizada}
                      onChange={(e) => setComisionPersonalizada(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-base font-bold text-white outline-none focus:border-blue-400 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: ESTADO */}
          {/* ======================================================== */}
          {activeTab === 'estado' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition">
                <input
                  type="checkbox"
                  checked={applyEstado}
                  onChange={(e) => setApplyEstado(e.target.checked)}
                  className="w-5 h-5 rounded text-amber-500 accent-amber-400 cursor-pointer"
                />
                <div>
                  <span className="text-sm sm:text-base font-bold text-white block">
                    Modificar Estado en esta operación
                  </span>
                  <span className="text-xs text-white/50">
                    Marca esta casilla para cambiar el estado de las publicaciones marcadas.
                  </span>
                </div>
              </label>

              {applyEstado && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Nuevo Estado para las {selectedCount} publicaciones:
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(['Activa', 'Pausada', 'Sin Stock', 'En Revisión', 'Finalizada'] as EstadoPublicacion[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setEstadoSeleccionado(st);
                          setApplyEstado(true);
                        }}
                        className={`p-3 rounded-2xl border text-center transition ${
                          estadoSeleccionado === st
                            ? 'bg-amber-500/25 border-amber-400 text-white font-extrabold shadow-md'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        <span className="text-sm font-semibold block">{st}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: PRECIOS */}
          {/* ======================================================== */}
          {activeTab === 'precio' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition">
                <input
                  type="checkbox"
                  checked={applyPrecio}
                  onChange={(e) => setApplyPrecio(e.target.checked)}
                  className="w-5 h-5 rounded text-cyan-500 accent-cyan-400 cursor-pointer"
                />
                <div>
                  <span className="text-sm sm:text-base font-bold text-white block">
                    Modificar Precios en esta operación
                  </span>
                  <span className="text-xs text-white/50">
                    Marca esta casilla para fijar o ajustar porcentualmente los precios en lote.
                  </span>
                </div>
              </label>

              {applyPrecio && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setModoPrecio('porcentaje')}
                      className={`p-3 rounded-2xl border text-left transition ${
                        modoPrecio === 'porcentaje'
                          ? 'bg-cyan-500/20 border-cyan-400 text-white'
                          : 'bg-white/[0.03] border-white/10 text-white/60'
                      }`}
                    >
                      <strong className="block text-sm font-bold">Ajuste Porcentual (%)</strong>
                      <span className="text-xs opacity-60">Aumentar o reducir por porcentaje</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModoPrecio('fijo')}
                      className={`p-3 rounded-2xl border text-left transition ${
                        modoPrecio === 'fijo'
                          ? 'bg-cyan-500/20 border-cyan-400 text-white'
                          : 'bg-white/[0.03] border-white/10 text-white/60'
                      }`}
                    >
                      <strong className="block text-sm font-bold">Precio Fijo Único ($)</strong>
                      <span className="text-xs opacity-60">Asignar el mismo precio a todos</span>
                    </button>
                  </div>

                  {modoPrecio === 'porcentaje' ? (
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1">
                        Porcentaje de incremento o descuento (%):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          value={porcentajeAjuste}
                          onChange={(e) => setPorcentajeAjuste(parseFloat(e.target.value) || 0)}
                          placeholder="Ej: 10 para aumentar 10%, -5 para reducir 5%"
                          className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-base font-bold text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        Ejemplo: Si pones <strong>10</strong>, un producto de $20 pasará a $22. Si pones <strong>-5</strong>, pasará a $19.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1">
                        Nuevo Precio Fijo en USD ($):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={precioFijo}
                          onChange={(e) => setPrecioFijo(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-base font-bold text-white outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: CALIDAD SEO */}
          {/* ======================================================== */}
          {activeTab === 'seo' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 cursor-pointer hover:bg-white/[0.06] transition">
                <input
                  type="checkbox"
                  checked={applySeo}
                  onChange={(e) => setApplySeo(e.target.checked)}
                  className="w-5 h-5 rounded text-purple-500 accent-purple-400 cursor-pointer"
                />
                <div>
                  <span className="text-sm sm:text-base font-bold text-white block">
                    Modificar Ficha SEO en esta operación
                  </span>
                  <span className="text-xs text-white/50">
                    Marca esta casilla para actualizar los atributos de posicionamiento.
                  </span>
                </div>
              </label>

              {applySeo && (
                <div className="space-y-2.5 bg-black/35 p-4 rounded-2xl border border-white/10">
                  <label className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl cursor-pointer">
                    <span className="text-sm text-white font-medium">Portada con fondo blanco puro</span>
                    <input
                      type="checkbox"
                      checked={seoPortada}
                      onChange={(e) => setSeoPortada(e.target.checked)}
                      className="w-5 h-5 rounded text-purple-600 accent-purple-400 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl cursor-pointer">
                    <span className="text-sm text-white font-medium">Ficha técnica completa y validada</span>
                    <input
                      type="checkbox"
                      checked={seoFicha}
                      onChange={(e) => setSeoFicha(e.target.checked)}
                      className="w-5 h-5 rounded text-purple-600 accent-purple-400 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl cursor-pointer">
                    <span className="text-sm text-white font-medium">Palabras clave SEO en título</span>
                    <input
                      type="checkbox"
                      checked={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.checked)}
                      className="w-5 h-5 rounded text-purple-600 accent-purple-400 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl cursor-pointer">
                    <span className="text-sm text-white font-medium">Envío gratis activo</span>
                    <input
                      type="checkbox"
                      checked={seoEnvio}
                      onChange={(e) => setSeoEnvio(e.target.checked)}
                      className="w-5 h-5 rounded text-purple-600 accent-purple-400 cursor-pointer"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* BANNER DE RESUMEN COMBINADO DE MODIFICACIONES ACTIVAS */}
          {/* ======================================================== */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 block">
              Resumen de cambios simultáneos ({activeChangesList.length} activados):
            </span>
            {activeChangesList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeChangesList.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-300/80">
                ⚠️ Ninguna modificación activada. Marca la casilla de lo que deseas cambiar en cada pestaña.
              </p>
            )}
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <span className="text-xs text-white/40">
              Se afectarán {selectedCount} publicaciones seleccionadas.
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={applying}
                className="px-4 py-2 rounded-full hover:bg-white/10 text-xs font-semibold text-white/70 transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={applying || activeChangesList.length === 0}
                className="px-6 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {applying && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>
                  {applying
                    ? 'Aplicando cambios simultáneos...'
                    : `Aplicar ${activeChangesList.length} cambio(s) a los ${selectedCount} productos`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
