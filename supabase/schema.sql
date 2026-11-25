-- =====================================================================
-- SISTEMA ADMINISTRATIVO DE CONTROL DE INVENTARIO Y PUBLICACIONES DE MERCADO LIBRE
-- Esquema de Base de Datos PostgreSQL / Supabase con RLS e Índices de Alto Rendimiento
-- =====================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabla Principal: publicaciones
CREATE TABLE IF NOT EXISTS public.publicaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    codigo_ml TEXT NOT NULL,
    sku TEXT,
    titulo TEXT NOT NULL,
    url TEXT,
    precio_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tipo_publicacion TEXT NOT NULL CHECK (tipo_publicacion IN ('Gratuita', 'Clásica', 'Premium')),
    porcentaje_comision NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    stock_fisico INTEGER NOT NULL DEFAULT 0 CHECK (stock_fisico >= 0),
    stock_publicado INTEGER NOT NULL DEFAULT 0 CHECK (stock_publicado >= 0),
    estado TEXT NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Pausada', 'Sin Stock', 'En Revisión', 'Finalizada')),
    portada_fondo_blanco BOOLEAN DEFAULT FALSE NOT NULL,
    ficha_tecnica_completa BOOLEAN DEFAULT FALSE NOT NULL,
    palabras_clave_seo BOOLEAN DEFAULT FALSE NOT NULL,
    envio_gratis BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Restricción de unicidad: Cada usuario no puede repetir el mismo código ML
    CONSTRAINT uq_publicaciones_user_codigo_ml UNIQUE (user_id, codigo_ml)
);

-- Comentarios explicativos
COMMENT ON TABLE public.publicaciones IS 'Almacena las publicaciones de Mercado Libre y su control de inventario dual';
COMMENT ON COLUMN public.publicaciones.stock_fisico IS 'Cantidad real de productos disponibles en el almacén';
COMMENT ON COLUMN public.publicaciones.stock_publicado IS 'Cantidad visible/publicada actualmente en Mercado Libre';

-- 3. Tabla de Trazabilidad: historial_actualizaciones
CREATE TABLE IF NOT EXISTS public.historial_actualizaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    publicacion_id UUID REFERENCES public.publicaciones(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo_cambio TEXT NOT NULL CHECK (tipo_cambio IN ('Creación', 'Precio', 'Stock', 'SEO/Fotos', 'Estado', 'General')),
    nota TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.historial_actualizaciones IS 'Bitácora cronológica de auditoría de cambios para cada publicación';

-- 4. Índices para acelerar búsquedas, filtrado y validación de RLS
CREATE INDEX IF NOT EXISTS idx_publicaciones_user_id 
    ON public.publicaciones(user_id);

CREATE INDEX IF NOT EXISTS idx_publicaciones_user_estado 
    ON public.publicaciones(user_id, estado);

CREATE INDEX IF NOT EXISTS idx_publicaciones_user_sku 
    ON public.publicaciones(user_id, sku);

CREATE INDEX IF NOT EXISTS idx_publicaciones_user_created 
    ON public.publicaciones(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_historial_publicacion_created 
    ON public.historial_actualizaciones(publicacion_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_historial_user_id 
    ON public.historial_actualizaciones(user_id);

-- 5. Trigger para actualizar automáticamente la columna updated_at
CREATE OR REPLACE FUNCTION public.handle_publicaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_publicaciones_updated_at ON public.publicaciones;
CREATE TRIGGER tr_publicaciones_updated_at
BEFORE UPDATE ON public.publicaciones
FOR EACH ROW
EXECUTE FUNCTION public.handle_publicaciones_updated_at();

-- 6. Habilitar Row Level Security (RLS) en ambas tablas
ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_actualizaciones ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS para la tabla publicaciones
-- Nota: Usamos (SELECT auth.uid()) para optimización del planificador de Postgres
DROP POLICY IF EXISTS "Usuarios pueden consultar sus propias publicaciones" ON public.publicaciones;
CREATE POLICY "Usuarios pueden consultar sus propias publicaciones"
    ON public.publicaciones
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Usuarios pueden registrar sus propias publicaciones" ON public.publicaciones;
CREATE POLICY "Usuarios pueden registrar sus propias publicaciones"
    ON public.publicaciones
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propias publicaciones" ON public.publicaciones;
CREATE POLICY "Usuarios pueden actualizar sus propias publicaciones"
    ON public.publicaciones
    FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias publicaciones" ON public.publicaciones;
CREATE POLICY "Usuarios pueden eliminar sus propias publicaciones"
    ON public.publicaciones
    FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- 8. Políticas RLS para la tabla historial_actualizaciones
DROP POLICY IF EXISTS "Usuarios pueden consultar el historial de sus publicaciones" ON public.historial_actualizaciones;
CREATE POLICY "Usuarios pueden consultar el historial de sus publicaciones"
    ON public.historial_actualizaciones
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Usuarios pueden registrar historial en sus publicaciones" ON public.historial_actualizaciones;
CREATE POLICY "Usuarios pueden registrar historial en sus publicaciones"
    ON public.historial_actualizaciones
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Usuarios pueden eliminar historial de sus publicaciones" ON public.historial_actualizaciones;
CREATE POLICY "Usuarios pueden eliminar historial de sus publicaciones"
    ON public.historial_actualizaciones
    FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- 9. Conceder permisos de acceso para la Data API de Supabase
GRANT ALL ON TABLE public.publicaciones TO authenticated;
GRANT ALL ON TABLE public.historial_actualizaciones TO authenticated;
