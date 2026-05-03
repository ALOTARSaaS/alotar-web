/* =========================================================
   ALOTAR FRONTEND SCRIPT + OTP
========================================================= */

const API_URL = "https://script.google.com/macros/s/AKfycbyPlboReKGoAbs33kt9jw-jO7BLD1-9RFd5Tjx_le4lss-KXHRcd84dE9zU3QWoesE/exec";
const API_KEY = "ALOTAR_SECURE_2026";

let telefonoInput = null;
let emailVerified = false;

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initPhoneInput();
  initContactForm();
  initOtpFlow();
  initProgressiveValidation();
  applyContactMode();
});

/* =========================================================
   TELÉFONO INTERNACIONAL
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
   FORMULARIO
========================================================= */
function initContactForm(){
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", handleSubmit);
}

function applyContactMode(){
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  const contacto = document.getElementById("contacto");
  const form = document.getElementById("contactForm");

  if (!contacto || !form) return;

  const eyebrow = contacto.querySelector(".eyebrow");
  const title = contacto.querySelector(".section-heading h2");
  const desc = contacto.querySelector(".section-heading p:not(.eyebrow)");
  const tipo = document.getElementById("tipo_demo");
  const mensaje = document.getElementById("mensaje");

  if (mode === "soporte") {
    if (eyebrow) eyebrow.textContent = "Soporte";
    if (title) title.innerHTML = 'Solicita <span class="gold-text">ayuda</span>';
    if (desc) desc.textContent = "Cuéntanos qué necesitas configurar, corregir o revisar en tu sistema ALOTAR.";

    if (tipo) tipo.value = "multi_calendar";
    if (mensaje) mensaje.placeholder = "Describe la ayuda que necesitas. Ejemplo: configuración, calendario, logo, sedes u horarios.";

  } else {
    if (eyebrow) eyebrow.textContent = "Contacto";
    if (title) title.innerHTML = 'Solicita tu <span class="gold-text">demostración</span>';
    if (desc) desc.textContent = "Déjanos tus datos y te mostraremos cómo ALOTAR puede transformar la gestión de tus reservas.";

    if (mensaje) mensaje.placeholder = "Cuéntanos brevemente qué necesitas";
  }

  updateFormState();
}

/* =========================================================
   OTP
========================================================= */
function initOtpFlow(){
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const otpCode = document.getElementById("otpCode");

  if (!sendOtpBtn || !verifyOtpBtn || !otpCode) return;

  // Estado inicial seguro
  verifyOtpBtn.disabled = true;
  otpCode.disabled = true;
  otpCode.value = "";

  sendOtpBtn.addEventListener("click", sendOtpCode);
  verifyOtpBtn.addEventListener("click", verifyOtpCode);

  otpCode.addEventListener("input", () => {
    // 1. Solo números
    let clean = otpCode.value.replace(/\D/g, "");

    // 2. Máximo 6 dígitos
    clean = clean.slice(0, 6);

    // 3. Reasignar limpio
    otpCode.value = clean;

    // 4. Activar solo con 6 dígitos exactos
    verifyOtpBtn.disabled = clean.length !== 6;
  });
}

async function sendOtpCode(){
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim().toLowerCase();

  const otpNote = document.getElementById("otpNote");
  const otpCode = document.getElementById("otpCode");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const sendOtpBtn = document.getElementById("sendOtpBtn");

  if (!isValidName(nombre)) {
    setMsg(otpNote, "Ingresa nombre y apellido antes de verificar el correo.", "error");
    return;
  }

  if (!isValidEmail(correo)) {
    setMsg(otpNote, "Ingresa un correo válido antes de solicitar el código.", "error");
    return;
  }

  // Estado seguro antes de enviar
  otpCode.value = "";
  otpCode.disabled = true;
  otpCode.readOnly = false;
  verifyOtpBtn.disabled = true;
  sendOtpBtn.disabled = true;

  setMsg(otpNote, "Enviando código...", "loading");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        api_key: API_KEY,
        action: "send_otp",
        data: {
          nombre,
          correo
        }
      })
    });

    const json = await res.json();

    if (json.ok) {
      // Estado correcto después de enviar OTP
      otpCode.value = "";
      otpCode.disabled = false;
      otpCode.readOnly = false;

      verifyOtpBtn.disabled = true;
      sendOtpBtn.disabled = true;

      setMsg(otpNote, json.message || "Código enviado. Revisa tu correo.", "ok");
    } else {
      otpCode.value = "";
      otpCode.disabled = true;
      verifyOtpBtn.disabled = true;
      sendOtpBtn.disabled = false;

      setMsg(otpNote, json.message || "No fue posible enviar el código.", "error");
    }

  } catch (err) {
    otpCode.value = "";
    otpCode.disabled = true;
    verifyOtpBtn.disabled = true;
    sendOtpBtn.disabled = false;

    setMsg(otpNote, "Error de conexión al enviar el código.", "error");
  }
}

async function verifyOtpCode(){
  const correo = document.getElementById("correo").value.trim().toLowerCase();
  const otp = document.getElementById("otpCode").value.trim();
  const otpNote = document.getElementById("otpNote");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const sendOtpBtn = document.getElementById("sendOtpBtn");

  if (!otp || otp.length !== 6) {
    setMsg(otpNote, "Ingresa el código de 6 dígitos.", "error");
    return;
  }

  verifyOtpBtn.disabled = true;
  setMsg(otpNote, "Verificando código...", "loading");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        api_key: API_KEY,
        action: "verify_otp",
        data: {
          correo,
          otp
        }
      })
    });

    const json = await res.json();

    if (json.ok) {
      emailVerified = true;

      document.getElementById("correo").readOnly = true;
      document.getElementById("otpCode").readOnly = true;

      sendOtpBtn.disabled = true;
      verifyOtpBtn.disabled = true;

      setMsg(otpNote, "✅ Correo verificado correctamente.", "ok");

      updateFormState();

    } else {
      verifyOtpBtn.disabled = false;
      setMsg(otpNote, json.message || "Código incorrecto.", "error");
    }

  } catch (err) {
    verifyOtpBtn.disabled = false;
    setMsg(otpNote, "Error de conexión al verificar el código.", "error");
  }
}

/* =========================================================
   VALIDACIÓN PROGRESIVA
========================================================= */
function initProgressiveValidation(){
  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const telefono = document.getElementById("telefono");
  const empresa = document.getElementById("empresa");
  const tipo = document.getElementById("tipo_demo");
  const mensaje = document.getElementById("mensaje");

  if (!nombre || !correo || !telefono || !empresa || !tipo || !mensaje) return;

  function resetVerificationState(){
    emailVerified = false;
    resetOtp();
    updateFormState();
  }

  nombre.addEventListener("input", resetVerificationState);
  correo.addEventListener("input", resetVerificationState);

  telefono.addEventListener("input", updateFormState);
  telefono.addEventListener("countrychange", updateFormState);
  empresa.addEventListener("input", updateFormState);
  tipo.addEventListener("change", updateFormState);
  mensaje.addEventListener("input", updateFormState);

  emailVerified = false;

  document.getElementById("sendOtpBtn").disabled = true;
  document.getElementById("verifyOtpBtn").disabled = true;
  document.getElementById("submitBtn").disabled = true;

  correo.disabled = true;
  telefono.disabled = true;
  empresa.disabled = true;
  tipo.disabled = true;
  mensaje.disabled = true;

  updateFormState();
}

function updateFormState(){

  const nombre = document.getElementById("nombre");
  const correo = document.getElementById("correo");
  const telefono = document.getElementById("telefono");
  const empresa = document.getElementById("empresa");
  const tipo = document.getElementById("tipo_demo");
  const mensaje = document.getElementById("mensaje");

  const submitBtn = document.getElementById("submitBtn");
  const sendOtpBtn = document.getElementById("sendOtpBtn");

  const nombreOk = isValidName(nombre.value);
  const correoOk = isValidEmail(correo.value);

  const telefonoOk = telefonoInput && telefonoInput.isValidNumber();

  const empresaOk =
    !empresa.value.trim() ||
    (empresa.value.trim().length >= 2 && empresa.value.trim().length <= 80);

  const tipoOk = Boolean(tipo.value);

  const mensajeOk =
    mensaje.value.trim().length >= 10 &&
    mensaje.value.trim().length <= 500;

  // 🔹 Paso 1: habilitar correo
  correo.disabled = !nombreOk;

  // 🔹 Paso 2: botón OTP
  if (sendOtpBtn) {
    sendOtpBtn.disabled = !(nombreOk && correoOk) || emailVerified;
  }

  // 🔹 Paso 3: teléfono solo si OTP validado
  telefono.disabled = !emailVerified;

  // 🔹 Bloque total si no está verificado
  if (!emailVerified) {
    empresa.disabled = true;
    tipo.disabled = true;
    mensaje.disabled = true;
    submitBtn.disabled = true;
    return;
  }

  // 🔹 Paso 4: habilitar siguientes campos
  empresa.disabled = !telefonoOk;
  tipo.disabled = !telefonoOk;

  mensaje.disabled = !(telefonoOk && empresaOk && tipoOk);

  // 🔥 Paso FINAL: botón enviar
  submitBtn.disabled = !(
    nombreOk &&
    correoOk &&
    emailVerified &&
    telefonoOk &&
    empresaOk &&
    tipoOk &&
    mensajeOk
  );
}

function resetOtp(){
  const otpCode = document.getElementById("otpCode");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const otpNote = document.getElementById("otpNote");

  if (otpCode) {
    otpCode.value = "";
    otpCode.disabled = true;
    otpCode.readOnly = false;
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.disabled = true;
  }

  if (otpNote) {
    otpNote.innerHTML = "";
  }
}

/* =========================================================
   SUBMIT
========================================================= */
async function handleSubmit(e){
  e.preventDefault();

  const note = document.getElementById("formNote");
  const data = getFormData(e.target);

  if (!validateFinal(data, note)) return;

  setMsg(note, "Enviando solicitud...", "loading");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        api_key: API_KEY,
        action: "contact",
        data
      })
    });

    const json = await res.json();

    if (json.ok) {
      setMsg(note, "✅ Solicitud enviada correctamente.", "ok");
      e.target.reset();

      emailVerified = false;

      if (telefonoInput) {
        telefonoInput.setCountry("co");
      }

      resetOtp();
      updateFormState();

    } else {
      setMsg(note, json.message || "No fue posible enviar la solicitud.", "error");
    }

  } catch (err) {
    setMsg(note, "Error de conexión con el servidor.", "error");
  }
}

/* =========================================================
   VALIDACIÓN FINAL
========================================================= */
function validateFinal(data, note){
  if (!isValidName(data.nombre)) {
    return error(note, "Ingresa un nombre válido con nombre y apellido.");
  }

  if (!isValidEmail(data.correo)) {
    return error(note, "Ingresa un correo válido.");
  }

  if (!emailVerified) {
    return error(note, "Debes verificar tu correo antes de enviar la solicitud.");
  }

  if (!telefonoInput || !telefonoInput.isValidNumber()) {
    return error(note, "Ingresa un teléfono / WhatsApp válido.");
  }

  if (!data.tipo_demo) {
    return error(note, "Selecciona el tipo de demo.");
  }

  return true;
}

function error(note, msg){
  setMsg(note, msg, "error");
  return false;
}

/* =========================================================
   DATA
========================================================= */
function getFormData(form){
  const fd = new FormData(form);

  let telefono = "";
  let paisTelefono = "";
  let indicativoTelefono = "";
  let codigoPaisTelefono = "";

  if (telefonoInput && window.intlTelInputUtils) {
    const c = telefonoInput.getSelectedCountryData();

    telefono = telefonoInput.getNumber(
      intlTelInputUtils.numberFormat.E164
    );

    paisTelefono = c.name || "No identificado";
    indicativoTelefono = c.dialCode ? `+${c.dialCode}` : "No identificado";
    codigoPaisTelefono = c.iso2 ? c.iso2.toUpperCase() : "No identificado";
  }

  return {
    nombre: fd.get("nombre") || "",
    correo: String(fd.get("correo") || "").trim().toLowerCase(),
    telefono,
    pais_telefono: paisTelefono,
    indicativo_telefono: indicativoTelefono,
    codigo_pais_telefono: codigoPaisTelefono,
    empresa: fd.get("empresa") || "",
    tipo_demo: fd.get("tipo_demo") || "",
    mensaje: fd.get("mensaje") || ""
  };
}

/* =========================================================
   VALIDADORES
========================================================= */
function isValidName(nombre){
  const value = String(nombre || "").trim();
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{6,60}$/;
  const parts = value.split(/\s+/).filter(Boolean);

  return regex.test(value) && parts.length >= 2;
}

function isValidEmail(email){

  const correo = String(email || "").trim().toLowerCase();

  // 1. Validación estándar
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!regex.test(correo)) return false;

  // 2. Dominio
  const dominio = correo.split("@")[1];

  if (!dominio) return false;

  // 3. SOLO errores reales comunes (no agresivo)
  const errores = [
    "gail.com",
    "gmial.com",
    "gmai.com",
    "hotmial.com",
    "outlok.com",
    "yaho.com"
  ];

  if (errores.includes(dominio)) return false;

  // 4. Evitar extensiones absurdas
  if (
    dominio.endsWith(".comm") ||
    dominio.endsWith(".con") ||
    dominio.endsWith(".cmo")
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   MENSAJES
========================================================= */
function setMsg(el, msg, type){
  if (!el) return;

  let statusType = "info";
  let title = "Información";

  if (type === "ok") {
    statusType = "success";
    title = "Correcto";
  }

  if (type === "error") {
    statusType = "error";
    title = "Atención";
  }

  if (type === "loading") {
    statusType = "warning";
    title = "Procesando";
  }

  // 🔥 Personalización por contexto
  if (el.id === "otpNote") {
    if (type === "ok") title = "Correo verificado";
    if (type === "error") title = "Error de verificación";
    if (type === "loading") title = "Verificando";
  }

  if (el.id === "formNote") {
    if (type === "ok") title = "Solicitud enviada";
    if (type === "error") title = "Error en solicitud";
    if (type === "loading") title = "Enviando";
  }

  showStatus(el.id, statusType, title, msg);
}

function showStatus(id, type, title, message){
  const box = document.getElementById(id);
  if (!box) return;

  box.className = `status-box ${type}`; // warning, success, error, info

  box.innerHTML = `
    <div class="status-icon">
      ${getStatusIcon(type)}
    </div>
    <div class="status-text">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>
  `;
}

function getStatusIcon(type){
  if(type === "success"){
    return `<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>`;
  }

  if(type === "error"){
    return `<svg viewBox="0 0 24 24"><path d="M12 2 1 21h22L12 2Zm1 15h-2v2h2v-2Zm0-8h-2v6h2V9Z"/></svg>`;
  }

  if(type === "warning"){
    return `<svg viewBox="0 0 24 24"><path d="M12 2 1 21h22L12 2Zm0 14h2v2h-2v-2Zm0-8h2v6h-2V8Z"/></svg>`;
  }

  return `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/></svg>`;
}


