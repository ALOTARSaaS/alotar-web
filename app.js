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

/* =========================================================
   OTP
========================================================= */
function initOtpFlow(){
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const otpCode = document.getElementById("otpCode");

  if (!sendOtpBtn || !verifyOtpBtn || !otpCode) return;

  sendOtpBtn.addEventListener("click", sendOtpCode);
  verifyOtpBtn.addEventListener("click", verifyOtpCode);

  otpCode.addEventListener("input", () => {
    const code = otpCode.value.trim();

    // Solo permite números
    otpCode.value = code.replace(/\D/g, "");

    // Activa el botón solo si son exactamente 6 dígitos
    verifyOtpBtn.disabled = !/^\d{6}$/.test(otpCode.value);
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

  sendOtpBtn.disabled = true;
  setMsg(otpNote, "Enviando código...", "loading");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
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
      otpCode.disabled = false;
      verifyOtpBtn.disabled = true;
      setMsg(otpNote, json.message || "Código enviado. Revisa tu correo.", "ok");
    } else {
      sendOtpBtn.disabled = false;
      setMsg(otpNote, json.message || "No fue posible enviar el código.", "error");
    }

  } catch (err) {
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

  const mensajeOk = mensaje.value.trim().length <= 500;

  correo.disabled = !nombreOk;

  if (sendOtpBtn) {
    sendOtpBtn.disabled = !(nombreOk && correoOk) || emailVerified;
  }

  telefono.disabled = !emailVerified;

  if (!emailVerified) {
    empresa.disabled = true;
    tipo.disabled = true;
    mensaje.disabled = true;
    submitBtn.disabled = true;
    return;
  }

  empresa.disabled = !telefonoOk;
  tipo.disabled = !telefonoOk;

  mensaje.disabled = !(telefonoOk && empresaOk && tipoOk);

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

  let bg = "linear-gradient(135deg, rgba(245,180,40,.15), rgba(255,255,255,.05))";
  let border = "1px solid rgba(212,160,23,.4)";

  if (type === "ok") {
    bg = "linear-gradient(135deg, rgba(34,197,94,.15), rgba(255,255,255,.05))";
    border = "1px solid rgba(34,197,94,.4)";
  }

  if (type === "error") {
    bg = "linear-gradient(135deg, rgba(248,113,113,.15), rgba(255,255,255,.05))";
    border = "1px solid rgba(248,113,113,.4)";
  }

  el.innerHTML = `
    <div style="
      margin-top:10px;
      padding:14px;
      border-radius:12px;
      background:${bg};
      border:${border};
      color:#e5e7eb;
      font-size:14px;
      line-height:1.5;
    ">
      ${msg}
    </div>
  `;
}

