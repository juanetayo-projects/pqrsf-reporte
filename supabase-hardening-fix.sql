-- =====================================================================
--  Correcciones de seguridad / hardening para reportes_pqrsf
--  Ejecutar en: Supabase Dashboard -> SQL Editor
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) CORREGIR EL TRIGGER  (IMPORTANTE)
--    La version anterior ponia dias_habiles = NULL, borrando un dato
--    que el formulario SI captura. Esta version conserva dias_habiles
--    y solo fuerza los campos realmente controlados por el sistema.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reportes_pqrsf_force_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.estado      := 'Pendiente';   -- todo reporte nuevo nace "Pendiente"
  NEW.created_at  := now();          -- no se puede falsificar la fecha de creacion
  NEW."timestamp" := now();
  -- dias_habiles ya NO se toca: lo conserva tal como lo envia el formulario
  RETURN NEW;
END;
$$;

-- (El trigger trg_reportes_pqrsf_force_defaults ya existe y seguira usando
--  esta funcion corregida; no hace falta recrearlo.)


-- ---------------------------------------------------------------------
-- 2) CIERRE FINAL DEL CAPTCHA  (ejecutar SOLO despues de:
--      a) configurar el secreto TURNSTILE_SECRET_KEY,
--      b) desplegar la Edge Function crear-reporte-pqrsf,
--      c) publicar el formulario nuevo y comprobar que registra bien)
--
--    Esto quita la insercion directa al rol anonimo, de modo que la
--    UNICA forma de crear un reporte sea pasando por la funcion (con
--    captcha verificado).
-- ---------------------------------------------------------------------
-- REVOKE INSERT ON public.reportes_pqrsf FROM anon;
-- DROP POLICY IF EXISTS allow_anon_insert ON public.reportes_pqrsf;
--
-- Nota: deja estas dos lineas COMENTADAS hasta completar a/b/c.
-- =====================================================================
