'use client';

import React from 'react';

interface NexusLogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
}

export function NexusLogo({
  className = 'w-10 h-10',
  size,
  showGlow = true,
}: NexusLogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={style}>
      {/* Resplandor ambiental de fondo */}
      {showGlow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/30 via-indigo-500/25 to-purple-600/30 blur-md pointer-events-none -z-10" />
      )}

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,242,254,0.25)]"
      >
        <defs>
          {/* Gradiente Pilar Izquierdo: Cyan a Azul Eléctrico */}
          <linearGradient id="nexus-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          {/* Gradiente Diagonal Central: Luz de cruce / Conexión Nexus */}
          <linearGradient id="nexus-grad-diag" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          {/* Gradiente Pilar Derecho: Violeta Neón a Magenta */}
          <linearGradient id="nexus-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#7E22CE" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>

          {/* Gradiente Fondo Obsidian Glass */}
          <linearGradient id="nexus-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1B18" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0F0E0D" stopOpacity="0.95" />
          </linearGradient>

          {/* Filtro de resplandor para nodos */}
          <filter id="nexus-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Squircle de cristal oscuro con borde fino */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="26"
          fill="url(#nexus-bg-grad)"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1.5"
        />

        {/* Pilar Izquierdo del 'N' */}
        <path
          d="M26 72V30C26 27.2386 28.2386 25 31 25H35C37.7614 25 40 27.2386 40 30V72C40 74.7614 37.7614 77 35 77H31C28.2386 77 26 74.7614 26 72Z"
          fill="url(#nexus-grad-1)"
        />

        {/* Diagonal central entrelazada */}
        <path
          d="M31.5 25.5C33.5 23.5 37 24.5 39 27L68.5 72.5C70.5 75.5 68.5 78.5 65 78.5H59C56 78.5 53.5 76.5 51.5 73.5L28.5 31C27 28.5 29 25.5 31.5 25.5Z"
          fill="url(#nexus-grad-diag)"
          filter="url(#nexus-glow)"
        />

        {/* Pilar Derecho del 'N' */}
        <path
          d="M60 70V28C60 25.2386 62.2386 23 65 23H69C71.7614 23 74 25.2386 74 28V70C74 72.7614 71.7614 75 69 75H65C62.2386 75 60 72.7614 60 70Z"
          fill="url(#nexus-grad-2)"
        />

        {/* Punto de luz / Nodo Nexus en el centro del cruce */}
        <circle cx="50" cy="50" r="3.5" fill="#FFFFFF" filter="url(#nexus-glow)" opacity="0.9" />
        <circle cx="50" cy="50" r="6" stroke="#67E8F9" strokeWidth="1.5" opacity="0.5" />
      </svg>
    </div>
  );
}
