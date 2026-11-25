'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type TipoTasa = 'bcv' | 'paralelo' | 'euro' | 'custom';

export interface TasasData {
  bcv: number;
  paralelo: number;
  euro: number;
  custom: number;
  ultimaActualizacion: string;
}

interface ExchangeRateContextType {
  tasas: TasasData;
  tasaSeleccionada: TipoTasa;
  tasaActiva: number;
  nombreTasaActiva: string;
  isCargando: boolean;
  error: string | null;
  setTasaSeleccionada: (tipo: TipoTasa) => void;
  setTasaCustom: (valor: number) => void;
  actualizarTasas: () => Promise<void>;
  convertirABs: (usd: number) => number;
  formatearBs: (usd: number) => string;
  formatearUsd: (usd: number) => string;
}

const DEFAULT_TASAS: TasasData = {
  bcv: 922.56,
  paralelo: 1097.54,
  euro: 1012.22,
  custom: 925.00,
  ultimaActualizacion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const STORAGE_KEY_TASAS = 'nexus_ml_tasas_data';
const STORAGE_KEY_SELECTED = 'nexus_ml_tasa_selected';

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined);

export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
  const [tasas, setTasas] = useState<TasasData>(DEFAULT_TASAS);
  const [tasaSeleccionada, setTasaSeleccionadaState] = useState<TipoTasa>('bcv');
  const [isCargando, setIsCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar estado guardado en localStorage al iniciar
  useEffect(() => {
    try {
      const savedTasas = localStorage.getItem(STORAGE_KEY_TASAS);
      const savedSelected = localStorage.getItem(STORAGE_KEY_SELECTED);

      if (savedTasas) {
        setTasas((prev) => ({ ...prev, ...JSON.parse(savedTasas) }));
      }
      if (savedSelected && ['bcv', 'paralelo', 'euro', 'custom'].includes(savedSelected)) {
        setTasaSeleccionadaState(savedSelected as TipoTasa);
      }
    } catch {
      // Ignorar errores de localStorage
    }

    // Auto-actualizar tasas en vivo
    fetchTasasEnVivo();
  }, []);

  const fetchTasasEnVivo = async () => {
    setIsCargando(true);
    setError(null);
    try {
      const [resDolares, resEuros] = await Promise.allSettled([
        fetch('https://ve.dolarapi.com/v1/dolares'),
        fetch('https://ve.dolarapi.com/v1/euros'),
      ]);

      let nuevoBcv = tasas.bcv;
      let nuevoParalelo = tasas.paralelo;
      let nuevoEuro = tasas.euro;
      let actualizo = false;

      if (resDolares.status === 'fulfilled' && resDolares.value.ok) {
        const dataDolares = await resDolares.value.json();
        const oficial = dataDolares.find((d: any) => d.fuente === 'oficial');
        const paralelo = dataDolares.find((d: any) => d.fuente === 'paralelo');
        if (oficial?.promedio) nuevoBcv = Number(oficial.promedio.toFixed(2));
        if (paralelo?.promedio) nuevoParalelo = Number(paralelo.promedio.toFixed(2));
        actualizo = true;
      }

      if (resEuros.status === 'fulfilled' && resEuros.value.ok) {
        const dataEuros = await resEuros.value.json();
        const oficialEuro = dataEuros.find((d: any) => d.fuente === 'oficial');
        if (oficialEuro?.promedio) nuevoEuro = Number(oficialEuro.promedio.toFixed(2));
        actualizo = true;
      }

      if (actualizo) {
        const nuevasTasas: TasasData = {
          ...tasas,
          bcv: nuevoBcv,
          paralelo: nuevoParalelo,
          euro: nuevoEuro,
          ultimaActualizacion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setTasas(nuevasTasas);
        localStorage.setItem(STORAGE_KEY_TASAS, JSON.stringify(nuevasTasas));
      }
    } catch (err: unknown) {
      const e = err as Error;
      setError('No se pudo conectar a la API de tasas. Se usa la última tasa en caché.');
      console.warn('Error fetching live rates:', e.message);
    } finally {
      setIsCargando(false);
    }
  };

  const setTasaSeleccionada = (tipo: TipoTasa) => {
    setTasaSeleccionadaState(tipo);
    try {
      localStorage.setItem(STORAGE_KEY_SELECTED, tipo);
    } catch {}
  };

  const setTasaCustom = (valor: number) => {
    if (isNaN(valor) || valor <= 0) return;
    const nuevasTasas = { ...tasas, custom: Number(valor.toFixed(2)) };
    setTasas(nuevasTasas);
    try {
      localStorage.setItem(STORAGE_KEY_TASAS, JSON.stringify(nuevasTasas));
    } catch {}
  };

  const getTasaActiva = useCallback((): { valor: number; nombre: string } => {
    switch (tasaSeleccionada) {
      case 'paralelo':
        return { valor: tasas.paralelo, nombre: 'Paralelo' };
      case 'euro':
        return { valor: tasas.euro, nombre: 'Euro BCV' };
      case 'custom':
        return { valor: tasas.custom, nombre: 'Manual' };
      case 'bcv':
      default:
        return { valor: tasas.bcv, nombre: 'BCV' };
    }
  }, [tasaSeleccionada, tasas]);

  const { valor: tasaActiva, nombre: nombreTasaActiva } = getTasaActiva();

  const convertirABs = useCallback(
    (usd: number): number => {
      const num = Number(usd) || 0;
      return Number((num * tasaActiva).toFixed(2));
    },
    [tasaActiva]
  );

  const formatearBs = useCallback(
    (usd: number): string => {
      const totalBs = convertirABs(usd);
      return new Intl.NumberFormat('es-VE', {
        style: 'currency',
        currency: 'VES',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
        .format(totalBs)
        .replace('VES', 'Bs.')
        .trim();
    },
    [convertirABs]
  );

  const formatearUsd = useCallback((usd: number): string => {
    const num = Number(usd) || 0;
    return `$${num.toFixed(2)}`;
  }, []);

  return (
    <ExchangeRateContext.Provider
      value={{
        tasas,
        tasaSeleccionada,
        tasaActiva,
        nombreTasaActiva,
        isCargando,
        error,
        setTasaSeleccionada,
        setTasaCustom,
        actualizarTasas: fetchTasasEnVivo,
        convertirABs,
        formatearBs,
        formatearUsd,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate() {
  const context = useContext(ExchangeRateContext);
  if (!context) {
    throw new Error('useExchangeRate debe ser utilizado dentro de un ExchangeRateProvider');
  }
  return context;
}
