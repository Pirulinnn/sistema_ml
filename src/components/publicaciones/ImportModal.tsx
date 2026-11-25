'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';
import { parseMercadoLibreFile, ImportPreviewItem } from '@/lib/utils/importMercadoLibre';
import { createClient } from '@/lib/supabase/client';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export function ImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  // Opciones
  const [initStockFisico, setInitStockFisico] = useState(true);
  const [actualizarExistentes, setActualizarExistentes] = useState(true);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      await processFile(selected);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      await processFile(dropped);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setParsing(true);
    setErrorMsg(null);
    setSuccessCount(null);

    try {
      const result = await parseMercadoLibreFile(selectedFile, initStockFisico);
      setPreviewItems(result.items);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al procesar el archivo Excel.');
      setPreviewItems([]);
    } finally {
      setParsing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewItems([]);
    setErrorMsg(null);
    setSuccessCount(null);
    setImporting(false);
    setParsing(false);
  };

  const handleConfirmImport = async () => {
    if (previewItems.length === 0) return;

    setImporting(true);
    setErrorMsg(null);

    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Sesión no válida. Por favor inicia sesión de nuevo.');
      }

      // Preparar lote con user_id
      const recordsToInsert = previewItems.map((item) => ({
        ...item,
        stock_fisico: initStockFisico ? item.stock_publicado : 0,
        user_id: user.id,
      }));

      // Inserción / Upsert en Supabase
      const { data, error } = await supabase
        .from('publicaciones')
        .upsert(recordsToInsert, {
          onConflict: 'user_id,codigo_ml',
          ignoreDuplicates: !actualizarExistentes,
        })
        .select('id, codigo_ml');

      if (error) {
        throw error;
      }

      // Registrar en bitácora de auditoría
      if (data && data.length > 0) {
        const auditRecords = data.map((d) => ({
          publicacion_id: d.id,
          user_id: user.id,
          tipo_cambio: 'Creación' as const,
          nota: 'Importado masivamente desde archivo de Mercado Libre.',
        }));

        await supabase.from('historial_actualizaciones').insert(auditRecords);
      }

      setSuccessCount(recordsToInsert.length);
      onImportComplete();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Error al guardar las publicaciones en Supabase.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#181615] rounded-[32px] shadow-2xl border border-white/10 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Importador Masivo de Mercado Libre
              </h2>
              <p className="text-xs text-white/50">
                Sube tu archivo descargado de ML (.xlsx, .xls o .csv)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs rounded-2xl flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null ? (
            /* Pantalla de Éxito */
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  ¡Importación Completada con Éxito!
                </h3>
                <p className="text-sm text-white/60 mt-1 max-w-sm mx-auto">
                  Se importaron <strong className="text-white">{successCount} publicaciones</strong> a tu base de datos de Supabase.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    resetState();
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-white text-black font-bold text-xs rounded-full shadow-lg hover:bg-white/90 transition"
                >
                  Ver Catálogo en Command Center
                </button>
              </div>
            </div>
          ) : previewItems.length === 0 ? (
            /* Zona de Arrastrar y Soltar Archivo */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-cyan-400/60 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 bg-white/[0.02] hover:bg-white/[0.05] group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 group-hover:border-cyan-400/40 group-hover:bg-cyan-500/10 text-white/70 group-hover:text-cyan-300 flex items-center justify-center mx-auto mb-4 transition-all shadow-md">
                {parsing ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                {parsing ? 'Leyendo archivo...' : 'Haz clic o arrastra tu archivo aquí'}
              </h4>
              <p className="text-xs text-white/40 mt-1">
                Formatos compatibles: .xlsx (Excel de Mercado Libre), .xls y .csv
              </p>

              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/60">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mapea códigos ML, títulos, stock publicado, precios y comisiones</span>
              </div>
            </div>
          ) : (
            /* Vista Previa de Publicaciones Detectadas */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/20 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">
                    Se detectaron <strong className="text-emerald-400">{previewItems.length} publicaciones</strong> listas para importar.
                  </span>
                </div>
                <button
                  onClick={resetState}
                  className="text-[11px] text-white/50 hover:text-white underline font-medium"
                >
                  Cambiar archivo
                </button>
              </div>

              {/* Opciones de Importación */}
              <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer text-white/90">
                  <input
                    type="checkbox"
                    checked={initStockFisico}
                    onChange={(e) => setInitStockFisico(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
                  />
                  <span>
                    <strong>Inicializar stock físico igual al publicado</strong> (evita falsas alertas al arrancar).
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-white/90">
                  <input
                    type="checkbox"
                    checked={actualizarExistentes}
                    onChange={(e) => setActualizarExistentes(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
                  />
                  <span>
                    <strong>Actualizar datos si el código ya existe</strong> (evita duplicar registros).
                  </span>
                </label>
              </div>

              {/* Tabla de Muestra (Primeras 5 filas) */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
                <div className="px-4 py-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-white/50">
                  <span>Vista previa (primeras 5 publicaciones):</span>
                  <span>{file?.name}</span>
                </div>

                <div className="overflow-x-auto max-h-48">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] text-white/40 uppercase bg-black/60 border-b border-white/5">
                      <tr>
                        <th className="py-2 px-3">Código ML</th>
                        <th className="py-2 px-3">Título</th>
                        <th className="py-2 px-3">Precio</th>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3 text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {previewItems.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-mono text-[11px] font-bold text-white">
                            {item.codigo_ml}
                          </td>
                          <td className="py-2 px-3 truncate max-w-[200px]" title={item.titulo}>
                            {item.titulo}
                          </td>
                          <td className="py-2 px-3 font-semibold text-emerald-400">
                            ${item.precio_usd.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-white/60">
                            {item.tipo_publicacion}
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-cyan-300">
                            {item.stock_publicado}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {successCount === null && previewItems.length > 0 && (
          <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <button
              type="button"
              onClick={resetState}
              disabled={importing}
              className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={importing}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded-full shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition flex items-center gap-2 disabled:opacity-50"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando en la nube...</span>
                </>
              ) : (
                <>
                  <span>Confirmar e Importar ({previewItems.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
