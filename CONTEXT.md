Actúa como un Arquitecto de Software Full-Stack Senior. Vamos a diseñar y desarrollar desde cero un **Sistema Administrativo de Control de Inventario y Publicaciones de Mercado Libre**.

Antes de escribir código, lee detenidamente todo el contexto, la finalidad, el stack tecnológico, el esquema de base de datos y los requerimientos funcionales descritos a continuación.

---
### 1. Propósito y Finalidad del Sistema
El objetivo de esta aplicación web es centralizar, auditar y mantener un control riguroso sobre todas las publicaciones de productos que se crean o actualizan en **Mercado Libre**. 

**Problemas que resuelve:**
- Evitar quiebres de stock o ventas sin inventario físico disponible (protegiendo la reputación de la cuenta).
- Llevar trazabilidad histórica de qué cambios se le hacen a cada publicación (precios, stock, fotos, SEO) y cuándo se hicieron, para evaluar su impacto.
- Calcular márgenes netos reales descontando las comisiones según el tipo de publicación.
- Garantizar **persistencia de datos en la nube y acceso multidispositivo**: el usuario debe poder iniciar sesión desde una computadora de escritorio, laptop, tablet o teléfono móvil y encontrar siempre toda su información sincronizada en tiempo real.

---

### 2. Stack Tecnológico y Arquitectura
- **Framework Frontend & Backend:** Next.js (App Router) con React y TypeScript estricto.
- **Estilos e Interfaz:** Tailwind CSS + iconos con `lucide-react`. Diseño *Mobile-First* totalmente responsivo, configurado además como **PWA (Progressive Web App)** para poder instalarse como acceso directo en dispositivos móviles.
- **Base de Datos y Persistencia:** Supabase (PostgreSQL en la nube).
- **Autenticación y Seguridad:** Supabase Auth (inicio de sesión con correo y contraseña) + políticas estrictas de **Row Level Security (RLS)** en PostgreSQL para asegurar que solo los usuarios autenticados puedan consultar, crear, editar o eliminar registros.
- **Despliegue:** Preparado para producción en Vercel o Cloudflare Pages.

---

### 3. Módulos y Características Funcionales Requeridas

#### A. Autenticación y Protección de Rutas
- Pantalla de inicio de sesión (`/login`) limpia y segura.
- Middleware en Next.js para proteger todas las rutas internas del panel administrativo; cualquier usuario no autenticado debe ser redirigido al login.

#### B. Gestión de Publicaciones (CRUD Completo)
Cada registro de publicación debe gestionar:
- **Identificación:**
  - `codigo_ml`: Código oficial de Mercado Libre (ej. `MLV-123456789`), único por publicación.
  - `sku`: Código interno de almacén o catálogo propio.
  - `titulo`: Título exacto de la publicación.
  - `url`: Enlace directo a la publicación activa (con botón de apertura rápida en nueva pestaña).
- **Control Dual de Inventario:**
  - `stock_fisico`: Cantidad real de unidades disponibles en almacén.
  - `stock_publicado`: Cantidad de unidades visibles/activas en Mercado Libre.
  - *Regla de negocio:* Alertar visualmente si `stock_publicado > stock_fisico` (riesgo de sobreventa) o si `stock_fisico <= 1` (alerta de stock crítico para pausar).
- **Control Financiero y Comisiones:**
  - `precio_usd`: Precio de venta publicado (en USD).
  - `tipo_publicacion`: `Gratuita`, `Clásica` o `Premium`.
  - `porcentaje_comision`: Porcentaje editable (con valores por defecto configurables según el tipo de publicación) que calcule automáticamente en la interfaz el monto de comisión y el **ingreso neto estimado por unidad**.
- **Estado Operativo y Checklist de Optimización (SEO):**
  - `estado`: `Activa`, `Pausada`, `Sin Stock`, `En Revisión`, `Finalizada`.
  - Indicadores booleanos de calidad de ficha: `portada_fondo_blanco`, `ficha_tecnica_completa`, `palabras_clave_seo`, `envio_gratis`.

#### C. Bitácora de Auditoría e Historial de Cambios
- Cada publicación debe tener marcas de tiempo automáticas (`created_at` y `updated_at`).
- **Tabla relacional de historial (`historial_actualizaciones`):** Cada vez que se edite una publicación (cambio de precio, ajuste de stock, renovación de fotos/SEO o cambio de estado), el sistema debe permitir registrar una entrada en la bitácora (detectando automáticamente qué campos cambiaron y permitiendo agregar una nota manual breve, ej. *"Se actualizó portada y se bajó precio de $45 a $42"*).
- Debe existir un modal o panel lateral (*Drawer*) por cada producto para visualizar su línea de tiempo cronológica de cambios.

#### D. Dashboard, Búsqueda, Filtros y Respaldo
- **Tarjetas de métricas (KPIs) superiores:** Total de publicaciones activas, total de unidades en stock físico, cantidad de publicaciones con alerta de stock crítico/descuadre y valor total del inventario publicado.
- **Filtros rápidos y buscador en tiempo real:** Filtrar por texto (título, SKU o código ML), por `estado`, por `tipo_publicacion` y un filtro rápido de *"Solo con alertas de stock"*.
- **Exportación de respaldo:** Botón para descargar toda la tabla filtrada o completa en formato `.csv` compatible con Excel.

---

### 4. Esquema Base de Datos Propuesto (PostgreSQL / Supabase)

```sql
-- Tabla principal de publicaciones
CREATE TABLE public.publicaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  codigo_ml TEXT NOT NULL,
  sku TEXT,
  titulo TEXT NOT NULL,
  url TEXT,
  precio_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tipo_publicacion TEXT NOT NULL CHECK (tipo_publicacion IN ('Gratuita', 'Clásica', 'Premium')),
  porcentaje_comision NUMERIC(5, 2) NOT NULL DEFAULT 0,
  stock_fisico INTEGER NOT NULL DEFAULT 0,
  stock_publicado INTEGER NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Pausada', 'Sin Stock', 'En Revisión', 'Finalizada')),
  portada_fondo_blanco BOOLEAN DEFAULT FALSE,
  ficha_tecnica_completa BOOLEAN DEFAULT FALSE,
  palabras_clave_seo BOOLEAN DEFAULT FALSE,
  envio_gratis BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de auditoría y trazabilidad de cambios
CREATE TABLE public.historial_actualizaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  publicacion_id UUID REFERENCES public.publicaciones(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo_cambio TEXT NOT NULL, -- Ej: 'Creación', 'Precio', 'Stock', 'SEO/Fotos', 'Estado', 'General'
  nota TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);