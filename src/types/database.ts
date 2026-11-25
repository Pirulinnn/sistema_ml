export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TipoPublicacion = 'Gratuita' | 'Clásica' | 'Premium';
export type EstadoPublicacion = 'Activa' | 'Pausada' | 'Sin Stock' | 'En Revisión' | 'Finalizada';
export type TipoCambioAuditoria = 'Creación' | 'Precio' | 'Stock' | 'SEO/Fotos' | 'Estado' | 'General';

export type Database = {
  public: {
    Tables: {
      publicaciones: {
        Row: {
          id: string
          user_id: string
          codigo_ml: string
          sku: string | null
          titulo: string
          url: string | null
          precio_usd: number
          tipo_publicacion: TipoPublicacion
          porcentaje_comision: number
          stock_fisico: number
          stock_publicado: number
          estado: EstadoPublicacion
          portada_fondo_blanco: boolean
          ficha_tecnica_completa: boolean
          palabras_clave_seo: boolean
          envio_gratis: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          codigo_ml: string
          sku?: string | null
          titulo: string
          url?: string | null
          precio_usd?: number
          tipo_publicacion: TipoPublicacion
          porcentaje_comision?: number
          stock_fisico?: number
          stock_publicado?: number
          estado?: EstadoPublicacion
          portada_fondo_blanco?: boolean
          ficha_tecnica_completa?: boolean
          palabras_clave_seo?: boolean
          envio_gratis?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          codigo_ml?: string
          sku?: string | null
          titulo?: string
          url?: string | null
          precio_usd?: number
          tipo_publicacion?: TipoPublicacion
          porcentaje_comision?: number
          stock_fisico?: number
          stock_publicado?: number
          estado?: EstadoPublicacion
          portada_fondo_blanco?: boolean
          ficha_tecnica_completa?: boolean
          palabras_clave_seo?: boolean
          envio_gratis?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "publicaciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      historial_actualizaciones: {
        Row: {
          id: string
          publicacion_id: string
          user_id: string
          tipo_cambio: TipoCambioAuditoria
          nota: string
          created_at: string
        }
        Insert: {
          id?: string
          publicacion_id: string
          user_id: string
          tipo_cambio: TipoCambioAuditoria
          nota: string
          created_at?: string
        }
        Update: {
          id?: string
          publicacion_id?: string
          user_id?: string
          tipo_cambio?: TipoCambioAuditoria
          nota?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "historial_actualizaciones_publicacion_id_fkey"
            columns: ["publicacion_id"]
            isOneToOne: false
            referencedRelation: "publicaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_actualizaciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      tipo_publicacion: TipoPublicacion
      estado_publicacion: EstadoPublicacion
      tipo_cambio_auditoria: TipoCambioAuditoria
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Publicacion = Database['public']['Tables']['publicaciones']['Row'];
export type PublicacionInsert = Database['public']['Tables']['publicaciones']['Insert'];
export type PublicacionUpdate = Database['public']['Tables']['publicaciones']['Update'];

export type HistorialActualizacion = Database['public']['Tables']['historial_actualizaciones']['Row'];
export type HistorialActualizacionInsert = Database['public']['Tables']['historial_actualizaciones']['Insert'];
export type HistorialActualizacionUpdate = Database['public']['Tables']['historial_actualizaciones']['Update'];
