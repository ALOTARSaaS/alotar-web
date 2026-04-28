/* =========================================================
   ALOTAR FRONTEND SCRIPT
========================================================= */

const API_URL = "https://script.google.com/macros/s/AKfycbyPlboReKGoAbs33kt9jw-jO7BLD1-9RFd5Tjx_le4lss-KXHRcd84dE9zU3QWoesE/exec";

let telefonoInput = null;

/* =========================================================
   1) INICIALIZACIÓN
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initPhoneInput();
  initContactForm();
  initProgressiveFormValidation(); // 🔥 CLAVE
  initActiveMenu();
  initSmoothScroll();
  initHeaderScroll();
});

/* =========================================================
   2) TELÉFONO INTERNACIONAL
========================================================= */
function initPhoneInput(){
  const input = document.querySelector("#telefono");

  if (!input || !window.intlTelInput) return;

  telefonoInput = window.intlTelInput(input, {
    initialCountry: "co",
    preferredCountries: ["co", "us", "mx", "es", "pa", "ec", "pe", "cl"],
    separateDialCode: true,
    nationalMode: false,
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js"
  });
}

/* =========================================================
   3) FORMULARIO
========================================================= */
function initContactForm(){
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  if (!form || !note) return;

  applyContactMode();

  window.addEventListener("hashchange", applyContactMode);
  window.addEventListener("popstate", applyContactMode);

  form.addEventListener('submit', handleContactSubmit);
}

/* =========================================================
   4) MODO DEMO / SOPORTE
========================================================= */
function applyContactMode(){
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  const contacto = document.getElementById("contacto");
  const form = document.getElementById("contactForm");

  if (!contacto || !form) return;

  const title = contacto.querySelector("h2");
  const desc = contacto.querySelector(".section-heading p");
  const select = form.querySelector('select[name="tipo_demo"]');
  const textarea = form.querySelector('textarea[name="mensaje"]');

  if (mode === "soporte") {
    title.innerHTML = 'Solicita <span class="gold-text">soporte</span>';
    desc.textContent = "Cuéntanos tu caso y te ayudamos a configurar correctamente tu sistema.";
    if (select) select.value = "multi_calendar";
    if (textarea && !textarea.value.trim()) {
      textarea.value = "Necesito ayuda con la configuración.";
    }
  }
}

/* =========================================================
   5) VALIDACIÓN PROGRESIVA 🔥
========================================================= */
function initProgressiveFormValidation(){

  const nombre = document.querySelector('[name="nombre"]');
  const correo = document.querySelector('[name="correo"]');
  const telefono = document.querySelector('[name="telefono"]');
  const empresa = document.querySelector('[name="empresa"]');
  const tipoDemo = document.querySelector('[name="tipo_demo"]');
  const mensaje = document.querySelector('[name="mensaje"]');
  const submitBtn = document.querySelector('#contactForm button[type="submit"]');

  if (!nombre) return;

  correo.disabled = true;
  telefono.disabled = true;
  empresa.disabled = true;
  tipoDemo.disabled = true;
  mensaje.disabled = true;
  submitBtn.disabled = true;

  function validarNombre(){
    const v = nombre.value.trim();
    const partes = v.split(" ");
    return v.length >= 6 && partes.length >= 2;
  }

  function validarCorreo(){
    return correo.value.includes("@") && correo.value.includes(".");
  }

  function validarTelefono(){
    return telefonoInput && telefonoInput.isValidNumber();
  }

  function validarTipo(){
    return tipoDemo.value !== "";
  }

  function update(){

    const n = validarNombre();
    correo.disabled = !n;

    if (!n) return reset();

    const c = validarCorreo();
    telefono.disabled = !c;

    if (!c) return;

    const t = validarTelefono();
    empresa.disabled = !t;

    if (!t) return;

    tipoDemo.disabled = false;

    if (!validarTipo()) {
      mensaje.disabled = true;
      submitBtn.disabled = true;
      return;
    }

    mensaje.disabled = false;
    submitBtn.disabled = false;
  }

  function reset(){
    correo.value = "";
    telefono.value = "";
    empresa.value = "";
    tipoDemo.value = "";
    mensaje.value = "";

    telefono.disabled = true;
    empresa.disabled = true;
    tipoDemo.disabled = true;
    mensaje.disabled = true;
    submitBtn.disabled = true;
  }

  nombre.addEventListener("input", update);
  correo.addEventListener("input", update);
  telefono.addEventListener("input", update);
  tipoDemo.addEventListener("change", update);

  update();
}

/* =========================================================
   6) ENVÍO
========================================================= */
async function handleContactSubmit(event){
  event.preventDefault();

  const form = event.target;
  const note = document.getElementById('formNote');
  const payload = getFormData(form);

  if (!validateContactForm(payload, note)) return;

  setFormMessage(note, 'Enviando...', 'loading');

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        api_key: "ALOTAR_SECURE_2026",
        action: "contact",
        data: payload
      })
    });

    const result = await response.json();

    if (result.ok) {
      setFormMessage(note, 'Enviado correctamente', 'ok');
      form.reset();
    } else {
      setFormMessage(note, result.message, 'error');
    }

  } catch (e) {
    setFormMessage(note, 'Error de conexión', 'error');
  }
}

/* =========================================================
   7) VALIDACIÓN FINAL
========================================================= */
function validateContactForm(data, note){

  if (!data.nombre || data.nombre.length < 6) {
    setFormMessage(note, 'Nombre inválido', 'error');
    return false;
  }

  if (!data.correo.includes("@")) {
    setFormMessage(note, 'Correo inválido', 'error');
    return false;
  }

  if (!telefonoInput.isValidNumber()) {
    setFormMessage(note, 'Teléfono inválido', 'error');
    return false;
  }

  return true;
}

/* =========================================================
   8) DATA
========================================================= */
function getFormData(form){
  const fd = new FormData(form);

  return {
    nombre: fd.get('nombre'),
    correo: fd.get('correo'),
    telefono: telefonoInput.getNumber(),
    empresa: fd.get('empresa'),
    tipo_demo: fd.get('tipo_demo'),
    mensaje: fd.get('mensaje')
  };
}

/* =========================================================
   9) MENSAJES
========================================================= */
function setFormMessage(el, msg, type){
  el.innerHTML = `<div>${msg}</div>`;
}

/* =========================================================
   10) UI
========================================================= */
function initActiveMenu(){}
function initSmoothScroll(){}
function initHeaderScroll(){}


