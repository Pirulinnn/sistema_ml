'use client';

import React from 'react';
import './ShinyButton.css';

export interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function ShinyButton({
  children,
  onClick,
  className = '',
  disabled,
  type = 'button',
  ...rest
}: ShinyButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`shiny-cta ${className}`}
      {...rest}
    >
      <span>{children}</span>
    </button>
  );
}
