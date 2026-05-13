import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'PQRSF Santa Bárbara <notificaciones@cacsantabarbara.co>';
const APP_URL        = 'https://juanetayo-projects.github.io/pqrsf-reporte/';

const CORS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/* ── Colores por tipo ───────────────────────────────────────── */
const TIPO_COLOR: Record<string, string> = {
  'Petición'   : '#2471c8',
  'Queja'      : '#ea580c',
  'Reclamo'    : '#dc2626',
  'Sugerencia' : '#16a34a',
  'Felicitación': '#ca8a04',
};

/* ── Fila de detalle ────────────────────────────────────────── */
function row(label: string, value: string | null | undefined): string {
  if (!value) return '';
  return `
  <tr>
    <td style="padding:9px 0;font-size:13px;font-weight:600;color:#6b7280;width:42%;
               border-bottom:1px solid #f3f4f6;vertical-align:top;">${label}</td>
    <td style="padding:9px 0 9px 14px;font-size:13px;color:#111827;
               border-bottom:1px solid #f3f4f6;vertical-align:top;">${value}</td>
  </tr>`;
}

/* ── Plantilla HTML del correo ──────────────────────────────── */
function buildHtml(r: Record<string, string>): string {
  const radicado  = `PQRSF-${String(r.id).padStart(6, '0')}`;
  const color     = TIPO_COLOR[r.tipo_reporte] ?? '#1a4f9b';
  const fechaRec  = new Date().toLocaleString('es-CO', {
    year:'numeric', month:'long', day:'numeric',
    hour:'2-digit', minute:'2-digit', timeZone:'America/Bogota',
  });
  const fechaMan  = r.fecha_manifestacion
    ? new Date(r.fecha_manifestacion + 'T12:00:00').toLocaleDateString('es-CO',
        { year:'numeric', month:'long', day:'numeric' })
    : '—';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Nueva ${r.tipo_reporte} – ${radicado}</title>
</head>
<body style="margin:0;padding:24px 8px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

  <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;
              overflow:hidden;box-shadow:0 4px 28px rgba(26,79,155,.13);">

    <!-- ── HEADER ───────────────────────────────────────────── -->
    <div style="background:linear-gradient(135deg,#0d2d6b 0%,#1a4f9b 55%,#2471c8 100%);
                padding:36px 44px;text-align:center;">
      <div style="color:rgba(255,255,255,.65);font-size:11px;letter-spacing:2px;
                  text-transform:uppercase;margin-bottom:10px;">Sistema PQRSF</div>
      <div style="color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">
        Clínica de Alta Complejidad<br>Santa Bárbara
      </div>
      <div style="color:rgba(255,255,255,.65);font-size:12px;margin-top:8px;">
        Peticiones &middot; Quejas &middot; Reclamos &middot; Sugerencias &middot; Felicitaciones
      </div>
    </div>

    <!-- ── TIPO + RADICADO ──────────────────────────────────── -->
    <div style="text-align:center;padding:28px 44px 6px;">
      <span style="display:inline-block;background:${color};color:#fff;font-size:13px;
                   font-weight:700;padding:6px 22px;border-radius:99px;letter-spacing:.5px;">
        ${r.tipo_reporte}
      </span>
    </div>
    <div style="text-align:center;padding:14px 44px 4px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;
                  color:#6b7280;">Número de radicado</div>
      <div style="font-size:30px;font-weight:800;color:#0d2d6b;letter-spacing:3px;
                  margin:6px 0;">${radicado}</div>
      <div style="font-size:12px;color:#9ca3af;">Recibido el ${fechaRec}</div>
    </div>

    <div style="height:1px;background:#deeaf8;margin:20px 44px;"></div>

    <!-- ── DETALLES ─────────────────────────────────────────── -->
    <div style="padding:4px 44px 20px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;
                  color:#0d2d6b;margin-bottom:14px;">Información del caso</div>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Entidad',              r.entidad)}
        ${row('Sede',                 r.sede)}
        ${row('Proceso / Servicio',   r.proceso)}
        ${row('Fecha manifestación',  fechaMan)}
        ${row('Fuente',               r.fuente)}
        ${row('Tipo de usuario',      r.tipo_usuario)}
        ${row('Convenio / EPS',       r.convenio_eps)}
        ${row('Régimen',              r.regimen)}
        ${row('Nombre del paciente',  r.nombre_paciente)}
        ${row('Identificación',       r.numero_identificacion)}
        ${row('Teléfono',             r.telefono)}
        ${row('Email reportante',     r.email_reporta)}
        ${row('Falla / Atributo',     r.falla_atributo)}
        ${row('Especialidad',         r.especialidad)}
        ${row('Colaborador',          r.colaborador)}
        ${r.archivo_nombre ? row('Documento adjunto',
          r.archivo_url
            ? `<a href="${r.archivo_url}" style="color:#2471c8;">${r.archivo_nombre}</a>`
            : r.archivo_nombre) : ''}
      </table>
    </div>

    <!-- ── DESCRIPCIÓN ──────────────────────────────────────── -->
    <div style="margin:0 44px 28px;background:#f0f6ff;border-left:4px solid #1a4f9b;
                border-radius:0 8px 8px 0;padding:16px 20px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;
                  color:#1a4f9b;margin-bottom:8px;">Descripción</div>
      <div style="font-size:14px;color:#374151;line-height:1.65;">${r.descripcion ?? '—'}</div>
    </div>

    <!-- ── CTA ──────────────────────────────────────────────── -->
    <div style="text-align:center;padding:0 44px 36px;">
      <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">
        Gestione esta solicitud a través del sistema PQRSF de la clínica.
      </p>
      <a href="${APP_URL}"
         style="display:inline-block;background:#1a4f9b;color:#ffffff;text-decoration:none;
                padding:12px 30px;border-radius:8px;font-size:14px;font-weight:600;">
        Ver sistema PQRSF &rarr;
      </a>
    </div>

    <!-- ── FOOTER ────────────────────────────────────────────── -->
    <div style="background:#0d2d6b;padding:22px 44px;text-align:center;">
      <div style="color:rgba(255,255,255,.9);font-size:13px;font-weight:600;">
        Clínica de Alta Complejidad Santa Bárbara
      </div>
      <div style="color:rgba(255,255,255,.55);font-size:12px;margin-top:4px;">
        SIAU – Sistema de Información y Atención al Usuario
      </div>
      <div style="color:rgba(255,255,255,.35);font-size:11px;margin-top:10px;">
        Este es un mensaje automático generado por el sistema PQRSF. Por favor no responder.
      </div>
    </div>

  </div>
</body>
</html>`;
}

/* ── Handler ────────────────────────────────────────────────── */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { reporte } = await req.json();

    if (!reporte?.correo_proceso) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Sin correo destino' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const destinatarios = reporte.correo_proceso
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean);

    const radicado = `PQRSF-${String(reporte.id).padStart(6, '0')}`;
    const subject  = `📋 Nueva ${reporte.tipo_reporte} registrada – ${radicado}`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method : 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify({
        from   : FROM_EMAIL,
        to     : destinatarios,
        subject,
        html   : buildHtml(reporte),
      }),
    });

    const result = await resendRes.json();

    return new Response(
      JSON.stringify({ ok: resendRes.ok, result }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
