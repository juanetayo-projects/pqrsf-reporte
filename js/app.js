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

/* ── Semaforización de fallas ───────────────────────────────── */
const FALLA_SEMAFORO = {
  '1. Caída del sistema'                                                          : 'verde',
  '1. Cambio de Profesional'                                                      : 'verde',
  '1. No entrega de Resultados'                                                   : 'verde',
  '1. No responde el contact center'                                              : 'verde',
  '1. Retraso en admisión'                                                        : 'verde',
  '1. Servicio no contratado'                                                     : 'verde',
  '1. Servicio no disponible en la sede'                                          : 'verde',
  '1. Valor elevado en tarifa (cuota moderadora, copago, cotización particular)'  : 'amarillo',
  '2. Administración tardía de medicamentos y/o conductas'                        : 'amarillo',
  '2. Demora en los trámites de remisión'                                         : 'amarillo',
  '2. Inoportunidad en la programación de ayudas diagnostica intrahospitalarias'  : 'amarillo',
  '2. No disponibilidad de agenda'                                                : 'verde',
  '2. No recibió llamada de retorno'                                              : 'verde',
  '2. Recurso limitado'                                                           : 'amarillo',
  '2. Reprogramación de cita o turno'                                             : 'verde',
  '2. Retraso en la atención'                                                     : 'amarillo',
  '2. Retraso en la entrega de resultados'                                        : 'verde',
  '2. Retraso en la programación de procedimientos'                               : 'verde',
  '2. Retraso en la respuesta interconsulta'                                      : 'verde',
  '3. Daño en infraestructura'                                                    : 'verde',
  '3. Identificación incorrecta del paciente'                                     : 'amarillo',
  '3. Limpieza'                                                                   : 'verde',
  '3. Procedimiento asistencial inapropiado'                                      : 'amarillo',
  '4. Errores en formulas'                                                        : 'verde',
  '4. Inconformidad con tratamiento'                                              : 'rojo',
  '4. Información Errada'                                                         : 'rojo',
  '4. Retraso en autorización home care'                                          : 'amarillo',
  '5. Falta de información al paciente para su intervención'                      : 'rojo',
  '6. Calidad/cantidad en la alimentación'                                        : 'verde',
  '6. Disposición y flexibilidad de quien le atiende'                             : 'verde',
  '6. Instalaciones no confortables'                                              : 'amarillo',
  '6. Ruido'                                                                      : 'amarillo',
  '6. Trato humanizado'                                                           : 'rojo',
  '7. Felicitaciones'                                                             : 'verde',
};
const SEMAFORO_CFG = {
  verde   : { bg:'#dcfce7', color:'#15803d', dot:'#16a34a', label:'Verde'    },
  amarillo: { bg:'#fef9c3', color:'#92400e', dot:'#ca8a04', label:'Amarillo' },
  rojo    : { bg:'#fee2e2', color:'#991b1b', dot:'#dc2626', label:'Rojo'     },
};

/* ── Estado ─────────────────────────────────────────────────── */
let procesoCorreoMap = {};
let procesoSelected  = [];          // multi-select: nombres seleccionados
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
      { data: especialidadesData },
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
      db.from('especialidades'    ).select('nombre').eq('activo', true).order('nombre'),
    ]);

    buildTipoReporteCards(tipos   || []);
    buildTipoUsuarioCards (usuarios|| []);

    procesoCorreoMap = {};
    (procesos || []).forEach(p => { procesoCorreoMap[p.nombre] = p.correo || ''; });

    fillSelect('entidad',  entidades  || []);
    fillSelect('sede',     sedes      || []);
    buildProcesoDropdown(procesos     || []);
    fillSelect('fuente',   fuentes    || []);
    fillSelect('convenio', convenios  || []);
    fillSelect('regimen',  regimenes  || []);
    buildFallaDropdown(fallas || []);
    fillSelect('especialidad', especialidadesData || []);

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

/* ── Dropdown de falla con semaforización ────────────────────── */
function buildFallaDropdown(items) {
  const dd = document.getElementById('fallaDropdown');
  if (!dd) return;
  const grupos = {};
  items.forEach(item => {
    const g = item.grupo || 'Otros';
    if (!grupos[g]) grupos[g] = [];
    grupos[g].push(item.nombre);
  });
  let html = '';
  Object.entries(grupos).forEach(([grupo, opciones]) => {
    html += `<div class="falla-cs-group">${grupo}</div>`;
    opciones.forEach(nombre => {
      const nivel = FALLA_SEMAFORO[nombre] ?? 'verde';
      const cfg   = SEMAFORO_CFG[nivel];
      // Usar data-value en vez de onclick con JSON.stringify (evita rotura por comillas/tildes)
      html += `<div class="falla-cs-item" data-value="${nombre.replace(/"/g,'&quot;')}"
                    style="--dot:${cfg.dot};--bg:${cfg.bg};--fg:${cfg.color}">
        <span class="falla-cs-badge">
          <span class="falla-cs-dot"></span>
          ${nombre}
        </span>
      </div>`;
    });
  });
  dd.innerHTML = html;

  // Event delegation — un solo listener para todo el dropdown
  dd.addEventListener('click', function handler(e) {
    const item = e.target.closest('.falla-cs-item');
    if (item) selectFalla(item.dataset.value);
  }, { once: false });
}

function toggleFallaDD() {
  const dd    = document.getElementById('fallaDropdown');
  const arrow = document.getElementById('fallaArrow');
  const open  = dd.classList.contains('open');
  dd.classList.toggle('open', !open);
  arrow.classList.toggle('rotated', !open);
  if (!open) setTimeout(() => document.addEventListener('click', closeFallaOutside, { once: true }), 50);
}

function closeFallaOutside(e) {
  if (!document.getElementById('fallaWrap')?.contains(e.target)) {
    document.getElementById('fallaDropdown')?.classList.remove('open');
    document.getElementById('fallaArrow')?.classList.remove('rotated');
  }
}

function selectFalla(nombre) {
  document.getElementById('falla').value = nombre;
  const nivel = FALLA_SEMAFORO[nombre] ?? 'verde';
  const cfg   = SEMAFORO_CFG[nivel];
  const disp  = document.getElementById('fallaDisplay');
  disp.className = '';
  disp.innerHTML = `<span class="falla-cs-sel" style="--dot:${cfg.dot};--bg:${cfg.bg};--fg:${cfg.color}">
    <span class="falla-cs-dot"></span>${nombre}
  </span>`;
  document.getElementById('fallaDropdown').classList.remove('open');
  document.getElementById('fallaArrow').classList.remove('rotated');
  const errEl = document.getElementById('err5');
  if (errEl) errEl.classList.remove('visible');
}

function fallaColorBadge(falla) {
  if (!falla) return '—';
  const nivel = FALLA_SEMAFORO[falla];
  if (!nivel) return falla;
  const cfg = SEMAFORO_CFG[nivel];
  return `<span style="display:inline-flex;align-items:center;gap:5px;background:${cfg.bg};
    color:${cfg.color};padding:2px 10px 2px 6px;border-radius:99px;font-size:12px;font-weight:600;white-space:normal;line-height:1.4">
    <span style="width:8px;height:8px;border-radius:50%;background:${cfg.dot};flex-shrink:0;display:inline-block"></span>${falla}
  </span>`;
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
  // driven by procesoSelected — takes the first selected proceso's correo
  window._correoProcesso = procesoSelected.length
    ? (procesoCorreoMap[procesoSelected[0]] || '')
    : '';
}

/* ── Multi-select Proceso ───────────────────────────────────── */
function toggleMultiDrop(field) {
  const dd    = document.getElementById(field + 'Dropdown');
  const arrow = document.getElementById(field + 'Arrow');
  if (!dd) return;
  const isOpen = dd.classList.contains('open');
  if (isOpen) {
    dd.classList.remove('open');
    if (arrow) arrow.classList.remove('open');
  } else {
    dd.classList.add('open');
    if (arrow) arrow.classList.add('open');
    setTimeout(() => {
      document.addEventListener('click', function closeMs(e) {
        const wrap = document.getElementById(field + 'Ms');
        if (wrap && !wrap.contains(e.target)) {
          dd.classList.remove('open');
          if (arrow) arrow.classList.remove('open');
          document.removeEventListener('click', closeMs);
        }
      });
    }, 0);
  }
}

function buildProcesoDropdown(procesos) {
  const dd = document.getElementById('procesoDropdown');
  if (!dd) return;
  dd.innerHTML = '';
  if (!procesos.length) {
    dd.innerHTML = '<div class="ms-empty">Sin opciones disponibles</div>';
    return;
  }
  procesos.forEach(p => {
    const lbl = document.createElement('label');
    lbl.className = 'ms-item';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = p.nombre;
    cb.addEventListener('change', () => onProcesoCheck(cb));
    lbl.appendChild(cb);
    lbl.appendChild(document.createTextNode(' ' + p.nombre));
    dd.appendChild(lbl);
  });
}

function onProcesoCheck(cb) {
  if (cb.checked) {
    if (!procesoSelected.includes(cb.value)) procesoSelected.push(cb.value);
  } else {
    procesoSelected = procesoSelected.filter(s => s !== cb.value);
  }
  renderProcesoTags();
  autoFillCorreo();
}

function renderProcesoTags() {
  const el = document.getElementById('procesoTags');
  if (!el) return;
  if (!procesoSelected.length) {
    el.innerHTML = '<span class="ms-placeholder">— Seleccione uno o más —</span>';
  } else {
    el.innerHTML = procesoSelected.map(s =>
      `<span class="ms-tag">${escHtml(s)}<button type="button" class="ms-tag-remove" onclick="removeProcesoTag(this,event)" data-val="${escHtml(s)}"><i class="fa-solid fa-xmark"></i></button></span>`
    ).join('');
  }
}

function removeProcesoTag(btn, e) {
  e.stopPropagation();
  const val = btn.dataset.val;
  procesoSelected = procesoSelected.filter(s => s !== val);
  const cb = [...document.querySelectorAll('#procesoDropdown input[type=checkbox]')]
    .find(c => c.value === val);
  if (cb) cb.checked = false;
  renderProcesoTags();
  autoFillCorreo();
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
      if (!procesoSelected.length)   return setError('err2','Seleccione al menos un proceso o servicio.'), false;
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
      if (!v('descripcion'))  return setError('err5','Ingrese la descripción de su PQRSF.'), false;
      if (!v('falla'))        return setError('err5','Seleccione la falla o atributo identificado.'), false;
      if (!v('colaborador'))  return setError('err5','Ingrese el nombre del colaborador involucrado.'), false;
      if (!v('dias_habiles') || parseInt(v('dias_habiles'),10) < 1)
        return setError('err5','Ingrese los días hábiles para responder (mínimo 1).'), false;
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
    { label: 'Proceso / Servicio',  value: procesoSelected.join(', ') || '—', full: false },
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
    { label: 'Días hábiles para responder', value: v('dias_habiles') ? `${v('dias_habiles')} días` : '—', full: false },
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
      // Advertir pero continuar sin el adjunto
      archivoUrl    = null;
      archivoNombre = selectedFile.name + ' (no subido)';
    }
  }

  // ── 2. Guardar registro en Supabase ───────────────────────
  btn.innerHTML = '<span class="spinner"></span> Guardando…';

  const payload = {
    timestamp             : new Date().toISOString(),
    tipo_reporte          : tipo,
    entidad               : v('entidad'),
    sede                  : v('sede'),
    proceso               : procesoSelected.join(', '),
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
    dias_habiles          : parseInt(v('dias_habiles'), 10) || null,
    correo_proceso        : window._correoProcesso || (procesoSelected.length ? procesoCorreoMap[procesoSelected[0]] : '') || '',
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

    // ── 3. Enviar correo de notificación (no bloqueante, máx 8 s) ──
    // Dispara si hay correo_proceso (analistas) O email_reporta (paciente)
    if (payload.correo_proceso || payload.email_reporta) {
      btn.innerHTML = '<span class="spinner"></span> Enviando notificación…';
      const mailTimeout = new Promise((_, rej) =>
        setTimeout(() => rej(new Error('timeout')), 8000)
      );
      try {
        await Promise.race([
          db.functions.invoke('notify-pqrsf', {
            body: { reporte: { ...payload, id: data.id } },
          }),
          mailTimeout,
        ]);
      } catch (mailErr) {
        console.warn('Notificación no enviada:', mailErr.message);
        // No bloqueamos el flujo si el correo falla o se agota el tiempo
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
  procesoSelected = [];
  renderProcesoTags();
  document.querySelectorAll('#procesoDropdown input[type=checkbox]').forEach(cb => { cb.checked = false; });
  window._correoProcesso = '';

  // Restaurar botón de envío por si quedó deshabilitado o con spinner
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar PQRSF';
  }

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
