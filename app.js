/* =========================================================
   ALOTAR FRONTEND SCRIPT
========================================================= */

const API_URL = "https://script.google.com/macros/s/AKfycbyPlboReKGoAbs33kt9jw-jO7BLD1-9RFd5Tjx_le4lss-KXHRcd84dE9zU3QWoesE/exec";


/* =========================================================
   1) INICIALIZACIÓN
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initActiveMenu();
  initSmoothScroll();
  initHeaderScroll();
});


/* =========================================================
   2) FORMULARIO DE CONTACTO
========================================================= */
function initContactForm(){
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  if (!form || !note) return;

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");

  if (mode === "soporte") {
    const contacto = document.getElementById("contacto");

    const title = contacto.querySelector(".section-heading h2");
    const desc = contacto.querySelector(".section-heading p");
    const select = form.querySelector('select[name="tipo_demo"]');
    const textarea = form.querySelector('textarea[name="mensaje"]');

    if (title) {
      title.innerHTML = 'Solicita <span class="gold-text">soporte</span>';
    }

    if (desc) {
      desc.textContent = "Déjanos tu caso y te ayudamos a configurar correctamente tu sistema ALOTAR.";
    }

    if (select) {
      select.value = "multi_calendar";
    }

    if (textarea) {
      textarea.value = "Necesito ayuda con la configuración del sistema.";
    }
  }

  form.addEventListener('submit', handleContactSubmit);
}


/* =========================================================
   3) ENVÍO DEL FORMULARIO
========================================================= */
async function handleContactSubmit(event){
  event.preventDefault();

  const form = event.target;
  const note = document.getElementById('formNote');
  const button = form.querySelector('button[type="submit"]');
  const payload = getFormData(form);

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
   4) CAPTURA DE DATOS
========================================================= */
function getFormData(form){
  const formData = new FormData(form);

  return {
    nombre: formData.get('nombre') || '',
    correo: formData.get('correo') || '',
    empresa: formData.get('empresa') || '',
    tipo_demo: formData.get('tipo_demo') || '',
    mensaje: formData.get('mensaje') || ''
  };
}


/* =========================================================
   5) MENSAJES VISUALES
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
   6) MENÚ ACTIVO AUTOMÁTICO
========================================================= */
function initActiveMenu(){

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".menu a");

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
   7) SCROLL PROFESIONAL CON OFFSET
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
   8) HEADER PREMIUM AL HACER SCROLL
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


