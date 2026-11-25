'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import FaultyTerminal from '@/components/ui/FaultyTerminal';
import { ShinyButton } from '@/components/ui/ShinyButton';
import { NexusLogo } from '@/components/ui/NexusLogo';
import {
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createClient();

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          router.push('/');
          router.refresh();
        } else {
          setSuccessMessage(
            '¡Cuenta creada exitosamente! Revisa tu correo de confirmación o inicia sesión si ya fue activada.'
          );
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(
        error.message || 'Ocurrió un error inesperado al procesar la solicitud.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 text-white overflow-hidden font-sans select-none">
      {/* ========================================================= */}
      {/* 1. FONDO INTERACTIVO REACT BITS (FaultyTerminal - Restaurado) */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-0">
        <FaultyTerminal
          tint="#38bdf8"
          glyphs="characters"
          glow={0.8}
          brightness={0.85}
          scanlineIntensity={0.2}
          glitchAmount={0.7}
          flickerAmount={0.7}
          noiseAmp={1.0}
          curvature={0.1}
          mouseReact={true}
          mouseStrength={0.35}
          mouseGlow={0.65}
          vignette={0.35}
          className="w-full h-full"
        />
      </div>

      {/* Tinte oscuro ambiental suave para contraste */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-slate-950/40" />

      {/* ========================================================= */}
      {/* 2. CARD PURA GLASSMORPHISM ULTRA-TRANSLÚCIDA */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-[36px] border border-white/60 bg-white/[0.04] backdrop-blur-3xl shadow-[0_16px_40px_0_rgba(0,0,0,0.55)] px-7 py-9 sm:px-9 sm:py-11 transition-all duration-300">
          
          {/* Header Izquierdo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <NexusLogo className="w-11 h-11" />
              <div>
                <span className="text-base font-extrabold tracking-wider text-white">
                  Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">ML</span>
                </span>
                <span className="block text-[11px] text-white/50 font-medium tracking-wide">
                  Command Center
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isSignUp ? 'Crear Cuenta' : 'Login'}
            </h1>
            <p className="text-sm text-white/80 mt-1.5 font-normal">
              {isSignUp
                ? 'Crea tu cuenta para comenzar a gestionar tu inventario'
                : 'Bienvenido de nuevo, ingresa a tu cuenta'}
            </p>
          </div>

          {/* Feedback de error / éxito */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-950/60 border border-rose-400/50 text-rose-100 text-xs flex items-center gap-2 backdrop-blur-md animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-400/50 text-emerald-100 text-xs flex items-center gap-2 backdrop-blur-md animate-in fade-in zoom-in-95">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Input Usuario / Email */}
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico / Usuario"
                className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-white/[0.04] border border-white/40 focus:border-white focus:bg-white/[0.08] text-white placeholder-white/60 text-sm outline-none transition-all duration-200"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-white/70">
                <Mail className="w-5 h-5" />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-white/[0.04] border border-white/40 focus:border-white focus:bg-white/[0.08] text-white placeholder-white/60 text-sm outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-white transition"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Checkbox Recordarme */}
            <div className="flex items-center gap-2 pt-1 pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-white/90 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-white/60 text-blue-600 bg-white/10 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blue-500"
                />
                <span>Recordarme</span>
              </label>
            </div>

            {/* Botón Principal Animado con ShinyButton */}
            <ShinyButton
              type="submit"
              disabled={loading}
              className="w-full text-base font-bold mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isSignUp ? 'Crear Cuenta' : 'Login'
              )}
            </ShinyButton>
          </form>

          {/* Footer Toggle */}
          <div className="mt-6 text-center">
            {isSignUp ? (
              <p className="text-xs text-white/80">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-white hover:underline ml-1"
                >
                  Login
                </button>
              </p>
            ) : (
              <p className="text-xs text-white/80">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-white hover:underline ml-1"
                >
                  Regístrate
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
