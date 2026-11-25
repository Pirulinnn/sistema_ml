import * as XLSX from 'xlsx';
import { PublicacionInsert, TipoPublicacion, EstadoPublicacion } from '@/types/database';
import { getComisionDefault } from './comisiones';

export interface ImportPreviewItem {
  codigo_ml: string;
  sku: string | null;
  titulo: string;
  precio_usd: number;
  tipo_publicacion: TipoPublicacion;
  porcentaje_comision: number;
  stock_publicado: number;
  stock_fisico: number;
  estado: EstadoPublicacion;
  url: string | null;
  portada_fondo_blanco: boolean;
  ficha_tecnica_completa: boolean;
  palabras_clave_seo: boolean;
  envio_gratis: boolean;
}

export interface ParseResult {
  items: ImportPreviewItem[];
  totalFilas: number;
  columnasDetectadas: string[];
  errores: string[];
}

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function normalizeTipoPublicacion(val: string): TipoPublicacion {
  const v = val.toLowerCase();
  if (v.includes('premium')) return 'Premium';
  if (v.includes('clasic') || v.includes('clásic')) return 'Clásica';
  if (v.includes('gratuita') || v.includes('gratis')) return 'Gratuita';
  return 'Clásica';
}

function normalizeEstado(val: string): EstadoPublicacion {
  const v = val.toLowerCase();
  if (v.includes('activa') || v.includes('activo')) return 'Activa';
  if (v.includes('pausa')) return 'Pausada';
  if (v.includes('sin stock') || v.includes('agotado')) return 'Sin Stock';
  if (v.includes('revision') || v.includes('revisión')) return 'En Revisión';
  if (v.includes('finaliz')) return 'Finalizada';
  return 'Activa';
}

function cleanPrice(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val)
    .replace(/[$€USD\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Number(num.toFixed(2));
}

function cleanStock(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.max(0, Math.floor(val));
  if (!val) return 0;
  const num = parseInt(String(val).replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? 0 : Math.max(0, num);
}

export async function parseMercadoLibreFile(
  file: File,
  inicializarStockFisicoIgual = true
): Promise<ParseResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('El archivo no contiene hojas de cálculo válidas.');
  }

  // Leer la primera hoja
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('El archivo no contiene filas de datos para importar.');
  }

  const columnasDetectadas = Object.keys(rawRows[0] || {});
  const errores: string[] = [];
  const items: ImportPreviewItem[] = [];

  rawRows.forEach((row, index) => {
    const rowNorm: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      rowNorm[normalizeKey(k)] = row[k];
    });

    // 1. Encontrar Código ML
    let rawCodigo =
      rowNorm['# de publicacion'] ||
      rowNorm['numero de publicacion'] ||
      rowNorm['codigo de publicacion'] ||
      rowNorm['codigo ml'] ||
      rowNorm['publicacion'] ||
      rowNorm['item_id'] ||
      rowNorm['id'] ||
      rowNorm['codigo'] ||
      '';

    // 2. Encontrar Título
    let rawTitulo =
      rowNorm['titulo'] ||
      rowNorm['title'] ||
      rowNorm['nombre de la publicacion'] ||
      rowNorm['nombre del producto'] ||
      rowNorm['nombre'] ||
      rowNorm['descripcion'] ||
      '';

    // Si no tiene código ni título, saltar fila vacía
    if (!rawCodigo && !rawTitulo) {
      return;
    }

    // Limpieza de código ML
    let codigo = String(rawCodigo).replace(/^#/, '').trim().toUpperCase();
    if (!codigo) {
      codigo = `ML-${Date.now().toString().slice(-6)}-${index + 1}`;
    }

    const titulo = String(rawTitulo).trim() || `Publicación ${codigo}`;

    // 3. Encontrar SKU
    const rawSku =
      rowNorm['sku'] ||
      rowNorm['codigo universal de producto'] ||
      rowNorm['codigo universal'] ||
      rowNorm['referencia'] ||
      rowNorm['modelo'] ||
      '';
    const sku = rawSku ? String(rawSku).trim() : null;

    // 4. Encontrar Precio
    const rawPrecio =
      rowNorm['precio'] ||
      rowNorm['precio actual'] ||
      rowNorm['precio (usd)'] ||
      rowNorm['precio de venta'] ||
      rowNorm['price'] ||
      0;
    const precio = cleanPrice(rawPrecio);

    // 5. Encontrar Stock Publicado
    const rawStock =
      rowNorm['stock disponible'] ||
      rowNorm['cantidad disponible'] ||
      rowNorm['stock publicado'] ||
      rowNorm['stock'] ||
      rowNorm['cantidad'] ||
      0;
    const stockPublicado = cleanStock(rawStock);
    const stockFisico = inicializarStockFisicoIgual ? stockPublicado : 0;

    // 6. Encontrar Tipo de Publicación
    const rawTipo =
      rowNorm['tipo de publicacion'] ||
      rowNorm['tipo'] ||
      rowNorm['modalidad'] ||
      'Clásica';
    const tipo = normalizeTipoPublicacion(String(rawTipo));
    const comision = getComisionDefault(tipo);

    // 7. Encontrar Estado
    const rawEstado =
      rowNorm['estado'] ||
      rowNorm['status'] ||
      rowNorm['condicion de la publicacion'] ||
      'Activa';
    const estado = normalizeEstado(String(rawEstado));

    // 8. Encontrar URL
    const rawUrl =
      rowNorm['enlace de la publicacion'] ||
      rowNorm['enlace'] ||
      rowNorm['url'] ||
      rowNorm['link'] ||
      '';
    const url = rawUrl ? String(rawUrl).trim() : null;

    // 9. Checklist SEO
    const envioGratis = Boolean(
      rowNorm['envio gratis'] ||
      rowNorm['envío gratis'] ||
      String(rowNorm['envio'] || '').toLowerCase().includes('gratis')
    );

    items.push({
      codigo_ml: codigo,
      sku,
      titulo,
      precio_usd: precio,
      tipo_publicacion: tipo,
      porcentaje_comision: comision,
      stock_publicado: stockPublicado,
      stock_fisico: stockFisico,
      estado,
      url,
      portada_fondo_blanco: true,
      ficha_tecnica_completa: true,
      palabras_clave_seo: true,
      envio_gratis: envioGratis,
    });
  });

  if (items.length === 0) {
    throw new Error(
      'No se pudieron extraer publicaciones válidas. Verifica que el archivo contenga columnas como "Título" y "# de publicación".'
    );
  }

  return {
    items,
    totalFilas: items.length,
    columnasDetectadas,
    errores,
  };
}
