/* ── Supabase config ────────────────────────────────────────────
   Reemplaza SUPABASE_URL y SUPABASE_ANON_KEY con los valores
   de tu proyecto en https://app.supabase.com → Settings → API
   ─────────────────────────────────────────────────────────── */
const SUPABASE_URL      = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── Proceso → Correo mapping ───────────────────────────────── */
const PROCESO_CORREO = {
  'Contabilidad': 'directorcontable@cacsantabarbara.com.co',
  'Control de Infecciones y Vigilancia Epidemiológica': 'coordinacionenfermeria.comiteinfecciones@cacsantabarbara.co',
  'Docencia Investigación y Gestión del Conocimiento': 'paola.calvo@cacsantabarbara.co',
  'Gestión Administrativa': 'coordinacion.administrativa@cacsantabarbara.co',
  'Gestión Ambiental': 'javier.calderon@cacsantabarbara.co',
  'Gestión Angiografía': 'coordinacionenfermeria.angiografia@cacsantabarbara.co',
  'Gestión Call center': 'juan.etayo@cacsantabarbara.co',
  'Gestión Comercial, Riesgo y Aseguramiento': 'evelin.vasquez@cacsantabarbara.co, olga.rada@cacsantabarbara.co, alexander.moreno@cacsantabarbara.co',
  'Gestión Farmacéutica': 'coordinaciongestionfarmaceutica@cacsantabarbara.co',
  'Gestión Financiera': 'Camilo.becerra@cacsantabarbara.co',
  'Gestión Seguridad y Salud en el Trabajo': 'coordinacion.sst@cacsantabarbara.co',
  'Gestión Sistemas de Información': 'juan.etayo@cacsantabarbara.co',
  'Gestión TICS': 'juan.etayo@cacsantabarbara.co',
  'Gestión de Atención Ambulatoria': 'coordinacion.centralespecialistas@cacsantabarbara.co',
  'Gestión de Calidad': 'maritza.jordan@cacsantabarbara.co, christian.castano@cacsantabarbara.co, gestorcalidad@cacsantabarbara.co',
  'Gestión de Cartera': 'sara.jaramillo@cacsantabarbara.co',
  'Gestión de Compras y Suministros': 'andrea.salazar@cacsantabarbara.co',
  'Gestión de Cuidados Intensivos': 'harold.arboleda@cacsantabarbara.co, coordinacionenfermeria.uci@cacsantabarbara.co',
  'Gestión de Egreso Seguro': 'egreso.seguro@cacsantabarbara.co, lider.gestiontransversal@cacsantabarbara.co',
  'Gestión de Esterilización': 'coordinacion.esterilizacion@cacsantabarbara.co',
  'Gestión de Facturación': 'facturacion.cacsb@cacsantabarbara.co',
  'Gestión de Glosas y/o Devoluciones': 'dianamarcela.merchan@cacsantabarbara.co',
  'Gestión de Hospitalización': 'coordinacionenfermeria.hospitalizacion@cacsantabarbara.co, coordinacionmedica.hospitalizacion@cacsantabarbara.co',
  'Gestión de Hospitalización Parcial': 'coordinacion.hospitalizacionparcial@cacsantabarbara.co',
  'Gestión de Hospitalización Piso 2': 'coordinacion.hospitalizacionparcial@cacsantabarbara.co, coordinacionmedica.hospitalizacion@cacsantabarbara.co',
  'Gestión de Hospitalización Piso 7 y 8': 'coordinacionenfermeria.hospitalizacion@cacsantabarbara.co, coordinacionmedica.hospitalizacion@cacsantabarbara.co',
  'Gestión de Imágenes Diagnosticas': 'coordinacionenfermeria.imagenesycardiologia@cacsantabarbara.co',
  'Gestión de Ingreso': 'facturacion.cacsb@cacsantabarbara.co',
  'Gestión Jurídica': 'nataly.cano@cacsantabarbara.co',
  'Gestión de Mantenimiento e Infraestructura': 'daniel.vasquez@cacsantabarbara.co',
  'Gestión de Radicación': 'radicación.cacs@cacsantabarbara.co',
  'Gestión de Referencia y Contrareferencia': 'coordinacion.enfermeriaurgencias@cacsantabarbara.co, lider.referencia@cacsantabarbara.co',
  'Gestión de Tesorería': 'sandra.baeza@cacsantabarbara.co',
  'Gestión de Urgencias Adulto': 'coordinacion.enfermeriaurgencias@cacsantabarbara.co, angelica.arizabaleta@cacsantabarbara.co',
  'Gestión de la Atención Quirúrgica': 'coordinacionenfermeria.cirugia@cacsantabarbara.co, carlos.dallos@cacsantabarbara.co',
  'Gestión de la Experiencia en la Atención': 'siau.red@cacsantabarbara.co, luz.correa@cacsantabarbara.co, lider.gestiontransversal@cacsantabarbara.co',
  'Gestión de la Investigación': 'coordinaciongestionclinica@cacsantabarbara.co',
  'Gestión de Servicios Asistenciales': 'angela.zapata@cacsantabarbara.co, catalina.romero@cacsantabarbara.co',
  'Gestión del Apoyo Terapéutico': 'coordinacionrehabilitacion.cacsb@cacsantabarbara.co',
  'Gestión del Talento Humano': 'luzangela.castano@cacsantabarbara.co',
  'Laboratorio Clínico': 'isgleidis.rodriguez@cacsantabarbara.co, natalia.azcarate@cacsantabarbara.co',
  'Logística de Transportes': 'alberto.gallego@cacsantabarbara.co',
  'Seguridad del Paciente': 'coordinacion.seguridaddelpaciente@cacsantabarbara.co',
  'Gestión de Urgencias Pediatría': 'angelica.arizabaleta@cacsantabarbara.co, catalina.romero@cacsantabarbara.co',
  'Mantenimiento Biomedico': 'sara.chilito@cacsantabarbara.co',
};

/* ── State ─────────────────────────────────────────────────── */
let currentStep = 0;
const TOTAL_STEPS = 6;

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildStepDots();
  // Set today as default for fecha_manifestacion
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('fecha_manifestacion').value = today;
  document.getElementById('fecha_apertura').value = today;

  // Char counter
  const desc = document.getElementById('descripcion');
  desc.addEventListener('input', () => {
    const n = Math.min(desc.value.length, 1000);
    document.getElementById('charCount').textContent = n;
    if (n >= 1000) desc.value = desc.value.slice(0, 1000);
  });
});

function buildStepDots() {
  const wrap = document.getElementById('stepIndicator');
  wrap.innerHTML = '';
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const d = document.createElement('div');
    d.className = 'step-dot';
    d.id = `dot${i}`;
    wrap.appendChild(d);
  }
}

function updateProgress(step) {
  const pct = ((step - 1) / TOTAL_STEPS) * 100;
  document.getElementById('progressBar').style.width = pct + '%';
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const d = document.getElementById(`dot${i}`);
    if (!d) continue;
    d.className = 'step-dot' + (i === step ? ' active' : i < step ? ' done' : '');
  }
}

/* ── Navigation ────────────────────────────────────────────── */
function startForm() {
  document.getElementById('hero').style.display = 'none';
  document.getElementById('formSection').style.display = 'block';
  showStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showStep(n) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`step${n}`);
  if (target) target.classList.add('active');
  currentStep = n;
  updateProgress(n);
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = '⚠ ' + msg;
}

function nextStep(fromStep) {
  clearError(`err${fromStep}`);
  if (!validateStep(fromStep)) return;
  if (fromStep === 5) buildSummary();
  showStep(fromStep + 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(fromStep) {
  showStep(fromStep - 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Validation ────────────────────────────────────────────── */
function validateStep(n) {
  switch (n) {
    case 1: {
      const v = document.querySelector('input[name="tipo_reporte"]:checked');
      if (!v) { setError('err1', 'Por favor seleccione el tipo de PQRSF.'); return false; }
      return true;
    }
    case 2: {
      const e = v('entidad'), s = v('sede'), p = v('proceso'), f = v('fecha_manifestacion'), fu = v('fuente');
      if (!e) { setError('err2', 'Seleccione la entidad.'); return false; }
      if (!s) { setError('err2', 'Seleccione la sede.'); return false; }
      if (!p) { setError('err2', 'Seleccione el proceso o servicio.'); return false; }
      if (!f) { setError('err2', 'Ingrese la fecha de la manifestación.'); return false; }
      if (!fu) { setError('err2', 'Seleccione la fuente.'); return false; }
      return true;
    }
    case 3: {
      const u = document.querySelector('input[name="tipo_usuario"]:checked');
      if (!u) { setError('err3', 'Seleccione el tipo de usuario.'); return false; }
      if (!v('convenio')) { setError('err3', 'Seleccione el convenio / EPS.'); return false; }
      if (!v('regimen'))  { setError('err3', 'Seleccione el régimen.'); return false; }
      return true;
    }
    case 4: {
      if (!v('nombre_paciente')) { setError('err4', 'Ingrese el nombre y apellido del paciente.'); return false; }
      if (!v('numero_id'))       { setError('err4', 'Ingrese el número de identificación.'); return false; }
      const email = v('email_reporta');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('err4', 'El correo electrónico no tiene un formato válido.');
        return false;
      }
      return true;
    }
    case 5: {
      if (!v('descripcion')) { setError('err5', 'Ingrese la descripción de su PQRSF.'); return false; }
      if (!v('falla'))       { setError('err5', 'Seleccione la falla o atributo identificado.'); return false; }
      return true;
    }
    default: return true;
  }
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ── Auto-fill correo ───────────────────────────────────────── */
function autoFillCorreo() {
  const proceso = v('proceso');
  // stored internally, used on submit
  window._correoProcesso = PROCESO_CORREO[proceso] || '';
}

/* ── Build summary ──────────────────────────────────────────── */
function buildSummary() {
  const tipo     = document.querySelector('input[name="tipo_reporte"]:checked')?.value || '';
  const usuario  = document.querySelector('input[name="tipo_usuario"]:checked')?.value  || '';

  const fields = [
    { label: 'Tipo de PQRSF',          value: tipo,                          full: false },
    { label: 'Entidad',                 value: v('entidad'),                  full: false },
    { label: 'Sede',                    value: v('sede'),                     full: false },
    { label: 'Proceso / Servicio',      value: v('proceso'),                  full: false },
    { label: 'Fecha de manifestación',  value: formatDate(v('fecha_manifestacion')), full: false },
    { label: 'Fuente',                  value: v('fuente'),                   full: false },
    { label: 'Tipo de usuario',         value: usuario,                       full: false },
    { label: 'Convenio / EPS',          value: v('convenio'),                 full: false },
    { label: 'Régimen',                 value: v('regimen'),                  full: false },
    { label: 'Nombre del paciente',     value: v('nombre_paciente'),          full: false },
    { label: 'Identificación',          value: v('numero_id'),                full: false },
    { label: 'Teléfono',                value: v('telefono') || '—',          full: false },
    { label: 'Email reportante',        value: v('email_reporta') || '—',     full: false },
    { label: 'Especialidad',            value: v('especialidad') || '—',      full: false },
    { label: 'Falla / Atributo',        value: v('falla'),                    full: true  },
    { label: 'Descripción',             value: v('descripcion'),              full: true  },
  ];

  const html = fields.map(f =>
    `<div class="summary-item${f.full ? ' full' : ''}">
       <div class="s-label">${f.label}</div>
       <div class="s-value">${escHtml(f.value)}</div>
     </div>`
  ).join('');

  document.getElementById('summaryContent').innerHTML = html;
}

/* ── Submit ─────────────────────────────────────────────────── */
async function submitForm() {
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Enviando…';
  clearError('err6');

  const tipo    = document.querySelector('input[name="tipo_reporte"]:checked')?.value || '';
  const usuario = document.querySelector('input[name="tipo_usuario"]:checked')?.value  || '';
  const now     = new Date().toISOString();

  const payload = {
    timestamp:           now,
    tipo_reporte:        tipo,
    entidad:             v('entidad'),
    sede:                v('sede'),
    proceso:             v('proceso'),
    fecha_manifestacion: v('fecha_manifestacion') || null,
    fuente:              v('fuente'),
    fecha_apertura:      v('fecha_apertura') || null,
    tipo_usuario:        usuario,
    convenio_eps:        v('convenio'),
    regimen:             v('regimen'),
    nombre_paciente:     v('nombre_paciente'),
    numero_identificacion: v('numero_id'),
    direccion:           v('direccion'),
    telefono:            v('telefono'),
    email_reporta:       v('email_reporta'),
    descripcion:         v('descripcion'),
    falla_atributo:      v('falla'),
    especialidad:        v('especialidad'),
    colaborador:         v('colaborador'),
    correo_proceso:      window._correoProcesso || '',
  };

  try {
    const { data, error } = await db
      .from('reportes_pqrsf')
      .insert([payload])
      .select('id')
      .single();

    if (error) throw error;

    const ticket = `PQRSF-${String(data?.id || Date.now()).padStart(6, '0')}`;
    document.getElementById('ticketNumber').textContent = ticket;
    showStep(7);
    updateProgress(TOTAL_STEPS + 1);

  } catch (err) {
    console.error(err);
    setError('err6', 'No se pudo enviar el formulario. Verifique la conexión y vuelva a intentarlo.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar PQRSF';
  }
}

/* ── Reset ──────────────────────────────────────────────────── */
function resetForm() {
  document.querySelectorAll('input[type=radio]').forEach(r => r.checked = false);
  document.querySelectorAll('input[type=text], input[type=email], input[type=tel], input[type=date], textarea, select')
    .forEach(el => { el.value = el.tagName === 'SELECT' ? '' : ''; });

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('fecha_manifestacion').value = today;
  document.getElementById('fecha_apertura').value = today;
  document.getElementById('charCount').textContent = '0';
  window._correoProcesso = '';

  document.getElementById('hero').style.display = '';
  document.getElementById('formSection').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Helpers ────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
