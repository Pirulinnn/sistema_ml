'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Publicacion } from '@/types/database';
import { calcularComision } from '@/lib/utils/comisiones';
import { useExchangeRate } from '@/context/ExchangeRateContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Package,
} from 'lucide-react';

// Carga dinámica de ApexCharts para evitar errores de SSR en Next.js
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface AnalyticsDashboardProps {
  publicaciones: Publicacion[];
  onVolverAlCommandCenter: () => void;
}

export function AnalyticsDashboard({
  publicaciones,
  onVolverAlCommandCenter,
}: AnalyticsDashboardProps) {
  const { formatearBs, formatearUsd, tasaActiva, nombreTasaActiva } = useExchangeRate();
  const [monedaVista, setMonedaVista] = useState<'USD' | 'VES'>('USD');

  // Cálculos agregados
  const metricas = useMemo(() => {
    let stockFisicoTotal = 0;
    let stockPublicadoTotal = 0;
    let valorTotalInventarioUsd = 0;
    let totalComisionesUsd = 0;
    let totalNetoUsd = 0;
    let sobreventasCount = 0;
    let sinStockCount = 0;

    const porTipo: Record<string, { count: number; venta: number; neto: number; comision: number }> = {
      Clásica: { count: 0, venta: 0, neto: 0, comision: 0 },
      Premium: { count: 0, venta: 0, neto: 0, comision: 0 },
      Gratuita: { count: 0, venta: 0, neto: 0, comision: 0 },
    };

    publicaciones.forEach((p) => {
      const fisico = p.stock_fisico || 0;
      const publicado = p.stock_publicado || 0;
      const precio = Number(p.precio_usd) || 0;
      const comisionPorc = Number(p.porcentaje_comision) || 0;
      const { montoComision, ingresoNeto } = calcularComision(precio, comisionPorc);

      stockFisicoTotal += fisico;
      stockPublicadoTotal += publicado;
      valorTotalInventarioUsd += fisico * precio;
      totalComisionesUsd += fisico * montoComision;
      totalNetoUsd += fisico * ingresoNeto;

      if (publicado > fisico) sobreventasCount++;
      if (fisico === 0) sinStockCount++;

      const tipo = p.tipo_publicacion || 'Clásica';
      if (!porTipo[tipo]) {
        porTipo[tipo] = { count: 0, venta: 0, neto: 0, comision: 0 };
      }
      porTipo[tipo].count += 1;
      porTipo[tipo].venta += fisico * precio;
      porTipo[tipo].neto += fisico * ingresoNeto;
      porTipo[tipo].comision += fisico * montoComision;
    });

    return {
      stockFisicoTotal,
      stockPublicadoTotal,
      valorTotalInventarioUsd,
      totalComisionesUsd,
      totalNetoUsd,
      sobreventasCount,
      sinStockCount,
      porTipo,
    };
  }, [publicaciones]);

  // Factor de conversión para gráficos según moneda activa
  const multiplicador = monedaVista === 'USD' ? 1 : tasaActiva;
  const prefijoMoneda = monedaVista === 'USD' ? '$' : 'Bs. ';

  // 1. Datos para GRÁFICO 1: Grouped Bar Chart (Stock Físico vs Publicado por Top 8 Publicaciones)
  const topPublicaciones = useMemo(() => {
    return [...publicaciones]
      .sort((a, b) => ((b.stock_fisico || 0) + (b.stock_publicado || 0)) - ((a.stock_fisico || 0) + (a.stock_publicado || 0)))
      .slice(0, 8);
  }, [publicaciones]);

  const stockChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 320,
      toolbar: { show: false },
      background: 'transparent',
    },
    theme: { mode: 'dark' },
    colors: ['#00E396', '#FF4560'], // Verde esmeralda (Físico) vs Rojo neón (Publicado)
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 6,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: topPublicaciones.map((p) =>
        p.codigo_ml ? p.codigo_ml.substring(0, 10) : p.titulo.substring(0, 10)
      ),
      labels: {
        style: { colors: 'rgba(255, 255, 255, 0.6)', fontSize: '11px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: 'Unidades', style: { color: 'rgba(255, 255, 255, 0.4)' } },
      labels: { style: { colors: 'rgba(255, 255, 255, 0.6)' } },
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.06)',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val, opts) => {
          const item = opts?.dataPointIndex !== undefined ? topPublicaciones[opts.dataPointIndex] : null;
          const titulo = item ? item.titulo : '';
          return `${val} unidades ${titulo ? `— ${titulo}` : ''}`;
        },
      },
    },
    legend: {
      position: 'top',
      labels: { colors: 'rgba(255, 255, 255, 0.8)' },
    },
  };

  const stockChartSeries = [
    {
      name: 'Stock Físico (Almacén)',
      data: topPublicaciones.map((p) => p.stock_fisico || 0),
    },
    {
      name: 'Stock Publicado (Mercado Libre)',
      data: topPublicaciones.map((p) => p.stock_publicado || 0),
    },
  ];

  // 2. Datos para GRÁFICO 2: Stacked Bar Chart (Ingresos Netos vs Comisión ML por Tipo)
  const tiposKeys = ['Clásica', 'Premium', 'Gratuita'];
  const profitabilityChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      height: 320,
      toolbar: { show: false },
      background: 'transparent',
    },
    theme: { mode: 'dark' },
    colors: ['#10B981', '#F43F5E'], // Verde (Neto) + Rosa (Comisión ML)
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '45%',
      },
    },
    xaxis: {
      categories: tiposKeys,
      labels: {
        style: { colors: 'rgba(255, 255, 255, 0.6)' },
        formatter: (val) => `${prefijoMoneda}${Number(val).toLocaleString('es-VE')}`,
      },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: { style: { colors: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' } },
    },
    grid: {
      borderColor: 'rgba(255, 255, 255, 0.06)',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val) => `${prefijoMoneda}${Number(val).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`,
      },
    },
    legend: {
      position: 'top',
      labels: { colors: 'rgba(255, 255, 255, 0.8)' },
    },
  };

  const profitabilityChartSeries = [
    {
      name: 'Margen Neto Real',
      data: tiposKeys.map((k) => Number((metricas.porTipo[k].neto * multiplicador).toFixed(2))),
    },
    {
      name: 'Comisión Mercado Libre',
      data: tiposKeys.map((k) => Number((metricas.porTipo[k].comision * multiplicador).toFixed(2))),
    },
  ];

  // 3. Datos para GRÁFICO 3: Donut Chart de Estado de Catálogo
  const estadoCounts = useMemo(() => {
    const counts: Record<string, number> = { Activa: 0, Pausada: 0, 'Sin Stock': 0 };
    publicaciones.forEach((p) => {
      const e = p.estado || 'Activa';
      counts[e] = (counts[e] || 0) + 1;
    });
    return counts;
  }, [publicaciones]);

  const donutOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      height: 280,
      background: 'transparent',
    },
    theme: { mode: 'dark' },
    colors: ['#00E396', '#FEB019', '#775DD0', '#FF4560'],
    labels: Object.keys(estadoCounts),
    stroke: { width: 0 },
    legend: {
      position: 'bottom',
      labels: { colors: 'rgba(255, 255, 255, 0.7)' },
    },
    dataLabels: {
      enabled: true,
      dropShadow: { enabled: false },
    },
  };

  const donutSeries = Object.values(estadoCounts);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header de la Vista de Métricas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Métricas & Inteligencia de Catálogo
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Analítica de discrepancias de stock, proyecciones en {nombreTasaActiva} y distribución de comisiones.
          </p>
        </div>

        {/* Controles de Moneda y Retorno */}
        <div className="flex items-center gap-3">
          {/* Selector de Moneda de Gráficos */}
          <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/10 text-xs font-semibold backdrop-blur-md">
            <button
              onClick={() => setMonedaVista('USD')}
              className={`px-3 py-1 rounded-full transition ${
                monedaVista === 'USD'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setMonedaVista('VES')}
              className={`px-3 py-1 rounded-full transition flex items-center gap-1 ${
                monedaVista === 'VES'
                  ? 'bg-emerald-400 text-black shadow-md font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>Bolívares (Bs.)</span>
              <span className="text-[10px] opacity-70">BCV</span>
            </button>
          </div>

          <button
            onClick={onVolverAlCommandCenter}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white border border-white/10 transition"
          >
            <span>Ver Tabla</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Métricas Rápidas en Vidrio Translúcido */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.035] border border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold text-white/40 uppercase block">
            Valor de Almacén ({monedaVista})
          </span>
          <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
            {monedaVista === 'USD'
              ? formatearUsd(metricas.valorTotalInventarioUsd)
              : formatearBs(metricas.valorTotalInventarioUsd)}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {metricas.stockFisicoTotal} unidades físicas
          </span>
        </div>

        <div className="bg-white/[0.035] border border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold text-white/40 uppercase block">
            Margen Neto Total ({monedaVista})
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
            {monedaVista === 'USD'
              ? formatearUsd(metricas.totalNetoUsd)
              : formatearBs(metricas.totalNetoUsd)}
          </span>
          <span className="text-[10px] text-white/40 mt-1 block">
            Después de comisiones ML
          </span>
        </div>

        <div className="bg-white/[0.035] border border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold text-white/40 uppercase block">
            Comisiones Retenidas ({monedaVista})
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-400 mt-1 block">
            {monedaVista === 'USD'
              ? formatearUsd(metricas.totalComisionesUsd)
              : formatearBs(metricas.totalComisionesUsd)}
          </span>
          <span className="text-[10px] text-white/40 mt-1 block">
            Costo operativo en Mercado Libre
          </span>
        </div>

        <div className="bg-white/[0.035] border border-white/[0.08] rounded-2xl p-4 backdrop-blur-xl">
          <span className="text-[10px] font-semibold text-white/40 uppercase block">
            Riesgo de Sobreventa
          </span>
          <span
            className={`text-xl sm:text-2xl font-black mt-1 block ${
              metricas.sobreventasCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {metricas.sobreventasCount}{' '}
            <span className="text-xs font-normal text-white/60">publicaciones</span>
          </span>
          <span className="text-[10px] text-white/40 mt-1 block">
            {metricas.sobreventasCount > 0 ? 'Stock publicado > físico' : 'Inventario equilibrado'}
          </span>
        </div>
      </div>

      {/* Grid de Gráficos ApexCharts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* GRÁFICO 1: Grouped Bar Chart (Stock Físico vs Publicado) */}
        <div className="lg:col-span-7 bg-white/[0.035] border border-white/[0.08] rounded-[28px] p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Discrepancia de Stock (Top Publicaciones)</span>
              </h3>
              <p className="text-[11px] text-white/40">
                Comparativa de unidades en almacén vs unidades publicadas en Mercado Libre
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              ApexCharts Grouped
            </span>
          </div>

          <div className="min-h-[320px]">
            {topPublicaciones.length > 0 ? (
              <ReactApexChart
                options={stockChartOptions}
                series={stockChartSeries}
                type="bar"
                height={320}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-white/40">
                No hay publicaciones registradas para graficar.
              </div>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: Stacked Horizontal Bar (Margen Neto vs Comisión) */}
        <div className="lg:col-span-5 bg-white/[0.035] border border-white/[0.08] rounded-[28px] p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Rendimiento Neto vs Comisión
              </h3>
              <p className="text-[11px] text-white/40">
                Distribución por tipo de publicación en {monedaVista}
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Stacked
            </span>
          </div>

          <div className="min-h-[320px]">
            {publicaciones.length > 0 ? (
              <ReactApexChart
                options={profitabilityChartOptions}
                series={profitabilityChartSeries}
                type="bar"
                height={320}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-white/40">
                Sin datos suficientes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila Inferior de Gráficos: Donut de Estados + Resumen Estratégico */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* GRÁFICO 3: Donut Estado de Publicaciones */}
        <div className="md:col-span-5 bg-white/[0.035] border border-white/[0.08] rounded-[28px] p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-2">
          <h3 className="text-sm font-bold text-white">
            Distribución por Estado
          </h3>
          <p className="text-[11px] text-white/40">
            Proporción de publicaciones activas, pausadas o sin stock
          </p>

          <div className="min-h-[260px] flex items-center justify-center">
            {donutSeries.some((s) => s > 0) ? (
              <ReactApexChart
                options={donutOptions}
                series={donutSeries}
                type="donut"
                height={260}
              />
            ) : (
              <div className="text-xs text-white/40">No hay publicaciones activas.</div>
            )}
          </div>
        </div>

        {/* Resumen de Auditoría y Consejos de Optimización */}
        <div className="md:col-span-7 bg-white/[0.035] border border-white/[0.08] rounded-[28px] p-5 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Recomendaciones Automáticas de Nexus ML
              </h3>
            </div>
            <p className="text-xs text-white/60 mb-4">
              Análisis predictivo basado en tu catálogo actual y comisiones de Mercado Libre:
            </p>

            <div className="space-y-2.5">
              {metricas.sobreventasCount > 0 ? (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">Riesgo Alto de Penalización ML</strong>
                    Tienes {metricas.sobreventasCount} publicaciones con más stock anunciado del que tienes físicamente en almacén. Pausa o ajusta el stock antes de que ocurra una venta sin producto.
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">Inventario Saludable</strong>
                    No tienes discrepancias de sobreventa registradas. Todo tu catálogo publicado está respaldado por stock físico.
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/70 flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-bold">Impacto de la Tasa de Cambio</strong>
                  Al cotizar a tasa <span className="text-emerald-300 font-bold">{nombreTasaActiva} (Bs. {tasaActiva.toLocaleString('es-VE')})</span>, tu margen neto consolidado equivale a <span className="text-emerald-300 font-bold font-mono">{formatearBs(metricas.totalNetoUsd)}</span>. Mantén tus precios actualizados si la tasa del BCV varía.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/40">
            <span>Motor de gráficos impulsado por ApexCharts</span>
            <button
              onClick={onVolverAlCommandCenter}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Volver al Command Center</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
