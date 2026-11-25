'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  Publicacion,
  PublicacionInsert,
  TipoPublicacion,
  EstadoPublicacion,
  TipoCambioAuditoria,
} from '@/types/database';
import { calcularComision, getComisionDefault } from '@/lib/utils/comisiones';
import { detectarCambios } from '@/lib/utils/auditoria';
import { useExchangeRate } from '@/context/ExchangeRateContext';

interface PublicacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: PublicacionInsert,
    historialNota?: { tipo: TipoCambioAuditoria; nota: string }
  ) => Promise<void>;
  publicacionParaEditar?: Publicacion | null;
}

export function PublicacionModal({
  isOpen,
  onClose,
  onSave,
  publicacionParaEditar,
}: PublicacionModalProps) {
  const isEditing = Boolean(publicacionParaEditar);
  const { formatearBs, tasaActiva, nombreTasaActiva } = useExchangeRate();

  // Form states
  const [codigoMl, setCodigoMl] = useState('');
  const [sku, setSku] = useState('');
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('');
  const [precioUsd, setPrecioUsd] = useState<number>(0);
  const [tipoPublicacion, setTipoPublicacion] = useState<TipoPublicacion>('Clásica');
  const [porcentajeComision, setPorcentajeComision] = useState<number>(14);
  const [stockFisico, setStockFisico] = useState<number>(0);
  const [stockPublicado, setStockPublicado] = useState<number>(0);
  const [estado, setEstado] = useState<EstadoPublicacion>('Activa');

  // Checklist SEO
  const [portadaFondoBlanco, setPortadaFondoBlanco] = useState(false);
  const [fichaTecnicaCompleta, setFichaTecnicaCompleta] = useState(false);
  const [palabrasClaveSeo, setPalabrasClaveSeo] = useState(false);
  const [envioGratis, setEnvioGratis] = useState(false);

  // Nota de auditoría manual
  const [notaAuditoria, setNotaAuditoria] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Reset or fill form on open
  useEffect(() => {
    if (publicacionParaEditar) {
      setCodigoMl(publicacionParaEditar.codigo_ml);
      setSku(publicacionParaEditar.sku || '');
      setTitulo(publicacionParaEditar.titulo);
      setUrl(publicacionParaEditar.url || '');
      setPrecioUsd(Number(publicacionParaEditar.precio_usd) || 0);
      setTipoPublicacion(publicacionParaEditar.tipo_publicacion);
      setPorcentajeComision(Number(publicacionParaEditar.porcentaje_comision) || 0);
      setStockFisico(publicacionParaEditar.stock_fisico || 0);
      setStockPublicado(publicacionParaEditar.stock_publicado || 0);
      setEstado(publicacionParaEditar.estado);
      setPortadaFondoBlanco(publicacionParaEditar.portada_fondo_blanco || false);
      setFichaTecnicaCompleta(publicacionParaEditar.ficha_tecnica_completa || false);
      setPalabrasClaveSeo(publicacionParaEditar.palabras_clave_seo || false);
      setEnvioGratis(publicacionParaEditar.envio_gratis || false);
      setNotaAuditoria('');
    } else {
      setCodigoMl('');
      setSku('');
      setTitulo('');
      setUrl('');
      setPrecioUsd(0);
      setTipoPublicacion('Clásica');
      setPorcentajeComision(getComisionDefault('Clásica'));
      setStockFisico(0);
      setStockPublicado(0);
      setEstado('Activa');
      setPortadaFondoBlanco(false);
      setFichaTecnicaCompleta(false);
      setPalabrasClaveSeo(false);
      setEnvioGratis(false);
      setNotaAuditoria('');
    }
    setErrorForm(null);
  }, [publicacionParaEditar, isOpen]);

  const handleTipoChange = (nuevoTipo: TipoPublicacion) => {
    setTipoPublicacion(nuevoTipo);
    setPorcentajeComision(getComisionDefault(nuevoTipo));
  };

  const { montoComision, ingresoNeto } = calcularComision(precioUsd, porcentajeComision);
  const hayRiesgoSobreventa = stockPublicado > stockFisico;
  const esStockCritico = stockFisico <= 1;

  const cambiosDetectados = publicacionParaEditar
    ? detectarCambios(publicacionParaEditar, {
        codigo_ml: codigoMl,
        sku: sku || null,
        titulo,
        url: url || null,
        precio_usd: precioUsd,
        tipo_publicacion: tipoPublicacion,
        porcentaje_comision: porcentajeComision,
        stock_fisico: stockFisico,
        stock_publicado: stockPublicado,
        estado,
        portada_fondo_blanco: portadaFondoBlanco,
        ficha_tecnica_completa: fichaTecnicaCompleta,
        palabras_clave_seo: palabrasClaveSeo,
        envio_gratis: envioGratis,
      })
    : null;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoMl.trim()) {
      setErrorForm('El código de Mercado Libre es obligatorio.');
      return;
    }
    if (!titulo.trim()) {
      setErrorForm('El título de la publicación es obligatorio.');
      return;
    }

    setSaving(true);
    setErrorForm(null);

    try {
      const data: PublicacionInsert = {
        codigo_ml: codigoMl.trim().toUpperCase(),
        sku: sku.trim() || null,
        titulo: titulo.trim(),
        url: url.trim() || null,
        precio_usd: Number(precioUsd) || 0,
        tipo_publicacion: tipoPublicacion,
        porcentaje_comision: Number(porcentajeComision) || 0,
        stock_fisico: Number(stockFisico) || 0,
        stock_publicado: Number(stockPublicado) || 0,
        estado,
        portada_fondo_blanco: portadaFondoBlanco,
        ficha_tecnica_completa: fichaTecnicaCompleta,
        palabras_clave_seo: palabrasClaveSeo,
        envio_gratis: envioGratis,
        user_id: '',
      };

      let historialData: { tipo: TipoCambioAuditoria; nota: string } | undefined = undefined;

      if (isEditing && cambiosDetectados) {
        const notaFinal = notaAuditoria.trim()
          ? `${notaAuditoria.trim()} (${cambiosDetectados.resumenAutomatico})`
          : cambiosDetectados.resumenAutomatico;

        historialData = {
          tipo: cambiosDetectados.tipo,
          nota: notaFinal,
        };
      } else if (!isEditing) {
        historialData = {
          tipo: 'Creación',
          nota: 'Creación de la publicación en el sistema administrativo.',
        };
      }

      await onSave(data, historialData);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorForm(error.message || 'Error al guardar la publicación.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#181615] rounded-[32px] shadow-2xl border border-white/10 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-base font-bold text-white">
              {isEditing ? 'Editar Publicación' : 'Nueva Publicación de Mercado Libre'}
            </h2>
            <p className="text-xs text-white/50">
              {isEditing
                ? `Actualizando ${publicacionParaEditar?.codigo_ml}`
                : 'Registra el inventario dual y métricas financieras'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorForm && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorForm}</span>
            </div>
          )}

          {/* 1. Identificación */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">
              1. Identificación del Producto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Código Mercado Libre *
                </label>
                <input
                  type="text"
                  required
                  value={codigoMl}
                  onChange={(e) => setCodigoMl(e.target.value)}
                  placeholder="Ej. MLV-123456789"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-mono text-white placeholder-white/40 focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  SKU Interno de Almacén
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ej. PROD-001-A"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:border-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Título de la Publicación *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Auriculares Inalámbricos Bluetooth 5.3"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Enlace Directo a Mercado Libre
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://articulo.mercadolibre.com.ve/..."
                  className="w-full pl-3.5 pr-9 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:border-cyan-400 outline-none"
                />
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-cyan-400 hover:text-cyan-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 2. Control Dual de Inventario */}
          <div className="space-y-3 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">
                2. Control Dual de Inventario
              </h3>
              {hayRiesgoSobreventa && (
                <span className="text-[11px] font-bold text-rose-300 bg-rose-950/60 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Riesgo de Sobreventa
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10">
                <label className="block text-xs font-bold text-white mb-1">
                  Stock Físico (Almacén)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockFisico}
                  onChange={(e) => setStockFisico(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-lg text-lg font-bold text-white focus:border-cyan-400 outline-none"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Unidades reales en almacén.
                </p>
                {esStockCritico && (
                  <p className="text-[11px] text-amber-400 font-semibold mt-1">
                    ⚠️ Alerta: Stock crítico (≤ 1 unid).
                  </p>
                )}
              </div>

              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10">
                <label className="block text-xs font-bold text-white mb-1">
                  Stock Publicado (Mercado Libre)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockPublicado}
                  onChange={(e) => setStockPublicado(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-1.5 bg-white/5 border rounded-lg text-lg font-bold outline-none ${
                    hayRiesgoSobreventa
                      ? 'border-rose-500/60 text-rose-300 bg-rose-950/30'
                      : 'border-white/15 text-white focus:border-cyan-400'
                  }`}
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Unidades activas en Mercado Libre.
                </p>
                {hayRiesgoSobreventa && (
                  <p className="text-[11px] text-rose-400 font-semibold mt-1">
                    🚨 Publicado ({stockPublicado}) supera al físico ({stockFisico}).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 3. Control Financiero y Márgenes Netos */}
          <div className="space-y-3 pt-2 border-t border-white/[0.08]">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">
              3. Precio, Comisión y Margen Neto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Precio de Venta (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={precioUsd}
                    onChange={(e) => setPrecioUsd(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm font-semibold text-white outline-none focus:border-cyan-400"
                  />
                </div>
                {/* Autocálculo en Bolívares */}
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-semibold font-mono">
                    ≈ {formatearBs(precioUsd)}
                  </span>
                  <span className="text-white/40 text-[10px]">
                    Tasa {nombreTasaActiva} ({tasaActiva.toFixed(2)})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Tipo de Publicación
                </label>
                <select
                  value={tipoPublicacion}
                  onChange={(e) => handleTipoChange(e.target.value as TipoPublicacion)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm font-medium text-white outline-none focus:border-cyan-400"
                >
                  <option value="Gratuita" className="bg-slate-900">Gratuita (0%)</option>
                  <option value="Clásica" className="bg-slate-900">Clásica (~14%)</option>
                  <option value="Premium" className="bg-slate-900">Premium (~19%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Comisión (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={porcentajeComision}
                    onChange={(e) => setPorcentajeComision(parseFloat(e.target.value) || 0)}
                    className="w-full pr-8 pl-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm font-semibold text-white outline-none focus:border-cyan-400"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-white/40">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta de Cálculo Financiero Automático */}
            <div className="bg-[#122822]/80 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-300 block">
                  Cálculo Automático por Unidad
                </span>
                <span className="text-xs text-white/60">
                  Comisión ML: <strong className="text-white">${montoComision.toFixed(2)} USD</strong>{' '}
                  <span className="text-white/40 text-[11px]">({formatearBs(montoComision)})</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-medium text-white/50 block">
                  Ingreso Neto Estimado
                </span>
                <span className="text-lg font-black text-emerald-400 flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4" />
                  ${ingresoNeto.toFixed(2)} USD
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300/80 block text-right mt-0.5">
                  ≈ {formatearBs(ingresoNeto)}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Estado y Checklist SEO */}
          <div className="space-y-3 pt-2 border-t border-white/[0.08]">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">
              4. Estado y Calidad de Ficha (SEO)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Estado de la Publicación
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoPublicacion)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm font-semibold text-white outline-none focus:border-cyan-400"
              >
                <option value="Activa" className="bg-slate-900">Activa</option>
                <option value="Pausada" className="bg-slate-900">Pausada</option>
                <option value="Sin Stock" className="bg-slate-900">Sin Stock</option>
                <option value="En Revisión" className="bg-slate-900">En Revisión</option>
                <option value="Finalizada" className="bg-slate-900">Finalizada</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-black/30 hover:bg-white/5 cursor-pointer text-xs font-medium text-white/80 transition">
                <input
                  type="checkbox"
                  checked={portadaFondoBlanco}
                  onChange={(e) => setPortadaFondoBlanco(e.target.checked)}
                  className="rounded text-cyan-500 w-4 h-4 accent-cyan-500"
                />
                <span>Fondo Blanco</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-black/30 hover:bg-white/5 cursor-pointer text-xs font-medium text-white/80 transition">
                <input
                  type="checkbox"
                  checked={fichaTecnicaCompleta}
                  onChange={(e) => setFichaTecnicaCompleta(e.target.checked)}
                  className="rounded text-cyan-500 w-4 h-4 accent-cyan-500"
                />
                <span>Ficha Técnica</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-black/30 hover:bg-white/5 cursor-pointer text-xs font-medium text-white/80 transition">
                <input
                  type="checkbox"
                  checked={palabrasClaveSeo}
                  onChange={(e) => setPalabrasClaveSeo(e.target.checked)}
                  className="rounded text-cyan-500 w-4 h-4 accent-cyan-500"
                />
                <span>Keywords SEO</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-black/30 hover:bg-white/5 cursor-pointer text-xs font-medium text-white/80 transition">
                <input
                  type="checkbox"
                  checked={envioGratis}
                  onChange={(e) => setEnvioGratis(e.target.checked)}
                  className="rounded text-cyan-500 w-4 h-4 accent-cyan-500"
                />
                <span>Envío Gratis</span>
              </label>
            </div>
          </div>

          {/* 5. Auditoría y Trazabilidad (Solo en Edición) */}
          {isEditing && cambiosDetectados && (
            <div className="space-y-3 pt-2 border-t border-white/[0.08]">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">
                5. Bitácora de Auditoría
              </h3>

              {cambiosDetectados.diferencias.length > 0 ? (
                <div className="p-3 bg-amber-950/40 border border-amber-500/30 text-amber-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Info className="w-3.5 h-3.5" />
                    Cambios detectados:
                  </span>
                  <p className="text-[11px] text-amber-200/80">
                    {cambiosDetectados.resumenAutomatico}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-white/5 text-white/40 rounded-xl text-xs">
                  Sin cambios detectados hasta el momento.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Nota explicativa para la bitácora (opcional)
                </label>
                <input
                  type="text"
                  value={notaAuditoria}
                  onChange={(e) => setNotaAuditoria(e.target.value)}
                  placeholder="Ej. Ajuste de precio por campaña y sincronización con almacén"
                  className="w-full px-3.5 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:border-cyan-400 outline-none"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs font-bold text-black bg-white hover:bg-white/90 active:scale-[0.98] rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Guardar Cambios' : 'Registrar Publicación'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
