-- ================================================================
--  Storage bucket para adjuntos PQRSF + columnas en tabla
--  Ejecutar en: Supabase → SQL Editor
-- ================================================================

-- ── 1. Bucket de almacenamiento ────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pqrsf-adjuntos',
  'pqrsf-adjuntos',
  true,
  10485760,   -- 10 MB máximo por archivo
  ARRAY[
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Políticas RLS del bucket ────────────────────────────────
-- Subida pública (cualquier usuario puede adjuntar archivos)
CREATE POLICY "anon_upload_pqrsf"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'pqrsf-adjuntos');

-- Lectura pública (los archivos pueden ser descargados)
CREATE POLICY "public_read_pqrsf"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'pqrsf-adjuntos');

-- ── 3. Columnas de adjunto en la tabla principal ───────────────
ALTER TABLE public.reportes_pqrsf
  ADD COLUMN IF NOT EXISTS archivo_url    TEXT,
  ADD COLUMN IF NOT EXISTS archivo_nombre TEXT;
