import { Publicacion } from '@/types/database';
import { calcularComision } from './comisiones';

export function exportarPublicacionesACSV(publicaciones: Publicacion[], nombreArchivo = 'inventario_mercado_libre.csv') {
  if (!publicaciones || publicaciones.length === 0) {
    return;
  }

  const encabezados = [
    'Código ML',
    'SKU',
    'Título',
    'Estado',
    'Tipo Publicación',
    'Precio (USD)',
    'Comisión (%)',
    'Monto Comisión (USD)',
    'Ingreso Neto Est. (USD)',
    'Stock Físico',
    'Stock Publicado',
    'Alerta Sobreventa',
    'Stock Crítico',
    'Portada Blanca',
    'Ficha Técnica',
    'Keywords SEO',
    'Envío Gratis',
    'URL ML',
    'Fecha Creación',
    'Última Actualización',
  ];

  const escapeCSV = (valor: string | number | boolean | null | undefined): string => {
    if (valor === null || valor === undefined) return '""';
    const texto = String(valor).replace(/"/g, '""');
    return `"${texto}"`;
  };

  const filas = publicaciones.map((item) => {
    const { montoComision, ingresoNeto } = calcularComision(
      item.precio_usd,
      item.porcentaje_comision
    );

    const alertaSobreventa = item.stock_publicado > item.stock_fisico ? 'SÍ (RIESGO)' : 'NO';
    const stockCritico = item.stock_fisico <= 1 ? 'SÍ (CRÍTICO)' : 'NO';

    return [
      escapeCSV(item.codigo_ml),
      escapeCSV(item.sku || 'N/A'),
      escapeCSV(item.titulo),
      escapeCSV(item.estado),
      escapeCSV(item.tipo_publicacion),
      Number(item.precio_usd).toFixed(2),
      Number(item.porcentaje_comision).toFixed(2),
      montoComision.toFixed(2),
      ingresoNeto.toFixed(2),
      item.stock_fisico,
      item.stock_publicado,
      escapeCSV(alertaSobreventa),
      escapeCSV(stockCritico),
      escapeCSV(item.portada_fondo_blanco ? 'Sí' : 'No'),
      escapeCSV(item.ficha_tecnica_completa ? 'Sí' : 'No'),
      escapeCSV(item.palabras_clave_seo ? 'Sí' : 'No'),
      escapeCSV(item.envio_gratis ? 'Sí' : 'No'),
      escapeCSV(item.url || ''),
      escapeCSV(new Date(item.created_at).toLocaleString('es-ES')),
      escapeCSV(new Date(item.updated_at).toLocaleString('es-ES')),
    ].join(';');
  });

  // \uFEFF añade BOM UTF-8 para garantizar que Microsoft Excel interprete correctamente tildes y caracteres especiales
  const contenidoCSV = '\uFEFF' + [encabezados.join(';'), ...filas].join('\r\n');
  const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement('a');
  enlace.setAttribute('href', url);
  enlace.setAttribute('download', nombreArchivo);
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
