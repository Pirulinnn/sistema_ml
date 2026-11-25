'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useExchangeRate, TipoTasa } from '@/context/ExchangeRateContext';
import { RefreshCw, ChevronDown, Check, DollarSign, TrendingUp, Landmark, Edit3 } from 'lucide-react';

export function ExchangeRateWidget() {
  const {
    tasas,
    tasaSeleccionada,
    tasaActiva,
    nombreTasaActiva,
    isCargando,
    setTasaSeleccionada,
    setTasaCustom,
    actualizarTasas,
  } = useExchangeRate();

  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState(tasas.custom.toString());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGuardarCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customInput.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      setTasaCustom(val);
      setTasaSeleccionada('custom');
      setIsOpen(false);
    }
  };

  const opciones: { id: TipoTasa; label: string; valor: number; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'bcv',
      label: 'Dólar BCV',
      valor: tasas.bcv,
      icon: <Landmark className="w-3.5 h-3.5 text-emerald-400" />,
      desc: 'Tasa oficial del Banco Central de Venezuela',
    },
    {
      id: 'paralelo',
      label: 'Paralelo / Promedio',
      valor: tasas.paralelo,
      icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" />,
      desc: 'Cotización mercado libre / promedio',
    },
    {
      id: 'euro',
      label: 'Euro BCV',
      valor: tasas.euro,
      icon: <DollarSign className="w-3.5 h-3.5 text-cyan-400" />,
      desc: 'Tasa oficial Euro del BCV',
    },
    {
      id: 'custom',
      label: 'Personalizada',
      valor: tasas.custom,
      icon: <Edit3 className="w-3.5 h-3.5 text-purple-400" />,
      desc: 'Tasa manual definida por ti',
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Cápsula Principal */}
      <div className="flex items-center gap-1 bg-[#1e1b18]/80 hover:bg-[#282420] border border-white/10 rounded-full p-1 pl-3 transition shadow-inner">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white transition"
          title="Cambiar tipo de cambio de conversión"
        >
          {/* Indicador con bandera o dot */}
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-300">
            {nombreTasaActiva}:
          </span>
          <span className="font-mono text-xs font-bold text-white tracking-wide">
            Bs. {tasaActiva.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <ChevronDown
            className={`w-3 h-3 text-white/50 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {/* Botón refrescar */}
        <button
          onClick={() => actualizarTasas()}
          disabled={isCargando}
          title="Actualizar tasas en vivo desde BCV"
          className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${isCargando ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Popover / Menú Desplegable de Tasas */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#141210]/95 border border-white/15 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-3 z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-white">Tasas de Cambio</span>
              <p className="text-[10px] text-white/40">Conversión automática en todo el sistema</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              En Vivo
            </span>
          </div>

          {/* Lista de Tasas */}
          <div className="space-y-1.5">
            {opciones.map((op) => {
              const activa = tasaSeleccionada === op.id;
              return (
                <button
                  key={op.id}
                  onClick={() => {
                    setTasaSeleccionada(op.id);
                    if (op.id !== 'custom') setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                    activa
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'hover:bg-white/5 text-white/70 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/10">
                      {op.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {op.label}
                        {activa && <Check className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-white/40 leading-none mt-0.5">{op.desc}</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-white">
                    Bs. {op.valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Editor de Tasa Personalizada */}
          {tasaSeleccionada === 'custom' && (
            <form onSubmit={handleGuardarCustom} className="mt-2.5 pt-2 border-t border-white/10">
              <label className="block text-[10px] text-white/60 font-semibold mb-1">
                Definir tasa personalizada (Bs. / USD):
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ej: 930.50"
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition"
                >
                  Fijar
                </button>
              </div>
            </form>
          )}

          {/* Footer del Popover */}
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
            <span>Actualizado: {tasas.ultimaActualizacion}</span>
            <button
              onClick={() => actualizarTasas()}
              disabled={isCargando}
              className="text-cyan-400 hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isCargando ? 'animate-spin' : ''}`} />
              Refrescar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
