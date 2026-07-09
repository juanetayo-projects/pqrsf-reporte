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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Metodo no permitido' }, 405);

  let payload: { token?: string; data?: Record<string, unknown> };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'JSON invalido' }, 400);
  }

  const token = payload?.token;
  const data = payload?.data ?? {};
  if (!token) return json({ error: 'Falta el token del captcha' }, 400);

  // 1) Verificar el captcha (Cloudflare Turnstile) del lado del servidor.
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret) return json({ error: 'Servidor sin TURNSTILE_SECRET_KEY configurada' }, 500);

  const ip = req.headers.get('CF-Connecting-IP') ?? req.headers.get('x-forwarded-for') ?? '';
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip.split(',')[0].trim());

  const verifyRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: form },
  );
  const verify = await verifyRes.json();
  if (!verify.success) {
    return json({ error: 'Verificacion de captcha fallida', detail: verify['error-codes'] }, 403);
  }

  // 2) Quedarnos SOLO con las columnas permitidas (ignora cualquier campo extra).
  const fila: Record<string, unknown> = {};
  for (const k of CAMPOS_PERMITIDOS) {
    if (data[k] !== undefined && data[k] !== '') fila[k] = data[k];
  }
  if (!fila.descripcion && !fila.tipo_reporte) {
    return json({ error: 'Faltan datos minimos del reporte' }, 400);
  }

  // 3) Insertar usando la service role key (el trigger fuerza estado/fechas).
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
