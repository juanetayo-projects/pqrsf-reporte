import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL') ?? 'PQRSF Santa Bárbara <notificaciones@cacsantabarbara.co>';
const APP_URL_REPORTE  = 'https://juanetayo-projects.github.io/pqrsf-reporte/';
const APP_URL_RESPUESTA = 'https://juanetayo-projects.github.io/pqrsf-respuesta/';
const LOGO_URL         = 'https://juanetayo-projects.github.io/pqrsf-reporte/assets/logo-wide.png';

const CORS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIPO_COLOR: Record<string, string> = {
  'Petición'   : '#2471c8',
  'Queja'      : '#ea580c',
  'Reclamo'    : '#dc2626',
  'Sugerencia' : '#16a34a',
  'Felicitación': '#ca8a04',
};

/* ── Semaforización de fallas ───────────────────────────────── */
const FALLA_SEMAFORO: Record<string, string> = {
  '1. Caída del sistema':'verde','1. Cambio de Profesional':'verde',
  '1. No entrega de Resultados':'verde','1. No responde el contact center':'verde',
  '1. Retraso en admisión':'verde','1. Servicio no contratado':'verde',
  '1. Servicio no disponible en la sede':'verde',
  '1. Valor elevado en tarifa (cuota moderadora, copago, cotización particular)':'amarillo',
  '2. Administración tardía de medicamentos y/o conductas':'amarillo',
  '2. Demora en los trámites de remisión':'amarillo',
  '2. Inoportunidad en la programación de ayudas diagnostica intrahospitalarias':'amarillo',
  '2. No disponibilidad de agenda':'verde','2. No recibió llamada de retorno':'verde',
  '2. Recurso limitado':'amarillo','2. Reprogramación de cita o turno':'verde',
  '2. Retraso en la atención':'amarillo','2. Retraso en la entrega de resultados':'verde',
  '2. Retraso en la programación de procedimientos':'verde',
  '2. Retraso en la respuesta interconsulta':'verde',
  '3. Daño en infraestructura':'verde','3. Identificación incorrecta del paciente':'amarillo',
  '3. Limpieza':'verde','3. Procedimiento asistencial inapropiado':'amarillo',
  '4. Errores en formulas':'verde','4. Inconformidad con tratamiento':'rojo',
  '4. Información Errada':'rojo','4. Retraso en autorización home care':'amarillo',
  '5. Falta de información al paciente para su intervención':'rojo',
  '6. Calidad/cantidad en la alimentación':'verde',
  '6. Disposición y flexibilidad de quien le atiende':'verde',
  '6. Instalaciones no confortables':'amarillo','6. Ruido':'amarillo',
  '6. Trato humanizado':'rojo','7. Felicitaciones':'verde',
};
const SEMAFORO_STYLE: Record<string, {bg:string;color:string;dot:string}> = {
  verde   : { bg:'#dcfce7', color:'#15803d', dot:'#16a34a' },
  amarillo: { bg:'#fef9c3', color:'#92400e', dot:'#ca8a04' },
  rojo    : { bg:'#fee2e2', color:'#991b1b', dot:'#dc2626' },
};

/* ── Encabezado común ───────────────────────────────────────── */
function header(): string {
  return `
    <div style="background:linear-gradient(135deg,#0d2d6b 0%,#1a4f9b 55%,#2471c8 100%);
                padding:32px 44px 28px;text-align:center;">
      <img src="${LOGO_URL}" alt="Clínica de Alta Complejidad Santa Bárbara"
           width="220" style="max-width:220px;height:auto;display:block;margin:0 auto 18px;" />
      <div style="color:rgba(255,255,255,.65);font-size:11px;letter-spacing:2px;
                  text-transform:uppercase;margin-bottom:6px;">Sistema PQRSF</div>
      <div style="color:rgba(255,255,255,.65);font-size:12px;">
        Peticiones &middot; Quejas &middot; Reclamos &middot; Sugerencias &middot; Felicitaciones
      </div>
    </div>`;
}

function footer(): string {
  return `
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
    </div>`;
}

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

function fallaRow(falla: string | null | undefined): string {
  if (!falla) return '';
  const nivel = FALLA_SEMAFORO[falla] ?? null;
  const st    = nivel ? SEMAFORO_STYLE[nivel] : null;
  const badge = st
    ? `<span style="display:inline-flex;align-items:center;gap:6px;background:${st.bg};
         color:${st.color};padding:4px 12px 4px 8px;border-radius:6px;
         font-size:13px;font-weight:600;line-height:1.4;">
         <span style="width:9px;height:9px;border-radius:50%;background:${st.dot};
                      flex-shrink:0;display:inline-block;"></span>${falla}
       </span>`
    : falla;
  return `
  <tr>
    <td style="padding:9px 0;font-size:13px;font-weight:600;color:#6b7280;width:42%;
               border-bottom:1px solid #f3f4f6;vertical-align:top;">Falla / Atributo</td>
    <td style="padding:9px 0 9px 14px;border-bottom:1px solid #f3f4f6;vertical-align:top;">${badge}</td>
  </tr>`;
}

/* ── Email para analistas (interno) ────────────────────────── */
function buildAnalistaHtml(r: Record<string, string>): string {
  const radicado = `PQRSF-${String(r.id).padStart(6, '0')}`;
  const color    = TIPO_COLOR[r.tipo_reporte] ?? '#1a4f9b';
  const fechaRec = new Date().toLocaleString('es-CO', {
    year:'numeric', month:'long', day:'numeric',
    hour:'2-digit', minute:'2-digit', timeZone:'America/Bogota',
  });
  const fechaMan = r.fecha_manifestacion
    ? new Date(r.fecha_manifestacion + 'T12:00:00').toLocaleDateString('es-CO',
        { year:'numeric', month:'long', day:'numeric' })
    : '—';

  return `<!DOCTYPE html><html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nueva ${r.tipo_reporte} – ${radicado}</title></head>
<body style="margin:0;padding:24px 8px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;
              overflow:hidden;box-shadow:0 4px 28px rgba(26,79,155,.13);">
    ${header()}
    <div style="text-align:center;padding:28px 44px 6px;">
      <span style="display:inline-block;background:${color};color:#fff;font-size:13px;
                   font-weight:700;padding:6px 22px;border-radius:99px;">${r.tipo_reporte}</span>
    </div>
    <div style="text-align:center;padding:14px 44px 4px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Número de radicado</div>
      <div style="font-size:30px;font-weight:800;color:#0d2d6b;letter-spacing:3px;margin:6px 0;">${radicado}</div>
      <div style="font-size:12px;color:#9ca3af;">Recibido el ${fechaRec}</div>
    </div>
    <div style="height:1px;background:#deeaf8;margin:20px 44px;"></div>
    <div style="padding:4px 44px 20px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;
                  color:#0d2d6b;margin-bottom:14px;">Información del caso</div>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Entidad',             r.entidad)}
        ${row('Sede',                r.sede)}
        ${row('Proceso / Servicio',  r.proceso)}
        ${row('Fecha manifestación', fechaMan)}
        ${row('Fuente',              r.fuente)}
        ${row('Tipo de usuario',     r.tipo_usuario)}
        ${row('Convenio / EPS',      r.convenio_eps)}
        ${row('Régimen',             r.regimen)}
        ${row('Nombre del paciente', r.nombre_paciente)}
        ${row('Identificación',      r.numero_identificacion)}
        ${row('Teléfono',            r.telefono)}
        ${row('Email reportante',    r.email_reporta)}
        ${fallaRow(r.falla_atributo)}
        ${row('Especialidad',        r.especialidad)}
        ${row('Colaborador',         r.colaborador)}
        ${r.archivo_nombre ? row('Documento adjunto',
          r.archivo_url
            ? `<a href="${r.archivo_url}" style="color:#2471c8;">${r.archivo_nombre}</a>`
            : r.archivo_nombre) : ''}
      </table>
    </div>
    <div style="margin:0 44px 28px;background:#f0f6ff;border-left:4px solid #1a4f9b;
                border-radius:0 8px 8px 0;padding:16px 20px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;
                  color:#1a4f9b;margin-bottom:8px;">Descripción</div>
      <div style="font-size:14px;color:#374151;line-height:1.65;">${r.descripcion ?? '—'}</div>
    </div>
    <div style="text-align:center;padding:0 44px 36px;">
      <p style="font-size:13px;color:#6b7280;margin:0 0 16px;">
        Ingrese al sistema para gestionar y responder esta solicitud.
      </p>
      <a href="${APP_URL_RESPUESTA}" style="display:inline-block;background:#1a4f9b;color:#ffffff;
               text-decoration:none;padding:12px 30px;border-radius:8px;font-size:14px;font-weight:600;">
        Responder PQRSF &rarr;
      </a>
    </div>
    ${footer()}
  </div>
</body></html>`;
}

/* ── Email de confirmación para el paciente ─────────────────── */
function buildPacienteHtml(r: Record<string, string>): string {
  const radicado = `PQRSF-${String(r.id).padStart(6, '0')}`;
  const color    = TIPO_COLOR[r.tipo_reporte] ?? '#1a4f9b';
  const fechaRec = new Date().toLocaleString('es-CO', {
    year:'numeric', month:'long', day:'numeric',
    hour:'2-digit', minute:'2-digit', timeZone:'America/Bogota',
  });

  return `<!DOCTYPE html><html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Confirmación de recibo – ${radicado}</title></head>
<body style="margin:0;padding:24px 8px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:14px;
              overflow:hidden;box-shadow:0 4px 28px rgba(26,79,155,.13);">
    ${header()}

    <!-- Confirmación -->
    <div style="text-align:center;padding:32px 44px 12px;">
      <div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;
                  display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:30px;">✅</span>
      </div>
      <div style="font-size:20px;font-weight:700;color:#0d2d6b;margin-bottom:8px;">
        Solicitud recibida correctamente
      </div>
      <div style="font-size:14px;color:#6b7280;line-height:1.6;">
        Hemos recibido su ${r.tipo_reporte ?? 'solicitud'} y fue radicada con el siguiente número de seguimiento:
      </div>
    </div>

    <!-- Radicado destacado -->
    <div style="text-align:center;padding:12px 44px 28px;">
      <div style="display:inline-block;background:#f0f6ff;border:2px solid #deeaf8;
                  border-radius:12px;padding:18px 36px;">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;
                    letter-spacing:1px;color:#6b7280;margin-bottom:6px;">Número de radicado</div>
        <div style="font-size:32px;font-weight:800;color:#0d2d6b;letter-spacing:4px;">${radicado}</div>
        <div style="font-size:12px;color:#9ca3af;margin-top:6px;">Recibido el ${fechaRec}</div>
      </div>
    </div>

    <div style="height:1px;background:#f3f4f6;margin:0 44px;"></div>

    <!-- Tipo y mensaje -->
    <div style="padding:24px 44px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <span style="background:${color};color:#fff;font-size:12px;font-weight:700;
                     padding:5px 16px;border-radius:99px;">${r.tipo_reporte ?? 'PQRSF'}</span>
        ${r.nombre_paciente ? `<span style="font-size:13px;color:#374151;">
          Para: <strong>${r.nombre_paciente}</strong></span>` : ''}
      </div>
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;
                  padding:14px 18px;">
        <div style="font-size:13px;color:#92400e;line-height:1.6;">
          <strong>¿Qué sigue?</strong> El equipo del proceso correspondiente revisará su solicitud
          y le dará respuesta en los plazos establecidos por la normativa vigente.<br><br>
          Conserve este número de radicado — lo necesitará para hacer seguimiento.
        </div>
      </div>
    </div>

    ${footer()}
  </div>
</body></html>`;
}

/* ── Enviar email vía Resend ────────────────────────────────── */
async function sendEmail(to: string[], subject: string, html: string) {
  return fetch('https://api.resend.com/emails', {
    method : 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type' : 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
}

/* ── Handler ────────────────────────────────────────────────── */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { reporte } = await req.json();

    if (!reporte?.correo_proceso && !reporte?.email_reporta) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Sin correo destino' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const radicado = `PQRSF-${String(reporte.id).padStart(6, '0')}`;
    const results: Record<string, unknown> = {};

    // 1. Notificación interna a analistas
    if (reporte.correo_proceso) {
      const destinatarios = reporte.correo_proceso
        .split(',').map((e: string) => e.trim()).filter(Boolean);
      const res = await sendEmail(
        destinatarios,
        `📋 Nueva ${reporte.tipo_reporte} registrada – ${radicado}`,
        buildAnalistaHtml(reporte),
      );
      results.analista = await res.json();
    }

    // 2. Confirmación al paciente
    if (reporte.email_reporta) {
      const res = await sendEmail(
        [reporte.email_reporta],
        `✅ Hemos recibido su ${reporte.tipo_reporte ?? 'solicitud'} – ${radicado}`,
        buildPacienteHtml(reporte),
      );
      results.paciente = await res.json();
    }

    return new Response(
      JSON.stringify({ ok: true, results }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
