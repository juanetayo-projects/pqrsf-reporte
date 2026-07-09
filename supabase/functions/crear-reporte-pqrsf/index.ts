import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS: para mayor seguridad puedes reemplazar '*' por el origen exacto del
// formulario: 'https://juanetayo-projects.github.io'
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Solo estas columnas pueden venir del cliente. El resto (id, estado,
// created_at, timestamp) las controla la base de datos mediante el trigger.
const CAMPOS_PERMITIDOS = [
  'tipo_reporte', 'entidad', 'sede', 'proceso', 'fecha_manifestacion', 'fuente',
  'fecha_apertura', 'tipo_usuario', 'convenio_eps', 'regimen', 'nombre_paciente',
  'numero_identificacion', 'direccion', 'telefono', 'email_reporta', 'descripcion',
  'falla_atributo', 'especialidad', 'colaborador', 'correo_proceso',
  'dias_habiles', 'archivo_url', 'archivo_nombre',
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

// NOTA: esta funcion se despliega con verify_jwt=true. El gateway de Supabase
// ya rechaza (401) cualquier llamada sin un Authorization: Bearer <access_token>
// de un usuario autenticado antes de que este codigo se ejecute. El formulario
// esta detras de un login (mismo Auth que la consola PQRSF), por lo que ya no
// se requiere CAPTCHA (Turnstile) como control anti-bot adicional.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Metodo no permitido' }, 405);

  let payload: { data?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'JSON invalido' }, 400);
  }

  const data = payload?.data ?? {};

  // Quedarnos SOLO con las columnas permitidas (ignora cualquier campo extra).
  const fila: Record<string, unknown> = {};
  for (const k of CAMPOS_PERMITIDOS) {
    if (data[k] !== undefined && data[k] !== '') fila[k] = data[k];
  }
  if (!fila.descripcion && !fila.tipo_reporte) {
    return json({ error: 'Faltan datos minimos del reporte' }, 400);
  }

  // Insertar usando la service role key (el trigger fuerza estado/fechas).
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const { data: inserted, error } = await supabase
    .from('reportes_pqrsf')
    .insert(fila)
    .select('id')
    .single();

  if (error) {
    console.error('Error al insertar:', error.message);
    return json({ error: 'No se pudo registrar el reporte' }, 500);
  }

  return json({ ok: true, id: inserted.id }, 201);
});
