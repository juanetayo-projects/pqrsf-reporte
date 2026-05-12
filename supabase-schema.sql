-- ================================================================
--  Tabla principal de reportes PQRSF
--  Ejecutar en: Supabase → SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS public.reportes_pqrsf (
  id                    BIGSERIAL PRIMARY KEY,
  timestamp             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tipo_reporte          TEXT,
  entidad               TEXT,
  sede                  TEXT,
  proceso               TEXT,
  fecha_manifestacion   DATE,
  fuente                TEXT,
  fecha_apertura        DATE,
  tipo_usuario          TEXT,
  convenio_eps          TEXT,
  regimen               TEXT,
  nombre_paciente       TEXT,
  numero_identificacion TEXT,
  direccion             TEXT,
  telefono              TEXT,
  email_reporta         TEXT,
  descripcion           TEXT,
  falla_atributo        TEXT,
  especialidad          TEXT,
  colaborador           TEXT,
  correo_proceso        TEXT,
  estado                TEXT DEFAULT 'Pendiente',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_pqrsf_tipo       ON public.reportes_pqrsf(tipo_reporte);
CREATE INDEX IF NOT EXISTS idx_pqrsf_sede       ON public.reportes_pqrsf(sede);
CREATE INDEX IF NOT EXISTS idx_pqrsf_proceso    ON public.reportes_pqrsf(proceso);
CREATE INDEX IF NOT EXISTS idx_pqrsf_fecha      ON public.reportes_pqrsf(fecha_manifestacion);
CREATE INDEX IF NOT EXISTS idx_pqrsf_estado     ON public.reportes_pqrsf(estado);
CREATE INDEX IF NOT EXISTS idx_pqrsf_created_at ON public.reportes_pqrsf(created_at DESC);

-- ── Row Level Security ──────────────────────────────────────────
ALTER TABLE public.reportes_pqrsf ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario anónimo puede INSERTAR (registrar PQRSF)
CREATE POLICY "Inserción pública de PQRSF"
  ON public.reportes_pqrsf
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Solo usuarios autenticados pueden LEER (consola de gestión)
CREATE POLICY "Lectura autenticada"
  ON public.reportes_pqrsf
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo usuarios autenticados pueden ACTUALIZAR (cambiar estado)
CREATE POLICY "Actualización autenticada"
  ON public.reportes_pqrsf
  FOR UPDATE
  TO authenticated
  USING (true);
