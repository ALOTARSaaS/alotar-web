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
  initActiveMenu();
  initSmoothScroll();
  initHeaderScroll();
});

/* =========================================================
   2) TELÉFONO / WHATSAPP INTERNACIONAL
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
   3) FORMULARIO DE CONTACTO
========================================================= */
function initContactForm(){
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  if (!form || !note) return;

  applyContactMode();

  window.addEventListener("hashchange", applyContactMode);
  window.addEventListener("popstate", applyContactMode);

  document.querySelectorAll(".js-demo-contact").forEach(btn => {
    btn.addEventListener("click", () => {
      history.replaceState(null, "", "index.html#contacto");
      applyContactMode("demo");
    });
  });

  form.addEventListener('submit', handleContactSubmit);
}

function applyContactMode(forceMode){
  const params = new URLSearchParams(window.location.search);
  const mode = forceMode || params.get("mode");

  const contacto = document.getElementById("contacto");
  const form = document.getElementById("contactForm");

  if (!contacto || !form) return;

  const title = contacto.querySelector(".section-heading h2");
  const desc = contacto.querySelector(".section-heading p");
  const select = form.querySelector('select[name="tipo_demo"]');
  const textarea = form.querySelector('textarea[name="mensaje"]');

  if (mode === "soporte") {
    if (title) title.innerHTML = 'Solicita <span class="gold-text">soporte</span>';
    if (desc) desc.textContent = "Cuéntanos tu caso y te ayudamos a configurar correctamente tu sistema ALOTAR.";
    if (select) select.value = "multi_calendar";
    if (textarea && !textarea.value.trim()) {
      textarea.value = "Necesito ayuda con la configuración del sistema.";
    }
  } else {
    if (title) title.innerHTML = 'Solicita tu <span class="gold-text">demostración</span>';
    if (desc) desc.textContent = "Déjanos tus datos y te mostraremos cómo ALOTAR puede transformar la gestión de tus reservas.";
    if (select) select.value = "";
    if (textarea && textarea.value === "Necesito ayuda con la configuración del sistema.") {
      textarea.value = "";
    }
  }
}

/* =========================================================
   4) ENVÍO DEL FORMULARIO
========================================================= */
async function handleContactSubmit(event){
  event.preventDefault();

  const form = event.target;
  const note = document.getElementById('formNote');
  const button = form.querySelector('button[type="submit"]');
  const payload = getFormData(form);

  console.log("DATOS FORMULARIO:", payload);


if (!payload.correo || !payload.correo.includes("@")) {
  setFormMessage(note, '❌ Validación FRONTEND: correo inválido', 'error');
  console.warn("Correo inválido detectado en frontend");
  return;
}

if (!payload.telefono || payload.telefono.length < 7) {
  setFormMessage(note, '❌ Validación FRONTEND: teléfono inválido', 'error');
  console.warn("Teléfono inválido detectado en frontend");
  return;
}


  if (!validateContactForm(payload, note)) return;

  const originalButtonText = button ? button.textContent : '';

  if (button) {
    button.disabled = true;
    button.textContent = 'Enviando...';
  }

  setFormMessage(note, 'Enviando solicitud...', 'loading');

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        api_key: "ALOTAR_SECURE_2026",
        action: "contact",
        data: payload
      })
    });

    const result = await response.json();

    if (result && result.ok) {
      setFormMessage(note, result.message || 'Solicitud enviada correctamente.', 'ok');
      form.reset();

      if (telefonoInput) {
        telefonoInput.setCountry("co");
      }

      applyContactMode();
    } else {
      setFormMessage(note, result.message || 'No fue posible enviar la solicitud.', 'error');
    }

  } catch (error) {
    setFormMessage(note, 'Error de conexión con el servidor.', 'error');
    console.error('Error enviando formulario:', error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalButtonText;
    }
  }
}

/* =========================================================
   5) VALIDACIONES
========================================================= */
function validateContactForm(data, note){
  const nombre = String(data.nombre || '').trim();
  const correo = String(data.correo || '').trim().toLowerCase();
  const empresa = String(data.empresa || '').trim();
  const tipoDemo = String(data.tipo_demo || '').trim();
  const mensaje = String(data.mensaje || '').trim();

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{6,60}$/;

  if (!nameRegex.test(nombre)) {
    setFormMessage(note, 'Ingresa un nombre válido. Usa solo letras y escribe mínimo nombre y apellido.', 'error');
    return false;
  }

  const partesNombre = nombre.split(/\s+/).filter(Boolean);

  if (partesNombre.length < 2) {
    setFormMessage(note, 'Por favor ingresa nombre y apellido.', 'error');
    return false;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;

  if (!emailRegex.test(correo)) {
    setFormMessage(note, 'Ingresa un correo electrónico válido.', 'error');
    return false;
  }

  const dominio = correo.split('@')[1];

  const dominiosInvalidos = [
    'gil.com',
    'gil.commm',
    'gail.com',
    'gail.co',
    'gail.cool',
    'gmial.com',
    'gmai.com',
    'gmail.co',
    'hotmial.com',
    'hotmai.com',
    'outlok.com',
    'outlook.co',
    'yaho.com',
    'yahho.com'
  ];

  if (dominiosInvalidos.includes(dominio)) {
    setFormMessage(note, 'El dominio del correo parece estar mal escrito. Revisa si quisiste escribir gmail.com, outlook.com o yahoo.com.', 'error');
    return false;
  }

  if (
    dominio.endsWith('.comm') ||
    dominio.endsWith('.commm') ||
    dominio.endsWith('.con') ||
    dominio.endsWith('.cmo')
  ) {
    setFormMessage(note, 'El correo parece tener una extensión incorrecta. Revisa el dominio.', 'error');
    return false;
  }

  if (!telefonoInput || !telefonoInput.isValidNumber() || !data.telefono) {
    setFormMessage(note, 'Ingresa un teléfono / WhatsApp válido.', 'error');
    return false;
  }

  if (empresa && (empresa.length < 2 || empresa.length > 80)) {
    setFormMessage(note, 'El nombre de la empresa debe tener entre 2 y 80 caracteres.', 'error');
    return false;
  }

  if (!tipoDemo) {
    setFormMessage(note, 'Debes seleccionar el tipo de demo.', 'error');
    return false;
  }

  if (mensaje.length > 500) {
    setFormMessage(note, 'El mensaje no debe superar 500 caracteres.', 'error');
    return false;
  }

  return true;
}

/* =========================================================
   6) CAPTURA DE DATOS
========================================================= */
function getFormData(form){
  const formData = new FormData(form);

  let telefono = formData.get('telefono') || '';
  let paisTelefono = '';
  let indicativoTelefono = '';
  let codigoPaisTelefono = '';

  if (telefonoInput) {
    const countryData = telefonoInput.getSelectedCountryData();

    telefono = telefonoInput.getNumber();
    paisTelefono = countryData.name || '';
    indicativoTelefono = countryData.dialCode ? `+${countryData.dialCode}` : '';
    codigoPaisTelefono = countryData.iso2 || '';
  }

  return {
    nombre: formData.get('nombre') || '',
    correo: formData.get('correo') || '',
    telefono,
    pais_telefono: paisTelefono,
    indicativo_telefono: indicativoTelefono,
    codigo_pais_telefono: codigoPaisTelefono,
    empresa: formData.get('empresa') || '',
    tipo_demo: formData.get('tipo_demo') || '',
    mensaje: formData.get('mensaje') || ''
  };
}

/* =========================================================
   7) MENSAJES VISUALES
========================================================= */
function setFormMessage(element, message, type){

  let bg = "";
  let border = "";

  if (type === "ok") {
    bg = "linear-gradient(135deg, rgba(34,197,94,.15), rgba(255,255,255,.05))";
    border = "1px solid rgba(34,197,94,.4)";
  }

  if (type === "error") {
    bg = "linear-gradient(135deg, rgba(248,113,113,.15), rgba(255,255,255,.05))";
    border = "1px solid rgba(248,113,113,.4)";
  }

  if (type === "loading") {
    bg = "linear-gradient(135deg, rgba(245,180,40,.15), rgba(255,255,255,.05))";
    border = "1px solid rgba(212,160,23,.4)";
  }

  element.innerHTML = `
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
      ${message}
    </div>
  `;
}

/* =========================================================
   8) MENÚ ACTIVO AUTOMÁTICO
========================================================= */
function initActiveMenu(){

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".menu a[href^='#']");

  function updateActiveMenu(){

    let current = "inicio";
    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 86;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - headerHeight - 30;

      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");

      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveMenu);
  updateActiveMenu();
}

/* =========================================================
   9) SCROLL PROFESIONAL CON OFFSET
========================================================= */
function initSmoothScroll(){

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(event){

      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 86;
      const targetPosition = target.offsetTop - headerHeight + 4;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      history.pushState(null, '', targetId);
    });
  });
}

/* =========================================================
   10) HEADER PREMIUM AL HACER SCROLL
========================================================= */
function initHeaderScroll(){

  const header = document.querySelector(".site-header");

  if (!header) return;

  function updateHeader(){
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", updateHeader);
  updateHeader();
}


