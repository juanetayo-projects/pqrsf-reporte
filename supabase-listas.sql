-- ================================================================
--  Tablas de listas desplegables – PQRSF
--  Ejecutar en: Supabase → SQL Editor
-- ================================================================

-- ── 1. Tipo de reporte ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lista_tipo_reporte (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden  INT    DEFAULT 0
);
INSERT INTO public.lista_tipo_reporte (nombre, orden) VALUES
  ('Petición',     1),
  ('Queja',        2),
  ('Reclamo',      3),
  ('Sugerencia',   4),
  ('Felicitación', 5)
ON CONFLICT DO NOTHING;

-- ── 2. Entidades ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lista_entidades (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden  INT    DEFAULT 0
);
INSERT INTO public.lista_entidades (nombre, orden) VALUES
  ('Clínica Alta Complejidad Santa Bárbara', 1),
  ('Asegurador',                             2),
  ('Biolab',                                 3),
  ('Supersalud/Defensoría (Asegurador)',     4)
ON CONFLICT DO NOTHING;

-- ── 3. Sedes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lista_sedes (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden  INT    DEFAULT 0
);
INSERT INTO public.lista_sedes (nombre, orden) VALUES
  ('CAC Santa Bárbara (Centro Especialistas)', 1),
  ('CAC Santa Bárbara (Torre)',                2),
  ('CAC Santa Bárbara (Urgencias)',            3)
ON CONFLICT DO NOTHING;

-- ── 4. Procesos (incluye correo destino) ───────────────────────
CREATE TABLE IF NOT EXISTS public.lista_procesos (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT,
  activo BOOLEAN DEFAULT true,
  orden  INT    DEFAULT 0
);
INSERT INTO public.lista_procesos (nombre, correo, orden) VALUES
  ('Docencia Investigación y Gestión del Conocimiento',  'paola.calvo@cacsantabarbara.co', 1),
  ('Gestión Administrativa',         'coordinacion.administrativa@cacsantabarbara.co', 2),
  ('Gestión Angiografía',            'coordinacionenfermeria.angiografia@cacsantabarbara.co', 3),
  ('Gestión Call center',            'juan.etayo@cacsantabarbara.co', 4),
  ('Gestión Comercial, Riesgo y Aseguramiento', 'evelin.vasquez@cacsantabarbara.co, olga.rada@cacsantabarbara.co, alexander.moreno@cacsantabarbara.co', 5),
  ('Gestión de Atención Ambulatoria','coordinacion.centralespecialistas@cacsantabarbara.co', 6),
  ('Gestión de Cuidados Intensivos', 'harold.arboleda@cacsantabarbara.co, coordinacionenfermeria.uci@cacsantabarbara.co', 7),
  ('Gestión de Egreso Seguro',       'egreso.seguro@cacsantabarbara.co, lider.gestiontransversal@cacsantabarbara.co', 8),
  ('Gestión de Facturación',         'facturacion.cacsb@cacsantabarbara.co', 9),
  ('Gestión de Hospitalización',     'coordinacionenfermeria.hospitalizacion@cacsantabarbara.co, coordinacionmedica.hospitalizacion@cacsantabarbara.co', 10),
  ('Gestión de Hospitalización Parcial', 'coordinacion.hospitalizacionparcial@cacsantabarbara.co', 11),
  ('Gestión de Hospitalización Piso 2',  'coordinacion.hospitalizacionparcial@cacsantabarbara.co, coordinacionmedica.hospitalizacion@cacsantabarbara.co', 12),
  ('Gestión de Hospitalización Piso 7 y 8', 'coordinacionenfermeria.hospitalizacion@cacsantabarbara.co, coordinacionmedica.hospitalizacion@cacsantabarbara.co', 13),
  ('Gestión de Imágenes Diagnosticas','coordinacionenfermeria.imagenesycardiologia@cacsantabarbara.co', 14),
  ('Gestión de Ingreso',             'facturacion.cacsb@cacsantabarbara.co', 15),
  ('Gestión de la Atención Quirúrgica', 'coordinacionenfermeria.cirugia@cacsantabarbara.co, carlos.dallos@cacsantabarbara.co', 16),
  ('Gestión de la Experiencia en la Atención', 'siau.red@cacsantabarbara.co, luz.correa@cacsantabarbara.co, lider.gestiontransversal@cacsantabarbara.co', 17),
  ('Gestión de Mantenimiento e Infraestructura', 'daniel.vasquez@cacsantabarbara.co', 18),
  ('Gestión de Referencia y Contrareferencia', 'coordinacion.enfermeriaurgencias@cacsantabarbara.co, lider.referencia@cacsantabarbara.co', 19),
  ('Gestión de Servicios Asistenciales', 'angela.zapata@cacsantabarbara.co, catalina.romero@cacsantabarbara.co', 20),
  ('Gestión de Urgencias Adulto',    'coordinacion.enfermeriaurgencias@cacsantabarbara.co, angelica.arizabaleta@cacsantabarbara.co', 21),
  ('Gestión de Urgencias Pediatría', 'angelica.arizabaleta@cacsantabarbara.co, catalina.romero@cacsantabarbara.co', 22),
  ('Gestión Jurídica',               'nataly.cano@cacsantabarbara.co', 23),
  ('Gestión Seguridad y Salud en el Trabajo', 'coordinacion.sst@cacsantabarbara.co', 24),
  ('Gestión TICS',                   'juan.etayo@cacsantabarbara.co', 25),
  ('Laboratorio Clínico',            'isgleidis.rodriguez@cacsantabarbara.co, natalia.azcarate@cacsantabarbara.co', 26)
ON CONFLICT DO NOTHING;

-- ── 5. Fuentes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lista_fuentes (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden  INT    DEFAULT 0
);
INSERT INTO public.lista_fuentes (nombre, orden) VALUES
  ('Buzón de sugerencia', 1),
  ('Email',               2),
  ('Pagina Web',          3),
  ('Personal/Verbal',     4),
  ('Redes Sociales',      5),
  ('Teléfonico',          6)
ON CONFLICT DO NOTHING;

-- ── 6. Tipo de usuario ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lista_tipo_usuario (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden  INT    DEFAULT 0
);
INSERT INTO public.lista_tipo_usuario (nombre, orden) VALUES
  ('Paciente',    1),
  ('Familiar',    2),
  ('Asegurador',  3)
ON CONFLICT DO NOTHING;

-- ── 7. Convenios / EPS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lista_convenios (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden  INT    DEFAULT 0
);
INSERT INTO public.lista_convenios (nombre, orden) VALUES
  ('ARL',                          1),
  ('ASMET SALUD',                  2),
  ('BATALLÓN',                     3),
  ('COMFENALCO',                   4),
  ('Compañia Aseguradora SOAT',    5),
  ('COOMEVA Medicina Prepagada',   6),
  ('EMSSANAR',                     7),
  ('FOMAG',                        8),
  ('NUEVA EPS',                    9),
  ('Particular',                  10),
  ('SALUD TOTAL',                 11),
  ('SANITAS',                     12),
  ('SOAT',                        13),
  ('SOS',                         14),
  ('SOS PAC',                     15),
  ('SURA',                        16),
  ('SURA PAC',                    17),
  ('UNISALUD',                    18)
ON CONFLICT DO NOTHING;

-- ── 8. Régimen ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lista_regimen (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden  INT    DEFAULT 0
);
INSERT INTO public.lista_regimen (nombre, orden) VALUES
  ('Contributivo', 1),
  ('Subsidiado',   2),
  ('No aplica',    3)
ON CONFLICT DO NOTHING;

-- ── 9. Fallas / Atributos ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lista_fallas (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  grupo  TEXT,
  activo BOOLEAN DEFAULT true,
  orden  INT    DEFAULT 0
);
INSERT INTO public.lista_fallas (nombre, grupo, orden) VALUES
  ('1. Caída del sistema',                                           'Acceso y programación', 1),
  ('1. Cambio de Profesional',                                       'Acceso y programación', 2),
  ('1. No responde el contact center',                               'Acceso y programación', 3),
  ('1. Retraso en admisión',                                         'Acceso y programación', 4),
  ('1. Servicio no contratado',                                      'Acceso y programación', 5),
  ('1. Servicio no disponible en la sede',                           'Acceso y programación', 6),
  ('1. Valor elevado en tarifa (cuota moderadora, copago, cotización particular)', 'Acceso y programación', 7),
  ('2. Administración tardía de medicamentos y/o conductas',         'Oportunidad en la atención', 8),
  ('2. Demora en los trámites de remisión',                          'Oportunidad en la atención', 9),
  ('2. Inoportunidad en la programación de ayudas diagnostica intrahospitalarias', 'Oportunidad en la atención', 10),
  ('2. No disponibilidad de agenda',                                 'Oportunidad en la atención', 11),
  ('2. No recibió llamada de retorno',                               'Oportunidad en la atención', 12),
  ('2. Recurso limitado',                                            'Oportunidad en la atención', 13),
  ('2. Reprogramación de cita o turno',                              'Oportunidad en la atención', 14),
  ('2. Retraso en la atención',                                      'Oportunidad en la atención', 15),
  ('2. Retraso en la entrega de resultados',                         'Oportunidad en la atención', 16),
  ('2. Retraso en la programación de procedimientos',                'Oportunidad en la atención', 17),
  ('2. Retraso en la respuesta interconsulta',                       'Oportunidad en la atención', 18),
  ('3. Daño en infraestructura',                                     'Seguridad e infraestructura', 19),
  ('3. Identificación incorrecta del paciente',                      'Seguridad e infraestructura', 20),
  ('3. Limpieza',                                                    'Seguridad e infraestructura', 21),
  ('3. Procedimiento asistencial inapropiado',                       'Seguridad e infraestructura', 22),
  ('4. Errores en formulas',                                         'Gestión clínica', 23),
  ('4. Inconformidad con tratamiento',                               'Gestión clínica', 24),
  ('4. Información Errada',                                          'Gestión clínica', 25),
  ('4. Retraso en autorización home care',                           'Gestión clínica', 26),
  ('5. Falta de información al paciente para su intervención',       'Comunicación e información', 27),
  ('6. Calidad/cantidad en la alimentación',                         'Experiencia y confort', 28),
  ('6. Disposición y flexibilidad de quien le atiende',              'Experiencia y confort', 29),
  ('6. Instalaciones no confortables',                               'Experiencia y confort', 30),
  ('6. Ruido',                                                       'Experiencia y confort', 31),
  ('6. Trato humanizado',                                            'Experiencia y confort', 32),
  ('7. Felicitaciones',                                              'Reconocimiento', 33)
ON CONFLICT DO NOTHING;

-- ================================================================
--  RLS: permitir lectura pública en todas las listas
-- ================================================================
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'lista_tipo_reporte','lista_entidades','lista_sedes','lista_procesos',
    'lista_fuentes','lista_tipo_usuario','lista_convenios','lista_regimen','lista_fallas'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
    BEGIN
      EXECUTE format(
        'CREATE POLICY "lectura_publica" ON public.%I FOR SELECT TO anon, authenticated USING (activo = true)',
        t
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;
