// ── AI CHAT ──
const GEMINI_API_KEY = 'AQ.Ab8RN6KWbY_I9-_u3FFz7vW2UOr-_8lPwyV7lJTASAdgnbur7Q';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are the AI coaching assistant for Gold In Balance, founded by Adélia Saúde. Gold In Balance is a professional mentoring and coaching practice specialising in helping professional expat women build powerful networks in the Netherlands — turning "I don't know anyone here" into career opportunities and genuine belonging. Adélia has 20+ years of coaching experience, is multilingual (English, Dutch, Spanish, Portuguese), based in the Randstad, and is an elite athlete. Services include 1-on-1 coaching, group programmes, and leadership workshops.

Your role is to warmly welcome visitors, answer questions about coaching services, inspire people to take meaningful action, and encourage booking a free discovery call when relevant. Be warm, empowering, intercultural-aware, and concise (2-4 sentences). Never make up specific prices or dates.`;

const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage(text, 'msg-user');
  chatInput.value = '';
  chatSend.disabled = true;

  const loading = appendMessage('Thinking...', 'msg-loading');
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { maxOutputTokens: 400 }
      })
    });
    const data = await response.json();
    loading.remove();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    appendMessage(reply || 'Something went wrong, please try again.', 'msg-ai');
  } catch {
    loading.remove();
    appendMessage('Apologies, something went wrong. Please try again shortly.', 'msg-ai');
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatSend.disabled = false;
  chatInput.focus();
}

function appendMessage(text, className) {
  const el = document.createElement('div');
  el.className = `msg ${className}`;
  el.textContent = text;
  chatMessages.appendChild(el);
  return el;
}

if (chatSend) chatSend.addEventListener('click', sendMessage);
if (chatInput) chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

// ── CONTACT FORM ──
const FUNCTION_URL = "https://lzvrmeasjxvgliappcaq.supabase.co/functions/v1/submit-form";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dnJtZWFzanh2Z2xpYXBwY2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzgwOTksImV4cCI6MjA5Mjk1NDA5OX0.wqgQ7uvHwDsY5oW9Dv6T4QEi8h3Z58u-WE28XXgy1Z8";
const contactForm = document.getElementById("contactForm");
const submitBtn = contactForm?.querySelector("button[type='submit']");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name    = contactForm.querySelector("[name='name']").value.trim();
    const email   = contactForm.querySelector("[name='email']").value.trim();
    const phone   = contactForm.querySelector("[name='phone']")?.value.trim() || "";
    const day     = contactForm.querySelector("[name='day']")?.value || "";
    const time    = contactForm.querySelector("[name='time']")?.value || "";
    const message = contactForm.querySelector("[name='message']")?.value.trim() || "";
    const service = "Session Booking";

    if (!name || !email || !day || !time) {
      showFormStatus("Please fill in all required fields.", "error");

      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ name, email, phone, day, time, message, service }),
      });

      const data = await res.json();

      if (!res.ok) {
        showFormStatus(data.error || "Something went wrong. Please try again.", "error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Book My Session";
        return;
      }

      contactForm.style.display = "none";
      showFormStatus("Thank you! I'll be in touch within one business day.", "success");

    } catch {
      showFormStatus("Connection error. Please try again.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });
}

function showFormStatus(msg, type) {
  let el = document.getElementById("formStatus");
  if (!el) {
    el = document.createElement("div");
    el.id = "formStatus";
    contactForm.parentNode.insertBefore(el, contactForm.nextSibling);
  }
  el.textContent = msg;
  el.style.cssText = `
    margin-top: 16px;
    padding: 14px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    border-left: 4px solid ${type === "success" ? "#5BA2B9" : "#E24B4A"};
    background: ${type === "success" ? "#EAF4F8" : "#FCEBEB"};
    color: ${type === "success" ? "#3D7A8F" : "#A32D2D"};
  `;
}

// ── ROUTER ──
function navigateTo(pageId, sectionId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (sectionId) {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  const titles = { home: 'Gold In Balance | Mentoring & Coaching', about: 'Meet Adélia | Gold In Balance', gallery: 'Gallery | Gold In Balance' };
  document.title = titles[pageId] || titles.home;
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-page]');
  if (!el) return;
  e.preventDefault();
  navigateTo(el.dataset.page, el.dataset.section || null);
  if (document.querySelector('.nav-links.open')) {
    document.querySelector('.nav-links').classList.remove('open');
  }
});

// ── LIGHTBOX ──
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
let currentIndex  = 0;
let activePhotos  = [];

function getActivePhotos() {
  const activePage = document.querySelector('.page.active');
  return [...(activePage || document).querySelectorAll('.photo-strip-item:not(.photo-strip-item--more)')]
    .map(el => el.querySelector('img').src);
}

function openLightbox(index) {
  activePhotos = getActivePhotos();
  currentIndex = index;
  lightboxImg.src = activePhotos[currentIndex];
  lightboxCounter.textContent = `${currentIndex + 1} / ${activePhotos.length}`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showPhoto(index) {
  currentIndex = (index + activePhotos.length) % activePhotos.length;
  lightboxImg.src = activePhotos[currentIndex];
  lightboxCounter.textContent = `${currentIndex + 1} / ${activePhotos.length}`;
}

document.addEventListener('click', e => {
  const item = e.target.closest('.photo-strip-item');
  if (!item || item.classList.contains('photo-strip-item--more')) return;
  if (e.target.closest('[data-page]')) return;
  const siblings = [...item.closest('.photo-strip, .gallery-grid').querySelectorAll('.photo-strip-item:not(.photo-strip-item--more)')];
  const idx = siblings.indexOf(item);
  openLightbox(idx);
});

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => showPhoto(currentIndex - 1));
document.getElementById('lightboxNext').addEventListener('click', () => showPhoto(currentIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showPhoto(currentIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
});

// ── TESTIMONIALS SLIDER ──
(function () {
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('testPrev');
  const nextBtn = document.getElementById('testNext');
  if (!track || !prevBtn || !nextBtn) return;

  const cards = [...track.querySelectorAll('.testimonial-card')];
  let current = 0;

  function getVisible() {
    if (window.innerWidth > 960) return 3;
    if (window.innerWidth > 640) return 2;
    return 1;
  }

  function getMax() { return Math.max(0, cards.length - getVisible()); }

  function update() {
    const gap = 24;
    const cardWidth = cards[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= getMax();
  }

  prevBtn.addEventListener('click', () => { current = Math.max(0, current - 1); update(); });
  nextBtn.addEventListener('click', () => { current = Math.min(getMax(), current + 1); update(); });

  window.addEventListener('resize', () => {
    current = Math.min(current, getMax());
    update();
  });

  update();
})();

// ── MOBILE NAV ──
const burger = document.querySelector('.nav-burger');
const navLinks = document.querySelector('.nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}