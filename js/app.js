const SUPABASE_URL      = 'https://cdarbygwhtwkdgkelktw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hBoCRcO2ozNu8l9lcRSTOw_NHWUZ-Qb';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── UI config para cards ───────────────────────────────────── */
const TIPO_REPORTE_UI = {
  'Petición'   : { icon: 'fa-file-lines',           color: 'blue',   desc: 'Solicitud de información, documentos o actuaciones de la institución' },
  'Queja'      : { icon: 'fa-triangle-exclamation', color: 'orange', desc: 'Manifestación de inconformidad por la prestación del servicio' },
  'Reclamo'    : { icon: 'fa-gavel',                color: 'red',    desc: 'Exigencia de un derecho que se considera vulnerado o desconocido' },
  'Sugerencia' : { icon: 'fa-lightbulb',            color: 'green',  desc: 'Propuesta para mejorar los procesos o servicios de la institución' },
  'Felicitación': { icon: 'fa-star',                color: 'gold',   desc: 'Reconocimiento por una experiencia positiva o excelente atención' },
};

const TIPO_USUARIO_UI = {
  'Paciente'   : { icon: 'fa-bed-pulse' },
  'Familiar'   : { icon: 'fa-people-group' },
  'Asegurador' : { icon: 'fa-shield-halved' },
};

/* ── Estado ─────────────────────────────────────────────────── */
let procesoCorreoMap = {};
let selectedFile     = null;
let currentStep      = 0;
const TOTAL_STEPS    = 6;

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  buildStepDots();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('fecha_manifestacion').value = today;
  document.getElementById('fecha_apertura').value      = today;

  document.getElementById('descripcion').addEventListener('input', function () {
    const n = Math.min(this.value.length, 1000);
    document.getElementById('charCount').textContent = n;
    if (n >= 1000) this.value = this.value.slice(0, 1000);
  });

  setupFileDrop();
  await loadListas();
});

/* ── Drag & drop ────────────────────────────────────────────── */
function setupFileDrop() {
  const drop = document.getElementById('fileDrop');
  if (!drop) return;
  drop.addEventListener('dragover',  e => { e.preventDefault(); drop.classList.add('drag-over'); });
  drop.addEventListener('dragleave', ()  => drop.classList.remove('drag-over'));
  drop.addEventListener('drop', e => {
    e.preventDefault();
    drop.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) applyFile(file);
  });
}

function handleFileSelect(input) {
  if (input.files?.[0]) applyFile(input.files[0]);
}

function applyFile(file) {
  const MAX = 10 * 1024 * 1024;
  const allowed = ['application/pdf','text/plain','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png','image/jpeg'];

  if (!allowed.includes(file.type)) {
    alert('Formato no permitido. Use: PDF, DOC, DOCX, TXT, PNG o JPG.');
    return;
  }
  if (file.size > MAX) {
    alert('El archivo supera el límite de 10 MB.');
    return;
  }

  selectedFile = file;
  document.getElementById('fileDrop').style.display    = 'none';
  document.getElementById('filePreview').style.display = 'flex';
  document.getElementById('filePreviewName').textContent = file.name;
  document.getElementById('filePreviewSize').textContent = formatBytes(file.size);
}

function removeFile() {
  selectedFile = null;
  document.getElementById('archivoAdjunto').value       = '';
  document.getElementById('fileDrop').style.display     = '';
  document.getElementById('filePreview').style.display  = 'none';
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ── Upload archivo a Supabase Storage ──────────────────────── */
async function uploadFile(file) {
  const ext  = file.name.split('.').pop();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await db.storage
    .from('pqrsf-adjuntos')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = db.storage
    .from('pqrsf-adjuntos')
    .getPublicUrl(data.path);

  return { url: publicUrl, nombre: file.name };
}

/* ── Cargar listas desde Supabase ───────────────────────────── */
async function loadListas() {
  try {
    const [
      { data: tipos },
      { data: entidades },
      { data: sedes },
      { data: procesos },
      { data: fuentes },
      { data: usuarios },
      { data: convenios },
      { data: regimenes },
      { data: fallas },
    ] = await Promise.all([
      db.from('lista_tipo_reporte').select('nombre').eq('activo', true).order('orden'),
      db.from('lista_entidades'   ).select('nombre').eq('activo', true).order('orden'),
      db.from('lista_sedes'       ).select('nombre').eq('activo', true).order('orden'),
      db.from('lista_procesos'    ).select('nombre,correo').eq('activo', true).order('orden'),
      db.from('lista_fuentes'     ).select('nombre').eq('activo', true).order('orden'),
      db.from('lista_tipo_usuario').select('nombre').eq('activo', true).order('orden'),
      db.from('lista_convenios'   ).select('nombre').eq('activo', true).order('orden'),
      db.from('lista_regimen'     ).select('nombre').eq('activo', true).order('orden'),
      db.from('lista_fallas'      ).select('nombre,grupo').eq('activo', true).order('orden'),
    ]);

    buildTipoReporteCards(tipos   || []);
    buildTipoUsuarioCards (usuarios|| []);

    procesoCorreoMap = {};
    (procesos || []).forEach(p => { procesoCorreoMap[p.nombre] = p.correo || ''; });

    fillSelect('entidad',  entidades  || []);
    fillSelect('sede',     sedes      || []);
    fillSelect('proceso',  procesos   || []);
    fillSelect('fuente',   fuentes    || []);
    fillSelect('convenio', convenios  || []);
    fillSelect('regimen',  regimenes  || []);
    fillSelectGrouped('falla', fallas || []);

  } catch (err) {
    console.error('Error cargando listas:', err);
  }
}

function fillSelect(id, items) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '<option value="">— Seleccione —</option>';
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = item.nombre;
    sel.appendChild(opt);
  });
}

function fillSelectGrouped(id, items) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = '<option value="">— Seleccione —</option>';
  const grupos = {};
  items.forEach(item => {
    const g = item.grupo || 'Otros';
    if (!grupos[g]) grupos[g] = [];
    grupos[g].push(item.nombre);
  });
  Object.entries(grupos).forEach(([grupo, opciones]) => {
    const og = document.createElement('optgroup');
    og.label = grupo;
    (opciones).forEach(nombre => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = nombre;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
}

function buildTipoReporteCards(items) {
  const grid = document.getElementById('tipoReporteGrid');
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach((item, i) => {
    const ui = TIPO_REPORTE_UI[item.nombre] || { icon: 'fa-circle-dot', color: 'blue', desc: '' };
    const id = `tipo-${i}`;
    grid.innerHTML += `
      <label class="type-card" for="${id}">
        <input type="radio" name="tipo_reporte" id="${id}" value="${item.nombre}" />
        <div class="type-card-inner">
          <div class="type-icon ${ui.color}"><i class="fa-solid ${ui.icon}"></i></div>
          <h3>${item.nombre}</h3><p>${ui.desc}</p>
        </div>
      </label>`;
  });
}

function buildTipoUsuarioCards(items) {
  const grid = document.getElementById('tipoUsuarioGrid');
  if (!grid) return;
  grid.innerHTML = '';
  items.forEach((item, i) => {
    const ui = TIPO_USUARIO_UI[item.nombre] || { icon: 'fa-user' };
    const id = `u-${i}`;
    grid.innerHTML += `
      <label class="user-card" for="${id}">
        <input type="radio" name="tipo_usuario" id="${id}" value="${item.nombre}" />
        <div class="user-card-inner">
          <i class="fa-solid ${ui.icon}"></i>
          <span>${item.nombre}</span>
        </div>
      </label>`;
  });
}

function autoFillCorreo() {
  const proceso = document.getElementById('proceso')?.value || '';
  window._correoProcesso = procesoCorreoMap[proceso] || '';
}

/* ── Progress ───────────────────────────────────────────────── */
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

/* ── Navegación ─────────────────────────────────────────────── */
function startForm() {
  document.getElementById('hero').style.display        = 'none';
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

function clearError(id) { const el = document.getElementById(id); if (el) el.textContent = ''; }
function setError(id, msg){ const el = document.getElementById(id); if (el) el.textContent = '⚠ ' + msg; }

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

/* ── Validación ─────────────────────────────────────────────── */
function validateStep(n) {
  switch (n) {
    case 1:
      if (!document.querySelector('input[name="tipo_reporte"]:checked'))
        return setError('err1','Por favor seleccione el tipo de PQRSF.'), false;
      return true;
    case 2:
      if (!v('entidad'))             return setError('err2','Seleccione la entidad.'), false;
      if (!v('sede'))                return setError('err2','Seleccione la sede.'), false;
      if (!v('proceso'))             return setError('err2','Seleccione el proceso o servicio.'), false;
      if (!v('fecha_manifestacion')) return setError('err2','Ingrese la fecha de la manifestación.'), false;
      if (!v('fuente'))              return setError('err2','Seleccione la fuente.'), false;
      return true;
    case 3:
      if (!document.querySelector('input[name="tipo_usuario"]:checked'))
        return setError('err3','Seleccione el tipo de usuario.'), false;
      if (!v('convenio')) return setError('err3','Seleccione el convenio / EPS.'), false;
      if (!v('regimen'))  return setError('err3','Seleccione el régimen.'), false;
      return true;
    case 4:
      if (!v('nombre_paciente')) return setError('err4','Ingrese el nombre y apellido del paciente.'), false;
      if (!v('numero_id'))       return setError('err4','Ingrese el número de identificación.'), false;
      if (v('email_reporta') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email_reporta')))
        return setError('err4','El correo electrónico no tiene formato válido.'), false;
      return true;
    case 5:
      if (!v('descripcion')) return setError('err5','Ingrese la descripción de su PQRSF.'), false;
      if (!v('falla'))       return setError('err5','Seleccione la falla o atributo identificado.'), false;
      return true;
    default: return true;
  }
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ── Resumen ────────────────────────────────────────────────── */
function buildSummary() {
  const tipo    = document.querySelector('input[name="tipo_reporte"]:checked')?.value || '';
  const usuario = document.querySelector('input[name="tipo_usuario"]:checked')?.value  || '';

  const fields = [
    { label: 'Tipo de PQRSF',       value: tipo,                            full: false },
    { label: 'Entidad',             value: v('entidad'),                    full: false },
    { label: 'Sede',                value: v('sede'),                       full: false },
    { label: 'Proceso / Servicio',  value: v('proceso'),                    full: false },
    { label: 'Fecha manifestación', value: formatDate(v('fecha_manifestacion')), full: false },
    { label: 'Fuente',              value: v('fuente'),                     full: false },
    { label: 'Tipo de usuario',     value: usuario,                         full: false },
    { label: 'Convenio / EPS',      value: v('convenio'),                   full: false },
    { label: 'Régimen',             value: v('regimen'),                    full: false },
    { label: 'Nombre del paciente', value: v('nombre_paciente'),            full: false },
    { label: 'Identificación',      value: v('numero_id'),                  full: false },
    { label: 'Teléfono',            value: v('telefono') || '—',            full: false },
    { label: 'Email reportante',    value: v('email_reporta') || '—',       full: false },
    { label: 'Especialidad',        value: v('especialidad') || '—',        full: false },
    { label: 'Documento adjunto',   value: selectedFile ? selectedFile.name : '—', full: false },
    { label: 'Falla / Atributo',    value: v('falla'),                      full: true  },
    { label: 'Descripción',         value: v('descripcion'),                full: true  },
  ];

  document.getElementById('summaryContent').innerHTML = fields.map(f =>
    `<div class="summary-item${f.full ? ' full' : ''}">
       <div class="s-label">${f.label}</div>
       <div class="s-value">${escHtml(f.value)}</div>
     </div>`
  ).join('');
}

/* ── Envío ──────────────────────────────────────────────────── */
async function submitForm() {
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  clearError('err6');

  const tipo    = document.querySelector('input[name="tipo_reporte"]:checked')?.value || '';
  const usuario = document.querySelector('input[name="tipo_usuario"]:checked')?.value  || '';

  // ── 1. Subir archivo (si existe) ──────────────────────────
  let archivoUrl    = null;
  let archivoNombre = null;

  if (selectedFile) {
    btn.innerHTML = '<span class="spinner"></span> Subiendo archivo…';
    try {
      const { url, nombre } = await uploadFile(selectedFile);
      archivoUrl    = url;
      archivoNombre = nombre;
    } catch (err) {
      console.error('Upload error:', err);
      setError('err6', 'Error al subir el archivo. Verifique su conexión.');
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar PQRSF';
      return;
    }
  }

  // ── 2. Guardar registro en Supabase ───────────────────────
  btn.innerHTML = '<span class="spinner"></span> Guardando…';

  const payload = {
    timestamp             : new Date().toISOString(),
    tipo_reporte          : tipo,
    entidad               : v('entidad'),
    sede                  : v('sede'),
    proceso               : v('proceso'),
    fecha_manifestacion   : v('fecha_manifestacion') || null,
    fuente                : v('fuente'),
    fecha_apertura        : v('fecha_apertura') || null,
    tipo_usuario          : usuario,
    convenio_eps          : v('convenio'),
    regimen               : v('regimen'),
    nombre_paciente       : v('nombre_paciente'),
    numero_identificacion : v('numero_id'),
    direccion             : v('direccion'),
    telefono              : v('telefono'),
    email_reporta         : v('email_reporta'),
    descripcion           : v('descripcion'),
    falla_atributo        : v('falla'),
    especialidad          : v('especialidad'),
    colaborador           : v('colaborador'),
    correo_proceso        : procesoCorreoMap[v('proceso')] || window._correoProcesso || '',
    archivo_url           : archivoUrl,
    archivo_nombre        : archivoNombre,
  };

  try {
    const { data, error } = await db
      .from('reportes_pqrsf')
      .insert([payload])
      .select('id')
      .single();

    if (error) throw error;

    const radicado = `PQRSF-${String(data.id).padStart(6, '0')}`;
    document.getElementById('ticketNumber').textContent = radicado;

    // ── 3. Enviar correo de notificación ──────────────────
    if (payload.correo_proceso) {
      btn.innerHTML = '<span class="spinner"></span> Enviando notificación…';
      try {
        await db.functions.invoke('notify-pqrsf', {
          body: { reporte: { ...payload, id: data.id } },
        });
      } catch (mailErr) {
        console.warn('Notificación no enviada:', mailErr);
        // No bloqueamos el flujo si el correo falla
      }
    }

    showStep(7);
    updateProgress(TOTAL_STEPS + 1);

  } catch (err) {
    console.error(err);
    setError('err6', 'No se pudo enviar el formulario. Verifique la conexión e intente de nuevo.');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar PQRSF';
  }
}

/* ── Reset ──────────────────────────────────────────────────── */
function resetForm() {
  document.querySelectorAll('input[type=radio]').forEach(r => r.checked = false);
  document.querySelectorAll('input[type=text],input[type=email],input[type=tel],textarea,select')
    .forEach(el => { el.value = ''; });

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('fecha_manifestacion').value = today;
  document.getElementById('fecha_apertura').value      = today;
  document.getElementById('charCount').textContent     = '0';
  window._correoProcesso = '';
  removeFile();

  document.getElementById('hero').style.display        = '';
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
