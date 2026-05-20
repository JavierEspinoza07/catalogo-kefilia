/* cat.js — Kefilia enhancement layer */

const hero          = document.querySelector(".catalog-head");
const heroCopy      = document.querySelector(".hero-copy");
const productGrid   = document.querySelector(".products-grid");
const cartListEl    = document.getElementById("cartList");
const cartBlock     = document.querySelector(".cart-static");
const cartWhatsapp  = document.getElementById("cartWA");
const floatingCta   = document.getElementById("floatingCta");
const floatingCount = document.getElementById("floatingCartCount");
const toastStack    = document.getElementById("toastStack");

let lastCount = 0;
const defaultHref = floatingCta?.getAttribute("href") || "#";

/* ── CART EFFECTS ── */
function readCartCount() {
  return Array.from(document.querySelectorAll("#cartList .pill.soft"))
    .reduce((sum, pill) => {
      const m = pill.textContent.match(/×(\d+)/i);
      return sum + (m ? Number(m[1]) : 0);
    }, 0);
}

function updateCartEffects() {
  const count = readCartCount();
  if (floatingCount) floatingCount.textContent = String(count);
  if (cartBlock) cartBlock.classList.toggle("is-hot", count > 0);
  if (floatingCta) {
    const href = count > 0 && cartWhatsapp
      ? cartWhatsapp.getAttribute("href") || "#"
      : defaultHref;
    floatingCta.setAttribute("href", href);
  }
  if (floatingCta && count !== lastCount) {
    floatingCta.classList.remove("bump");
    void floatingCta.offsetWidth;
    floatingCta.classList.add("bump");
  }
  lastCount = count;
}

/* ── TOAST ── */
function showToast(msg) {
  if (!toastStack) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  toastStack.appendChild(el);
  setTimeout(() => el.remove(), 2700);
}

/* ── CONFETTI ── */
function burstConfetti(x, y) {
  const colors = ["#ff8a5b","#ffd166","#8edcc8","#ff5d8f","#b38cdc","#5ee8a0"];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("span");
    p.className = "confetti-piece";
    p.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]}`;
    p.style.setProperty("--dx", `${(Math.random()*2-1)*150}px`);
    p.style.setProperty("--dy", `${90 + Math.random()*130}px`);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 950);
  }
}

/* ── SCROLL REVEAL ── */
function setupReveal() {
  document.documentElement.classList.add("js-motion");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
}

/* ── HERO PARALLAX ── */
function setupHeroMotion() {
  if (!hero || !heroCopy) return;
  hero.addEventListener("pointermove", ev => {
    const r = hero.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * 100;
    const y = ((ev.clientY - r.top) / r.height) * 100;
    hero.style.setProperty("--hero-x", `${x}%`);
    hero.style.setProperty("--hero-y", `${y}%`);
    heroCopy.style.transform = `translate(${((x-50)/50)*10}px, ${((y-50)/50)*8}px)`;
  });
  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--hero-x", "50%");
    hero.style.setProperty("--hero-y", "50%");
    heroCopy.style.transform = "";
  });
}

/* ── HERO AUTOHIDE ── */
function setupHeroAutohide() {
  if (!hero || !heroCopy) return;
  let timer;
  const schedule = (ms = 4200) => { clearTimeout(timer); timer = setTimeout(() => heroCopy.classList.add("is-hidden"), ms); };
  const reveal   = () => { heroCopy.classList.remove("is-hidden"); schedule(2400); };
  schedule();
  hero.addEventListener("pointerenter",  reveal);
  hero.addEventListener("pointermove",   reveal);
  hero.addEventListener("click",         reveal);
  hero.addEventListener("touchstart",    reveal, { passive: true });
}

/* ── CARD 3D TILT ── */
function setupCardTilt() {
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("pointermove", ev => {
      const r  = card.getBoundingClientRect();
      const rx = ((ev.clientY - r.top)  / r.height - 0.5) * -10;
      const ry = ((ev.clientX - r.left) / r.width  - 0.5) *  10;
      card.style.transform = `translateY(-8px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

/* ── VIDEO AUTOPLAY ── */
function ensureVideo() {
  const v = document.querySelector(".hero-video");
  if (!v) return;
  const play = () => {
    v.muted = true; v.defaultMuted = true;
    v.setAttribute("muted",""); v.setAttribute("playsinline","");
    const p = v.play();
    if (p?.catch) p.catch(() => {});
  };
  v.muted = true; v.setAttribute("muted","");
  const iv = setInterval(play, 900);
  setTimeout(() => clearInterval(iv), 8000);
  v.addEventListener("loadedmetadata", play, { once: true });
  v.addEventListener("canplay", play, { once: true });
  v.addEventListener("playing", () => clearInterval(iv), { once: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) play(); });
  ["touchstart","pointerdown","click"].forEach(e => window.addEventListener(e, play, { passive:true, once:true }));
  setTimeout(play, 120);
}

/* ── GRID CLICK (confetti + toast) ── */
function setupGridEffects() {
  if (!productGrid) return;
  productGrid.addEventListener("click", ev => {
    const btn = ev.target.closest(".add-jar, .add-refill");
    if (!btn) return;
    const card = btn.closest(".product-card");
    const title = card?.querySelector(".product-title")?.textContent || "Producto";
    const mode  = btn.classList.contains("add-jar") ? "con frasco" : "como refill";
    setTimeout(() => {
      updateCartEffects();
      showToast(`${title} agregado ${mode}`);
      burstConfetti(ev.clientX || innerWidth / 2, ev.clientY || innerHeight / 2);
    }, 40);
  });
}

/* ── CART OBSERVER ── */
function setupCartObserver() {
  if (!cartListEl) return;
  const mo = new MutationObserver(() => updateCartEffects());
  mo.observe(cartListEl, { childList: true, subtree: true, characterData: true });
  cartListEl.addEventListener("click", ev => {
    if (ev.target.closest("[data-remove]")) {
      setTimeout(() => { updateCartEffects(); showToast("Producto quitado"); }, 30);
    }
  });
}

/* ── PRODUCT MODAL ── */
function setupModal() {
  const modal = document.getElementById("productModal");
  if (!modal) return;
  const closeBtn = document.getElementById("modalClose");
  const img = document.getElementById("modalImg");
  const tag = document.getElementById("modalTag");
  const title = document.getElementById("modalTitle");
  const desc = document.getElementById("modalDesc");
  const priceJar = document.getElementById("modalPriceJar");
  const priceRefill = document.getElementById("modalPriceRefill");
  const addJar = document.getElementById("modalAddJar");
  const addRefill = document.getElementById("modalAddRefill");
  let currentId = null;

  const openModal = (card) => {
    currentId = Number(card.dataset.id);
    img.src = card.querySelector("img").src;
    tag.textContent = card.querySelector(".tag").textContent;
    title.textContent = card.querySelector(".product-title").textContent;
    desc.textContent = card.querySelector(".product-desc").textContent;
    const pMain = card.querySelector(".price-main").innerHTML;
    const pSub = card.querySelector(".price-sub").textContent;
    priceJar.innerHTML = pMain;
    priceRefill.textContent = pSub;
    modal.classList.add("is-open");
  };

  const closeModal = () => { modal.classList.remove("is-open"); };

  document.querySelectorAll(".product-card img").forEach(imgEl => {
    imgEl.style.cursor = "pointer";
    imgEl.addEventListener("click", ev => {
      const card = ev.target.closest(".product-card");
      if (card) openModal(card);
    });
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", ev => {
    if (ev.target === modal) closeModal();
  });

  addJar.addEventListener("click", () => {
    if (currentId !== null && window.cart) {
      const cur = window.cart.get(currentId) || { jar: 0, refill: 0 };
      cur.jar += 1;
      window.cart.set(currentId, cur);
      if (window.renderCart) window.renderCart();
      updateCartEffects();
      showToast(`${title.textContent} (Frasco) agregado`);
      burstConfetti(innerWidth / 2, innerHeight / 2);
      closeModal();
    }
  });

  addRefill.addEventListener("click", () => {
    if (currentId !== null && window.cart) {
      const cur = window.cart.get(currentId) || { jar: 0, refill: 0 };
      cur.refill += 1;
      window.cart.set(currentId, cur);
      if (window.renderCart) window.renderCart();
      updateCartEffects();
      showToast(`${title.textContent} (Refill) agregado`);
      burstConfetti(innerWidth / 2, innerHeight / 2);
      closeModal();
    }
  });
}

/* ── CHATBOT ── */
function setupChatbot() {
  const toggle = document.getElementById("chatbotToggle");
  const windowEl = document.getElementById("chatbotWindow");
  const closeBtn = document.getElementById("chatbotClose");
  const input = document.getElementById("chatbotInput");
  const sendBtn = document.getElementById("chatbotSend");
  const messages = document.getElementById("chatbotMessages");
  if (!toggle || !windowEl) return;

  const toggleChat = () => { windowEl.classList.toggle("is-hidden"); };
  toggle.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", () => windowEl.classList.add("is-hidden"));

  const addMsg = (text, type = "user") => {
    const el = document.createElement("div");
    el.className = `chat-msg ${type}`;
    el.innerHTML = `<div class="msg-bubble">${text}</div>`;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  };

  const getBotResponse = (text) => {
    const t = text.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^\w\s]/gi, ''); // remove punctuation

    // 1. Saludos
    if (/hola|buenos dias|buenas tardes|buenas noches|que tal|saludos|hey/.test(t)) {
      return "¡Hola! 👋 Soy Kefibot, tu asistente virtual. Puedo ayudarte con precios, información de productos, envíos, o explicarte cómo funciona nuestro sistema de frascos retornables. ¿En qué te puedo ayudar hoy?";
    }

    // 2. Beneficios del Kefir / Salud
    if (/beneficio|sirve|salud|probiotico|digestion|flora intestinal|estomago|sistema inmune|hace bien/.test(t)) {
      return "El Kefir es un probiótico natural súper potente. Ayuda a regenerar la flora intestinal, mejora la digestión, fortalece el sistema inmunológico y es rico en nutrientes. Fermentamos el nuestro por 24 horas para garantizar la máxima cantidad de cultivos vivos beneficiosos. 🌱";
    }

    // 3. Sistema de Refill / Frascos
    if (/refill|frasco|retornable|botella|vidrio|devolver|como funciona|sistema/.test(t)) {
      return "¡Nuestro sistema es ecológico y económico! ♻️ En tu primera compra (Starter), adquieres el producto en un frasco de vidrio de 1 Litro. Para tus siguientes compras, nos devuelves ese frasco vacío y limpio, y nosotros te entregamos uno nuevo y lleno cobrándote **solo el precio de Refill** (mucho más barato).";
    }

    // 4. Precios (Específicos y Generales)
    if (/precio|cuesta|costo|cuanto vale|cuanto es|tarifas/.test(t)) {
      if (/griego/.test(t) && /frutilla|strawkefir/.test(t)) return "El Kefir Griego de Frutilla (Strawkefir Griego) cuesta Bs 70 por primera vez (con frasco) y Bs 57 el refill.";
      if (/griego/.test(t) && /durazno|kefeach/.test(t)) return "El Kefeach Griego (Durazno) cuesta Bs 74 (con frasco) y Bs 64 el refill.";
      if (/griego/.test(t) && /chocokefir|chocolate|cacao/.test(t)) return "El Chocokefir Griego cuesta Bs 70 (con frasco) y Bs 57 el refill.";
      if (/griego/.test(t)) return "El Kefir Griego Natural cuesta Bs 63 (con frasco) y Bs 50 el refill. ¡Es súper cremoso y alto en proteína!";
      if (/frutilla|strawkefir/.test(t)) return "El Strawkefir (Frutilla) cuesta Bs 48 (con frasco) y Bs 34 el refill.";
      if (/durazno|kefeach/.test(t)) return "El Kefeach (Durazno) cuesta Bs 52 (con frasco) y Bs 38 el refill.";
      if (/chocokefir|chocolate|cacao/.test(t)) return "El Chocokefir (con cacao puro) cuesta Bs 48 (con frasco) y Bs 34 el refill.";
      if (/natural/.test(t)) return "El Kefir Natural (clásico) cuesta Bs 40 (con frasco) y Bs 27 el refill.";
      
      return "💰 **Resumen de Precios (1 Litro):**\n• Natural: Bs 40 (Refill Bs 27)\n• Saborizados (Frutilla, Durazno, Chocolate): Bs 48 a Bs 52 (Refill Bs 34 a Bs 38)\n• Griegos (Natural o Sabores): Bs 63 a Bs 74 (Refill Bs 50 a Bs 64)\n\n¿Te interesa saber el precio de algún sabor en específico?";
    }

    // 5. Productos / Sabores / Griegos
    if (/sabor|tipos|variedad|producto|tienen|que venden|opciones|menu|catalogo/.test(t)) {
      return "Ofrecemos dos líneas principales:\n\n1️⃣ **Línea Clásica (Ligeros):** Natural, Strawkefir (Frutilla), Kefeach (Durazno) y Chocokefir.\n2️⃣ **Línea Griego (Espesos):** Natural, Strawkefir, Kefeach y Chocokefir.\n\nTodos elaborados sin saborizantes ni conservantes artificiales. 🍓🍑🍫";
    }

    // 6. Diferencia entre Clásico y Griego
    if (/diferencia|griego|espeso|liquido|textura/.test(t)) {
      return "La diferencia principal es la textura. El **Kefir Clásico** es más líquido, ideal para tomar en vaso o hacer batidos. El **Kefir Griego** es sometido a un proceso adicional que lo hace mucho más espeso y cremoso (como un yogurt griego), concentrando más proteína y probióticos. 🥄";
    }

    // 7. Consumo / Cómo tomar
    if (/como tomar|consumir|tomar|cantidad|dosis|ayunas|despues de comer/.test(t)) {
      return "Si nunca has tomado probióticos, te sugerimos empezar con medio vaso (100ml) al día para que tu cuerpo se acostumbre. Luego puedes tomar un vaso entero (200-250ml) diario. Puedes tomarlo en ayunas, mezclado con granola, frutas, o en batidos. ¡Recuerda agitar bien el frasco antes de servir! 🥛";
    }

    // 8. Envíos / Delivery / Zonas
    if (/envio|delivery|entrega|llegar|mandan|zona|ubicacion|donde estan|direccion|domicilio/.test(t)) {
      return "🛵 Realizamos envíos a domicilio en La Paz, manteniendo estricta cadena de frío para que los probióticos lleguen vivos. El costo de envío varía según la zona. También puedes consultar si tenemos algún punto de recojo cercano comunicándote por WhatsApp.";
    }

    // 9. Pagos
    if (/pago|pagar|qr|transferencia|efectivo|metodo/.test(t)) {
      return "Aceptamos transferencias bancarias, pago por código QR (lo más rápido) y pagos en efectivo al momento de la entrega. 💳💵";
    }

    // 10. Tiempo de duración / Caducidad / Conservación
    if (/duracion|dura|vence|caduca|caducidad|refrigerar|nevera|heladera|conservar/.test(t)) {
      return "El Kefir debe mantenerse SIEMPRE refrigerado ❄️. Bien tapado en la heladera te dura tranquilamente entre 2 a 3 semanas. Como es un producto vivo y sigue fermentando lentamente, con los días se volverá un poquito más ácido, pero es completamente normal y seguro de consumir.";
    }

    // 11. Despedidas / Agradecimientos
    if (/gracias|adios|chau|hasta luego|perfecto|entendido|ok/.test(t)) {
      return "¡De nada! Ha sido un placer. Si te decides a pedir, puedes armar tu carrito aquí mismo y darle al botón de enviar por WhatsApp. ¡Que tengas un excelente día! ✨";
    }

    // 12. Fallback (Si no entiende la pregunta)
    const fallbacks = [
      "¡Qué buena pregunta! Como soy un asistente virtual, no tengo la respuesta exacta para eso. ¿Te gustaría que te comunique con un asesor humano por WhatsApp?",
      "Hmm, no estoy completamente seguro de la respuesta a eso 🤔. Sin embargo, nuestro equipo de atención al cliente en WhatsApp te puede ayudar de inmediato. ¿Quieres el link?",
      "Aún sigo aprendiendo y no tengo esa información. Te recomiendo armar tu pedido o hacer tu consulta técnica directamente en nuestro WhatsApp pulsando el botón de la esquina inferior derecha. ¡Te atenderán rápido!"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const handleSend = () => {
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, "user");
    input.value = "";
    setTimeout(() => {
      addMsg(getBotResponse(text), "bot");
    }, 600 + Math.random() * 400);
  };

  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keypress", ev => {
    if (ev.key === "Enter") handleSend();
  });
}

/* ── INIT ── */
function init() {
  setupReveal();
  setupHeroMotion();
  setupHeroAutohide();
  setupCardTilt();
  ensureVideo();
  setupGridEffects();
  setupCartObserver();
  setupModal();
  setupChatbot();
  updateCartEffects();
}

init();
