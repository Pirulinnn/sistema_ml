'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Publicacion, PublicacionInsert, PublicacionUpdate, TipoCambioAuditoria } from '@/types/database';
import { Navbar } from '@/components/layout/Navbar';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { SeoProgressCard } from '@/components/dashboard/SeoProgressCard';
import { UrgentActionsCard } from '@/components/dashboard/UrgentActionsCard';
import { PublicacionTable } from '@/components/publicaciones/PublicacionTable';
import { PublicacionModal } from '@/components/publicaciones/PublicacionModal';
import { HistorialDrawer } from '@/components/publicaciones/HistorialDrawer';
import { ImportModal } from '@/components/publicaciones/ImportModal';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { BulkActionBar } from '@/components/publicaciones/BulkActionBar';
import { BulkEditModal, BulkEditChanges, BulkEditField } from '@/components/publicaciones/BulkEditModal';
import { BottomDock } from '@/components/layout/BottomDock';
import { exportarPublicacionesACSV } from '@/lib/utils/exportCsv';
import {
  AlertCircle,
  RefreshCw,
  LayoutGrid,
  TrendingUp,
  BarChart2,
  Briefcase,
  Upload,
} from 'lucide-react';

export default function DashboardPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // Estados de filtros y vista
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('TODOS');
  const [activeTab, setActiveTab] = useState<'command' | 'alerts' | 'analytics'>('command');
  const [timeFilter, setTimeFilter] = useState<'todos' | 'activas' | 'alertas'>('todos');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [publicacionParaEditar, setPublicacionParaEditar] = useState<Publicacion | null>(null);

  // Historial Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [publicacionParaHistorial, setPublicacionParaHistorial] = useState<Publicacion | null>(null);

  // Selección múltiple y acciones masivas
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkEditTab, setBulkEditTab] = useState<BulkEditField>('stock');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Carga inicial
  const cargarPublicaciones = async () => {
    setLoading(true);
    setErrorStatus(null);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
      }

      const { data, error } = await supabase
        .from('publicaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setPublicaciones(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorStatus(error.message || 'Error al conectar con la base de datos de Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const totalAlertas = useMemo(() => {
    return publicaciones.filter(
      (p) => (p.stock_publicado || 0) > (p.stock_fisico || 0) || (p.stock_fisico || 0) <= 1
    ).length;
  }, [publicaciones]);

  const publicacionesFiltradas = useMemo(() => {
    return publicaciones.filter((p) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const coincideCodigo = p.codigo_ml?.toLowerCase().includes(query);
        const coincideSku = p.sku?.toLowerCase().includes(query);
        const coincideTitulo = p.titulo?.toLowerCase().includes(query);
        if (!coincideCodigo && !coincideSku && !coincideTitulo) {
          return false;
        }
      }

      if (selectedEstado !== 'TODOS' && p.estado !== selectedEstado) {
        return false;
      }

      if (activeTab === 'alerts' || timeFilter === 'alertas') {
        const esSobreventa = (p.stock_publicado || 0) > (p.stock_fisico || 0);
        const esCritico = (p.stock_fisico || 0) <= 1;
        if (!esSobreventa && !esCritico) return false;
      } else if (timeFilter === 'activas') {
        if (p.estado !== 'Activa') return false;
      }

      return true;
    });
  }, [publicaciones, searchTerm, selectedEstado, activeTab, timeFilter]);

  const handleGuardarPublicacion = async (
    data: PublicacionInsert,
    historialNota?: { tipo: TipoCambioAuditoria; nota: string }
  ) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Sesión no válida. Inicie sesión de nuevo.');
    }

    if (publicacionParaEditar) {
      const { data: updated, error } = await supabase
        .from('publicaciones')
        .update({
          codigo_ml: data.codigo_ml,
          sku: data.sku,
          titulo: data.titulo,
          url: data.url,
          precio_usd: data.precio_usd,
          tipo_publicacion: data.tipo_publicacion,
          porcentaje_comision: data.porcentaje_comision,
          stock_fisico: data.stock_fisico,
          stock_publicado: data.stock_publicado,
          estado: data.estado,
          portada_fondo_blanco: data.portada_fondo_blanco,
          ficha_tecnica_completa: data.ficha_tecnica_completa,
          palabras_clave_seo: data.palabras_clave_seo,
          envio_gratis: data.envio_gratis,
        })
        .eq('id', publicacionParaEditar.id)
        .select()
        .single();

      if (error) throw error;

      if (historialNota) {
        await supabase.from('historial_actualizaciones').insert({
          publicacion_id: publicacionParaEditar.id,
          user_id: user.id,
          tipo_cambio: historialNota.tipo,
          nota: historialNota.nota,
        });
      }

      setPublicaciones((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } else {
      const { data: nuevo, error } = await supabase
        .from('publicaciones')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (historialNota) {
        await supabase.from('historial_actualizaciones').insert({
          publicacion_id: nuevo.id,
          user_id: user.id,
          tipo_cambio: 'Creación',
          nota: historialNota.nota,
        });
      }

      setPublicaciones((prev) => [nuevo, ...prev]);
    }
  };

  const handleEliminarPublicacion = async (item: Publicacion) => {
    const supabase = createClient();
    const { error } = await supabase.from('publicaciones').delete().eq('id', item.id);

    if (error) {
      alert(`Error al eliminar: ${error.message}`);
      return;
    }

    setPublicaciones((prev) => prev.filter((p) => p.id !== item.id));
  };

  const handleAbrirNuevo = () => {
    setPublicacionParaEditar(null);
    setIsModalOpen(true);
  };

  const handleAbrirEditar = (item: Publicacion) => {
    setPublicacionParaEditar(item);
    setIsModalOpen(true);
  };

  const handleAbrirHistorial = (item: Publicacion) => {
    setPublicacionParaHistorial(item);
    setIsDrawerOpen(true);
  };

  const handleExportar = () => {
    exportarPublicacionesACSV(
      publicacionesFiltradas,
      `inventario_ml_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const handleFiltrarAlertas = () => {
    setActiveTab('alerts');
    setTimeFilter('alertas');
  };

  // Ajuste rápido de stock físico in-line (+1 / -1)
  const handleQuickUpdateStock = async (id: string, delta: number) => {
    const item = publicaciones.find((p) => p.id === id);
    if (!item) return;

    const nuevoStock = Math.max(0, (item.stock_fisico || 0) + delta);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Actualización optimista inmediata en interfaz
    setPublicaciones((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock_fisico: nuevoStock } : p))
    );

    const { error } = await supabase
      .from('publicaciones')
      .update({ stock_fisico: nuevoStock })
      .eq('id', id);

    if (error) {
      alert(`Error al actualizar stock: ${error.message}`);
      await cargarPublicaciones();
      return;
    }

    if (user) {
      await supabase.from('historial_actualizaciones').insert({
        publicacion_id: id,
        user_id: user.id,
        tipo_cambio: 'Stock',
        nota: `Ajuste rápido de stock físico: ${delta > 0 ? `+${delta}` : delta} (Nuevo valor: ${nuevoStock})`,
      });
    }
  };

  // Manejadores de Selección y Edición Masiva
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = publicacionesFiltradas.map((p) => p.id);
    setSelectedIds(allFilteredIds);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleOpenBulkEdit = (tab: BulkEditField) => {
    setBulkEditTab(tab);
    setIsBulkEditModalOpen(true);
  };

  const handleApplyBulkChanges = async (
    changes: BulkEditChanges,
    actionSummary: string
  ) => {
    if (selectedIds.length === 0) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Sesión no válida.');

    // 1. Caso A: Sincronizar Físico = Publicado
    if (changes.syncFisicoFromPublicado) {
      const seleccionados = publicaciones.filter((p) => selectedIds.includes(p.id));
      for (const item of seleccionados) {
        await supabase
          .from('publicaciones')
          .update({ stock_fisico: item.stock_publicado })
          .eq('id', item.id);
      }
    }

    // 2. Caso B: Ajuste de Precio porcentual individual
    if (changes.applyPrecio && changes.modoPrecio === 'porcentaje' && changes.porcentajeAjuste !== undefined) {
      const factor = 1 + changes.porcentajeAjuste / 100;
      const seleccionados = publicaciones.filter((p) => selectedIds.includes(p.id));
      for (const item of seleccionados) {
        const nuevoPrecio = Number((Number(item.precio_usd) * factor).toFixed(2));
        await supabase
          .from('publicaciones')
          .update({ precio_usd: Math.max(0, nuevoPrecio) })
          .eq('id', item.id);
      }
    }

    // 3. Caso C: Actualización de campos comunes directos
    const updateData: PublicacionUpdate = {};
    if (changes.applyStock && !changes.syncFisicoFromPublicado) {
      if (changes.stockFisico !== undefined) updateData.stock_fisico = changes.stockFisico;
      if (changes.stockPublicado !== undefined) updateData.stock_publicado = changes.stockPublicado;
    }
    if (changes.applyTipo) {
      if (changes.tipoPublicacion !== undefined) updateData.tipo_publicacion = changes.tipoPublicacion;
      if (changes.porcentajeComision !== undefined) updateData.porcentaje_comision = changes.porcentajeComision;
    }
    if (changes.applyEstado && changes.estado !== undefined) {
      updateData.estado = changes.estado;
    }
    if (changes.applyPrecio && changes.modoPrecio === 'fijo' && changes.precioFijo !== undefined) {
      updateData.precio_usd = changes.precioFijo;
    }
    if (changes.applySeo) {
      if (changes.portadaFondoBlanco !== undefined) updateData.portada_fondo_blanco = changes.portadaFondoBlanco;
      if (changes.fichaTecnicaCompleta !== undefined) updateData.ficha_tecnica_completa = changes.fichaTecnicaCompleta;
      if (changes.palabrasClaveSeo !== undefined) updateData.palabras_clave_seo = changes.palabrasClaveSeo;
      if (changes.envioGratis !== undefined) updateData.envio_gratis = changes.envioGratis;
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('publicaciones')
        .update(updateData)
        .in('id', selectedIds);

      if (error) throw error;
    }

    // Registrar auditoría para cada producto afectado
    const tipoAuditoria: TipoCambioAuditoria = changes.syncFisicoFromPublicado || changes.stockFisico !== undefined || changes.stockPublicado !== undefined
      ? 'Stock'
      : changes.estado !== undefined
      ? 'Estado'
      : changes.portadaFondoBlanco !== undefined || changes.fichaTecnicaCompleta !== undefined
      ? 'SEO/Fotos'
      : 'General';

    const logs = selectedIds.map((pid) => ({
      publicacion_id: pid,
      user_id: user.id,
      tipo_cambio: tipoAuditoria,
      nota: actionSummary,
    }));
    await supabase.from('historial_actualizaciones').insert(logs);

    await cargarPublicaciones();
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar permanentemente las ${selectedIds.length} publicaciones seleccionadas? Esta acción no se puede deshacer.`
    );
    if (!confirmacion) return;

    setIsBulkDeleting(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('publicaciones')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      setPublicaciones((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Error al eliminar en lote: ${e.message}`);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="w-full">
      {/* 1. NAVBAR SUPERIOR: Flotando libremente por fuera del gran contenedor (Exacto a la imagen) */}
      <Navbar
        userEmail={userEmail}
        totalAlertas={totalAlertas}
        onNuevaPublicacion={handleAbrirNuevo}
        onExportarCSV={handleExportar}
        onFiltrarAlertas={handleFiltrarAlertas}
        onAbrirImportar={() => setIsImportModalOpen(true)}
      />

      {/* 2. ÁREA CENTRAL: Mini Sidebar Izquierda + GRAN CONTENEDOR DE VIDRIO (Exacto a la imagen) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 relative">
        
        {/* Rail de Navegación Lateral Izquierdo (Exacto a la barra lateral de la imagen) */}
        <div className="hidden 2xl:flex flex-col gap-2 p-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-xl absolute -left-14 top-16 z-30">
          <button
            onClick={() => {
              setActiveTab('command');
              setTimeFilter('todos');
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'command'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Command Center"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Tendencias & Métricas"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            onClick={handleFiltrarAlertas}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              activeTab === 'alerts'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
            title="Alertas de Inventario"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleAbrirNuevo}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
            title="Nueva Publicación"
          >
            <Briefcase className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition"
            title="Importar Excel / CSV de Mercado Libre"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* EL GRAN CONTENEDOR DE CRISTAL (VENTANA PRINCIPAL) */}
        {/* ======================================================== */}
        <main className="rounded-[32px] sm:rounded-[40px] border border-white/[0.12] bg-white/[0.02] sm:bg-[#141210]/40 backdrop-blur-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] p-5 sm:p-8 space-y-6 relative overflow-hidden">
          
          {/* Banner de error de Supabase si aplica */}
          {errorStatus && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-200 text-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{errorStatus}</span>
              </div>
              <button
                onClick={cargarPublicaciones}
                className="p-1 hover:bg-white/10 rounded-lg text-amber-300"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* COMMAND CENTER HEADER INTERNO (Dentro del gran contenedor) */}
          {/* ======================================================== */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Command Center
              </h1>
              <p className="text-sm text-white/50 mt-1">
                Inventario, márgenes netos y lo que requiere tu atención.
              </p>
            </div>

            {/* Selector de Píldoras de Filtro (Catálogo | Solo Activas | Con Alertas | Métricas) */}
            <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/10 text-xs font-semibold backdrop-blur-md">
              <button
                onClick={() => {
                  setTimeFilter('todos');
                  setActiveTab('command');
                }}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  timeFilter === 'todos' && activeTab === 'command'
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Catálogo
              </button>
              <button
                onClick={() => {
                  setTimeFilter('activas');
                  setActiveTab('command');
                }}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  timeFilter === 'activas' && activeTab === 'command'
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Solo Activas
              </button>
              <button
                onClick={() => {
                  setTimeFilter('alertas');
                  setActiveTab('alerts');
                }}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  timeFilter === 'alertas' || activeTab === 'alerts'
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>Con Alertas</span>
                {totalAlertas > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-cyan-400 text-black shadow-md font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Métricas</span>
              </button>
            </div>
          </div>

          {/* VISTA CONDICIONAL: ANALYTICS CON APEXCHARTS vs COMMAND CENTER */}
          {activeTab === 'analytics' ? (
            <AnalyticsDashboard
              publicaciones={publicaciones}
              onVolverAlCommandCenter={() => setActiveTab('command')}
            />
          ) : (
            <>
              {/* ======================================================== */}
              {/* BENTO GRID SUPERIOR: FINANZAS + 2x2 MINI CARDS + CHART */}
              {/* ======================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7">
                  <KpiCards
                    publicaciones={publicaciones}
                    onNuevaPublicacion={handleAbrirNuevo}
                    onFiltrarAlertas={handleFiltrarAlertas}
                  />
                </div>

                <div className="lg:col-span-5">
                  <InventoryChart publicaciones={publicaciones} />
                </div>
              </div>

              {/* ======================================================== */}
              {/* BENTO GRID INTERMEDIO: SCORE SEO & ACCIONES URGENTES */}
              {/* ======================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SeoProgressCard publicaciones={publicaciones} />
                <UrgentActionsCard
                  publicaciones={publicaciones}
                  onSeleccionarPublicacion={handleAbrirEditar}
                />
              </div>

              {/* ======================================================== */}
              {/* TABLA PRINCIPAL: CATÁLOGO DE PUBLICACIONES */}
              {/* ======================================================== */}
              <PublicacionTable
                publicaciones={publicacionesFiltradas}
                onEditar={handleAbrirEditar}
                onVerHistorial={handleAbrirHistorial}
                onEliminar={handleEliminarPublicacion}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedEstado={selectedEstado}
                onEstadoChange={setSelectedEstado}
                onAbrirImportar={() => setIsImportModalOpen(true)}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onClearSelection={handleClearSelection}
                onQuickStockUpdate={handleQuickUpdateStock}
              />
            </>
          )}
        </main>
      </div>

      {/* Floating Bottom Dock */}
      <BottomDock
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'alerts') setTimeFilter('alertas');
          if (tab === 'command') setTimeFilter('todos');
        }}
        totalAlertas={totalAlertas}
      />

      {/* Barra Flotante de Acciones Masivas */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        totalCount={publicacionesFiltradas.length}
        onClearSelection={handleClearSelection}
        onOpenBulkEdit={handleOpenBulkEdit}
        onDeleteSelected={handleBulkDelete}
        isDeleting={isBulkDeleting}
      />

      {/* Modal de Edición Masiva */}
      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedCount={selectedIds.length}
        initialTab={bulkEditTab}
        onApplyChanges={handleApplyBulkChanges}
      />

      {/* Modal Crear / Editar */}
      <PublicacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleGuardarPublicacion}
        publicacionParaEditar={publicacionParaEditar}
      />

      {/* Modal Importar Masivo Excel / CSV */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={cargarPublicaciones}
      />

      {/* Drawer Bitácora */}
      <HistorialDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        publicacion={publicacionParaHistorial}
      />
    </div>
  );
}
