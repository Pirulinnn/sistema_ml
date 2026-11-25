import { Publicacion, TipoCambioAuditoria } from '@/types/database';

export interface DiferenciaDetectada {
  campo: string;
  anterior: string | number | boolean | null;
  nuevo: string | number | boolean | null;
}

export function detectarCambios(
  anterior: Publicacion,
  nuevo: Partial<Publicacion>
): {
  tipo: TipoCambioAuditoria;
  diferencias: DiferenciaDetectada[];
  resumenAutomatico: string;
} {
  const diferencias: DiferenciaDetectada[] = [];

  // Comprobar Precio
  if (nuevo.precio_usd !== undefined && Number(nuevo.precio_usd) !== Number(anterior.precio_usd)) {
    diferencias.push({
      campo: 'Precio',
      anterior: `$${Number(anterior.precio_usd).toFixed(2)}`,
      nuevo: `$${Number(nuevo.precio_usd).toFixed(2)}`,
    });
  }

  // Comprobar Stocks
  const stockFisicoCambio =
    nuevo.stock_fisico !== undefined && nuevo.stock_fisico !== anterior.stock_fisico;
  const stockPublicadoCambio =
    nuevo.stock_publicado !== undefined && nuevo.stock_publicado !== anterior.stock_publicado;

  if (stockFisicoCambio) {
    diferencias.push({
      campo: 'Stock Físico',
      anterior: anterior.stock_fisico,
      nuevo: nuevo.stock_fisico!,
    });
  }

  if (stockPublicadoCambio) {
    diferencias.push({
      campo: 'Stock Publicado',
      anterior: anterior.stock_publicado,
      nuevo: nuevo.stock_publicado!,
    });
  }

  // Comprobar Estado
  if (nuevo.estado !== undefined && nuevo.estado !== anterior.estado) {
    diferencias.push({
      campo: 'Estado',
      anterior: anterior.estado,
      nuevo: nuevo.estado,
    });
  }

  // Comprobar Tipo o Comisión
  if (
    (nuevo.tipo_publicacion !== undefined && nuevo.tipo_publicacion !== anterior.tipo_publicacion) ||
    (nuevo.porcentaje_comision !== undefined &&
      Number(nuevo.porcentaje_comision) !== Number(anterior.porcentaje_comision))
  ) {
    diferencias.push({
      campo: 'Comisión/Tipo',
      anterior: `${anterior.tipo_publicacion} (${anterior.porcentaje_comision}%)`,
      nuevo: `${nuevo.tipo_publicacion ?? anterior.tipo_publicacion} (${nuevo.porcentaje_comision ?? anterior.porcentaje_comision}%)`,
    });
  }

  // Comprobar SEO y Fotos
  const seoCambios: string[] = [];
  if (
    nuevo.portada_fondo_blanco !== undefined &&
    nuevo.portada_fondo_blanco !== anterior.portada_fondo_blanco
  ) {
    seoCambios.push(`Fondo blanco: ${nuevo.portada_fondo_blanco ? 'Sí' : 'No'}`);
  }
  if (
    nuevo.ficha_tecnica_completa !== undefined &&
    nuevo.ficha_tecnica_completa !== anterior.ficha_tecnica_completa
  ) {
    seoCambios.push(`Ficha técnica: ${nuevo.ficha_tecnica_completa ? 'Sí' : 'No'}`);
  }
  if (
    nuevo.palabras_clave_seo !== undefined &&
    nuevo.palabras_clave_seo !== anterior.palabras_clave_seo
  ) {
    seoCambios.push(`Palabras clave: ${nuevo.palabras_clave_seo ? 'Sí' : 'No'}`);
  }
  if (
    nuevo.envio_gratis !== undefined &&
    nuevo.envio_gratis !== anterior.envio_gratis
  ) {
    seoCambios.push(`Envío gratis: ${nuevo.envio_gratis ? 'Sí' : 'No'}`);
  }

  if (seoCambios.length > 0) {
    diferencias.push({
      campo: 'Optimización SEO/Fotos',
      anterior: 'Anterior',
      nuevo: seoCambios.join(', '),
    });
  }

  // Determinar Tipo de Cambio predominante
  let tipo: TipoCambioAuditoria = 'General';
  if (diferencias.length === 1 && diferencias[0].campo === 'Precio') {
    tipo = 'Precio';
  } else if (stockFisicoCambio || stockPublicadoCambio) {
    tipo = 'Stock';
  } else if (diferencias.some((d) => d.campo === 'Estado')) {
    tipo = 'Estado';
  } else if (seoCambios.length > 0 && diferencias.length === 1) {
    tipo = 'SEO/Fotos';
  }

  // Resumen legible
  const resumenAutomatico =
    diferencias.length > 0
      ? diferencias
          .map((d) => `${d.campo}: ${d.anterior} ➔ ${d.nuevo}`)
          .join(' | ')
      : 'Actualización general sin cambios en campos principales';

  return {
    tipo,
    diferencias,
    resumenAutomatico,
  };
}
