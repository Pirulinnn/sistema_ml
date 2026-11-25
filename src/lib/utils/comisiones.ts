import { TipoPublicacion } from '@/types/database';

export function getComisionDefault(tipo: TipoPublicacion): number {
  switch (tipo) {
    case 'Gratuita':
      return 0.00;
    case 'Clásica':
      return 14.00;
    case 'Premium':
      return 19.00;
    default:
      return 0.00;
  }
}

export function calcularComision(
  precioUsd: number,
  porcentajeComision: number
): {
  montoComision: number;
  ingresoNeto: number;
} {
  const p = Math.max(0, Number(precioUsd) || 0);
  const c = Math.max(0, Number(porcentajeComision) || 0);
  const montoComision = Number(((p * c) / 100).toFixed(2));
  const ingresoNeto = Number((p - montoComision).toFixed(2));

  return {
    montoComision,
    ingresoNeto,
  };
}
