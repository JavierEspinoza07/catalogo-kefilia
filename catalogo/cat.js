/* cat.js — Kefilia enhancement layer */

const hero = document.querySelector(".catalog-head");
const heroCopy = document.querySelector(".hero-copy");
const productGrid = document.querySelector(".products-grid");
const cartListEl = document.getElementById("cartList");
const cartBlock = document.querySelector(".cart-static");
const cartWhatsapp = document.getElementById("cartWA");
const floatingCta = document.getElementById("floatingCta");
const floatingCount = document.getElementById("floatingCartCount");
const toastStack = document.getElementById("toastStack");

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
  const colors = ["#ff8a5b", "#ffd166", "#8edcc8", "#ff5d8f", "#b38cdc", "#5ee8a0"];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("span");
    p.className = "confetti-piece";
    p.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]}`;
    p.style.setProperty("--dx", `${(Math.random() * 2 - 1) * 150}px`);
    p.style.setProperty("--dy", `${90 + Math.random() * 130}px`);
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
    heroCopy.style.transform = `translate(${((x - 50) / 50) * 10}px, ${((y - 50) / 50) * 8}px)`;
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
  const reveal = () => { heroCopy.classList.remove("is-hidden"); schedule(2400); };
  schedule();
  hero.addEventListener("pointerenter", reveal);
  hero.addEventListener("pointermove", reveal);
  hero.addEventListener("click", reveal);
  hero.addEventListener("touchstart", reveal, { passive: true });
}

/* ── CARD 3D TILT ── */
function setupCardTilt() {
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("pointermove", ev => {
      const r = card.getBoundingClientRect();
      const rx = ((ev.clientY - r.top) / r.height - 0.5) * -10;
      const ry = ((ev.clientX - r.left) / r.width - 0.5) * 10;
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
    v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
    const p = v.play();
    if (p?.catch) p.catch(() => { });
  };
  v.muted = true; v.setAttribute("muted", "");
  const iv = setInterval(play, 900);
  setTimeout(() => clearInterval(iv), 8000);
  v.addEventListener("loadedmetadata", play, { once: true });
  v.addEventListener("canplay", play, { once: true });
  v.addEventListener("playing", () => clearInterval(iv), { once: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) play(); });
  ["touchstart", "pointerdown", "click"].forEach(e => window.addEventListener(e, play, { passive: true, once: true }));
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
    const mode = btn.classList.contains("add-jar") ? "con frasco" : "como refill";
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

  // --- CONFIGURACIÓN DE IA (OPENROUTER) ---
  const OPENROUTER_API_KEY = "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";
  let chatHistory = [];

  // Instrucciones del sistema (se inyectan como primer intercambio de la conversación)
  const SYSTEM_PROMPT = "Eres Kefibot, el asistente virtual experto, amable y persuasivo de Kefilia, una empresa de Kefir artesanal en La Paz, Bolivia. Tu objetivo es ayudar a los clientes, vender productos y responder CUALQUIER pregunta que tengan. Informacion clave de precios: Kefir Natural Bs 40 (frasco) Bs 27 (refill). Strawkefir, Chocokefir y MandaKefir Bs 48 (frasco) Bs 34 (refill). PassionKef Bs 48 (frasco) Bs 38 (refill). Kefeach Bs 52 (frasco) Bs 38 (refill). Cocokef Bs 52 (frasco) Bs 42 (refill). Griego Natural Bs 63 (frasco) Bs 50 (refill). Strawkefir Griego, Chocokefir Griego y PassionKef Griego Bs 70 (frasco) Bs 57 (refill). Kefeach Griego Bs 74 (frasco) Bs 64 (refill). Sistema Refill: la primera vez pagan el frasco de vidrio, luego solo el contenido. Envios en La Paz con cadena de frio. Pagos: QR, transferencia, efectivo. Se conversacional, usa emojis, responde de forma corta y amigable.";

  const FALLBACK_MESSAGE = "¡Hola! Disculpas, mi sistema de respuestas automáticas está temporalmente saturado 😅. Pero no te preocupes, puedes hacer tus consultas o enviarnos tu pedido haciendo clic en el botón de **Pedir por WhatsApp** o directamente en el carrito de compras. ¡Te atenderemos personalmente de inmediato! 🍯✨";

  const getAIResponse = async (userText) => {
    const maxRetries = 3;
    let attempt = 0;

    // Convertir historial a formato OpenAI/OpenRouter (system, user, assistant)
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "assistant", content: "Entendido, soy Kefibot y estoy listo para ayudar a los clientes de Kefilia." },
      ...chatHistory.map(h => ({
        role: h.role === "model" ? "assistant" : "user",
        content: h.parts[0].text
      })),
      { role: "user", content: userText }
    ];

    while (attempt < maxRetries) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + OPENROUTER_API_KEY
          },
          body: JSON.stringify({
            model: "openrouter/free",
            messages: messages
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`OpenRouter API HTTP error (intentando ${attempt + 1}/${maxRetries}):`, response.status, errText);

          // Si es un error transitorio (429, 503 o cualquier 5xx), reintentamos después de una espera exponencial.
          if (response.status === 429 || response.status === 503 || response.status >= 500) {
            attempt++;
            if (attempt < maxRetries) {
              const delay = attempt * 1500;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }

          return FALLBACK_MESSAGE;
        }

        const data = await response.json();
        console.log("OpenRouter response:", data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
          const botReply = data.choices[0].message.content;
          chatHistory.push({ role: "user", parts: [{ text: userText }] });
          chatHistory.push({ role: "model", parts: [{ text: botReply }] });
          if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);
          return botReply;
        } else {
          console.error("OpenRouter respuesta inesperada:", data);
          return FALLBACK_MESSAGE;
        }
      } catch (error) {
        console.error(`Fetch error (intentando ${attempt + 1}/${maxRetries}):`, error);
        attempt++;
        if (attempt < maxRetries) {
          const delay = attempt * 1500;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        return FALLBACK_MESSAGE;
      }
    }
  };

  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, "user");
    input.value = "";

    // Mostramos un indicador de "escribiendo..."
    const typingId = "typing-" + Date.now();
    const typingEl = document.createElement("div");
    typingEl.className = `chat-msg bot`;
    typingEl.id = typingId;
    typingEl.innerHTML = `<div class="msg-bubble"><em>Pensando... 🧠</em></div>`;
    messages.appendChild(typingEl);
    messages.scrollTop = messages.scrollHeight;

    // Llamamos a la IA real
    const aiResponse = await getAIResponse(text);

    // Removemos el "pensando" y añadimos la respuesta real
    const tEl = document.getElementById(typingId);
    if (tEl) tEl.remove();

    // Formatear markdown básico (negritas)
    const formattedResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    addMsg(formattedResponse, "bot");
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
