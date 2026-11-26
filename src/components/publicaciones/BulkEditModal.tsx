'use client';

import React, { useState } from 'react';
import {
  X,
  Boxes,
  Tag,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { TipoPublicacion, EstadoPublicacion } from '@/types/database';
import { getComisionDefault } from '@/lib/utils/comisiones';

export type BulkEditField = 'stock' | 'tipo' | 'estado' | 'seo';

export interface BulkEditChanges {
  // Stock options
  syncFisicoFromPublicado?: boolean;
  stockFisico?: number;
  stockPublicado?: number;

  // Tipo / Comisión
  tipoPublicacion?: TipoPublicacion;
  porcentajeComision?: number;

  // Estado
  estado?: EstadoPublicacion;

  // SEO
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

  // States: Stock
  const [stockMode, setStockMode] = useState<'sync' | 'fisico' | 'publicado' | 'ambos'>('sync');
  const [valorStockFisico, setValorStockFisico] = useState<number>(5);
  const [valorStockPublicado, setValorStockPublicado] = useState<number>(5);

  // States: Tipo / Comisión
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoPublicacion>('Clásica');
  const [comisionPersonalizada, setComisionPersonalizada] = useState<number>(14);

  // States: Estado
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoPublicacion>('Activa');

  // States: SEO
  const [seoPortada, setSeoPortada] = useState<boolean | null>(null);
  const [seoFicha, setSeoFicha] = useState<boolean | null>(null);
  const [seoKeywords, setSeoKeywords] = useState<boolean | null>(null);
  const [seoEnvio, setSeoEnvio] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleTipoChange = (tipo: TipoPublicacion) => {
    setTipoSeleccionado(tipo);
    setComisionPersonalizada(getComisionDefault(tipo));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setErrorMsg(null);

    try {
      const changes: BulkEditChanges = {};
      let summary = '';

      if (activeTab === 'stock') {
        if (stockMode === 'sync') {
          changes.syncFisicoFromPublicado = true;
          summary = `Sincronización masiva: Stock Físico igualado al Stock Publicado (${selectedCount} productos)`;
        } else if (stockMode === 'fisico') {
          changes.stockFisico = valorStockFisico;
          summary = `Ajuste masivo: Stock Físico fijado en ${valorStockFisico} unid. (${selectedCount} productos)`;
        } else if (stockMode === 'publicado') {
          changes.stockPublicado = valorStockPublicado;
          summary = `Ajuste masivo: Stock Publicado fijado en ${valorStockPublicado} unid. (${selectedCount} productos)`;
        } else if (stockMode === 'ambos') {
          changes.stockFisico = valorStockFisico;
          changes.stockPublicado = valorStockPublicado;
          summary = `Ajuste masivo: Físico ${valorStockFisico} y Publicado ${valorStockPublicado} (${selectedCount} productos)`;
        }
      } else if (activeTab === 'tipo') {
        changes.tipoPublicacion = tipoSeleccionado;
        changes.porcentajeComision = comisionPersonalizada;
        summary = `Cambio de tipo masivo: ${tipoSeleccionado} (${comisionPersonalizada}% comisión) en ${selectedCount} productos`;
      } else if (activeTab === 'estado') {
        changes.estado = estadoSeleccionado;
        summary = `Cambio de estado masivo a "${estadoSeleccionado}" en ${selectedCount} productos`;
      } else if (activeTab === 'seo') {
        if (seoPortada !== null) changes.portadaFondoBlanco = seoPortada;
        if (seoFicha !== null) changes.fichaTecnicaCompleta = seoFicha;
        if (seoKeywords !== null) changes.palabrasClaveSeo = seoKeywords;
        if (seoEnvio !== null) changes.envioGratis = seoEnvio;
        summary = `Actualización de ficha SEO en ${selectedCount} productos`;
      }

      await onApplyChanges(changes, summary);
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
      <div className="bg-[#181615] rounded-[32px] shadow-2xl border border-white/15 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Edición Masiva de Productos</span>
              <span className="text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                {selectedCount} seleccionados
              </span>
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Los cambios que elijas se aplicarán simultáneamente a los {selectedCount} productos marcados.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs de Selección de Campo */}
        <div className="flex border-b border-white/[0.08] px-6 pt-2 bg-black/20 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'stock'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Stock & Almacén</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tipo')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'tipo'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Tipo & Comisión</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('estado')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'estado'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Estado</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'seo'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Calidad SEO</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: STOCK */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <p className="text-xs text-white/70">
                Selecciona cómo deseas recalibrar el inventario de las {selectedCount} publicaciones:
              </p>

              <div className="space-y-2.5">
                {/* Opción 1: Sincronizar Físico = Publicado */}
                <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  stockMode === 'sync'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                }`}>
                  <input
                    type="radio"
                    name="stockMode"
                    value="sync"
                    checked={stockMode === 'sync'}
                    onChange={() => setStockMode('sync')}
                    className="mt-1"
                  />
                  <div>
                    <strong className="block text-sm font-bold text-white">
                      Sincronizar: Stock Físico = Stock Publicado
                    </strong>
                    <span className="text-xs text-white/50 block mt-0.5">
                      Ideal si acabas de importar desde Mercado Libre. Asigna a cada almacén el mismo valor que cada publicación ya tiene en ML.
                    </span>
                  </div>
                </label>

                {/* Opción 2: Fijar Stock Físico */}
                <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  stockMode === 'fisico'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                }`}>
                  <input
                    type="radio"
                    name="stockMode"
                    value="fisico"
                    checked={stockMode === 'fisico'}
                    onChange={() => setStockMode('fisico')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <strong className="block text-sm font-bold text-white">
                      Fijar Stock Físico (Almacén)
                    </strong>
                    <span className="text-xs text-white/50 block mt-0.5 mb-2">
                      Asigna la misma cantidad de unidades reales a todos los productos seleccionados.
                    </span>
                    {stockMode === 'fisico' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={valorStockFisico}
                          onChange={(e) => setValorStockFisico(parseInt(e.target.value) || 0)}
                          className="w-32 px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-sm font-bold text-white outline-none focus:border-emerald-400 font-mono"
                        />
                        <span className="text-xs text-white/60">unidades por producto</span>
                      </div>
                    )}
                  </div>
                </label>

                {/* Opción 3: Fijar Stock Publicado */}
                <label className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                  stockMode === 'publicado'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                }`}>
                  <input
                    type="radio"
                    name="stockMode"
                    value="publicado"
                    checked={stockMode === 'publicado'}
                    onChange={() => setStockMode('publicado')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <strong className="block text-sm font-bold text-white">
                      Fijar Stock Publicado en Mercado Libre
                    </strong>
                    <span className="text-xs text-white/50 block mt-0.5 mb-2">
                      Ajusta la cantidad disponible que los compradores ven en ML.
                    </span>
                    {stockMode === 'publicado' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={valorStockPublicado}
                          onChange={(e) => setValorStockPublicado(parseInt(e.target.value) || 0)}
                          className="w-32 px-3 py-1.5 rounded-lg bg-black/40 border border-white/20 text-sm font-bold text-white outline-none focus:border-emerald-400 font-mono"
                        />
                        <span className="text-xs text-white/60">unidades por producto</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: TIPO / COMISIÓN */}
          {activeTab === 'tipo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-2">
                  Tipo de Publicación en Mercado Libre:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Gratuita', 'Clásica', 'Premium'] as TipoPublicacion[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTipoChange(t)}
                      className={`p-3 rounded-2xl border text-center transition ${
                        tipoSeleccionado === t
                          ? 'bg-blue-500/20 border-blue-400 text-white font-bold'
                          : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="text-sm block">{t}</span>
                      <span className="text-[11px] opacity-60">~{getComisionDefault(t)}%</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Porcentaje de Comisión (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={comisionPersonalizada}
                  onChange={(e) => setComisionPersonalizada(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-400 font-mono"
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Se actualizará el porcentaje de comisión aplicado para el cálculo del margen neto de los {selectedCount} productos.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ESTADO */}
          {activeTab === 'estado' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Nuevo Estado para las {selectedCount} publicaciones:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {(['Activa', 'Pausada', 'Sin Stock', 'En Revisión', 'Finalizada'] as EstadoPublicacion[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEstadoSeleccionado(st)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      estadoSeleccionado === st
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                        : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <span className="text-sm block">{st}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CALIDAD SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-3">
              <p className="text-xs text-white/70">
                Marca las optimizaciones que deseas activar para todas las publicaciones seleccionadas:
              </p>

              <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/10">
                <label className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                  <span className="text-sm text-white font-medium">Portada con fondo blanco puro</span>
                  <input
                    type="checkbox"
                    checked={seoPortada === true}
                    onChange={(e) => setSeoPortada(e.target.checked ? true : false)}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                  <span className="text-sm text-white font-medium">Ficha técnica completa y validada</span>
                  <input
                    type="checkbox"
                    checked={seoFicha === true}
                    onChange={(e) => setSeoFicha(e.target.checked ? true : false)}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                  <span className="text-sm text-white font-medium">Palabras clave SEO en título</span>
                  <input
                    type="checkbox"
                    checked={seoKeywords === true}
                    onChange={(e) => setSeoKeywords(e.target.checked ? true : false)}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer">
                  <span className="text-sm text-white font-medium">Envío gratis activo</span>
                  <input
                    type="checkbox"
                    checked={seoEnvio === true}
                    onChange={(e) => setSeoEnvio(e.target.checked ? true : false)}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
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
              disabled={applying}
              className="px-6 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-extrabold flex items-center gap-2 shadow-lg transition active:scale-[0.98] disabled:opacity-50"
            >
              {applying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{applying ? 'Aplicando cambios...' : `Aplicar a los ${selectedCount} productos`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
