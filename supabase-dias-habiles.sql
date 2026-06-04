-- ================================================================
--  Migración: columna dias_habiles en reportes_pqrsf
--  Sistema PQRSF – Clínica de Alta Complejidad Santa Bárbara
--  Ejecutar en: Supabase → SQL Editor
-- ================================================================

ALTER TABLE public.reportes_pqrsf
  ADD COLUMN IF NOT EXISTS dias_habiles INTEGER;

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'reportes_pqrsf'
  AND column_name  = 'dias_habiles';
