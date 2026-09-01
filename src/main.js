const imageAssets = {
  miona: new URL('./assets/miona.jpg', import.meta.url).href,
  arin: new URL('./assets/arin.jpg', import.meta.url).href,
  elsia: new URL('./assets/elsia.jpg', import.meta.url).href
};

const seedContent = {
  intro: 'สวัสดีค่ะ ยินดีต้อนรับเข้าสู่สวนเล็ก ๆ ของเรา ♡',
  introEn: 'Hi! Welcome to our tiny apple garden. This is a cozy place for my OCs, their worlds, and little stories.',
  characters: [
    { id: 'miona', name: 'มาดาระเมะ มิอง', en: 'Madarame Mion', nickname: 'น้องหัวเหลือง', fandom: 'Tokyo Revengers · ด้อมโตมัน', age: '15 ขวบ · years old', color: 'yellow', image: imageAssets.miona, tag: 'sunny apple', bio: 'เด็กสาวผมเหลืองผู้ชอบวันที่แดดอุ่น ๆ และเรื่องวุ่น ๆ ในบ้านต้นแอปเปิ้ล' },
    { id: 'arin', name: 'คัง อาริน', en: 'Kang Arin', nickname: 'น้องหัวแดง', fandom: 'Weak Hero · โรงเรียนสตรี', age: 'school girl · นักเรียน', color: 'red', image: imageAssets.arin, tag: 'red apple', bio: 'เด็กสาวหัวแดงจากโรงเรียนสตรี ผู้มีหัวใจกล้าหาญกว่าที่เห็น' },
    { id: 'elsia', name: 'เอลเซีย', en: 'Elsia', nickname: 'น้องหัวฟาง (???)', fandom: 'That Time I Got Reincarnated as a Slime', age: 'dark elf · ดาร์กเอลฟ์', color: 'purple', image: imageAssets.elsia, tag: 'wild apple', bio: 'ดาร์กเอลฟ์ลึกลับที่ชอบซ่อนตัวในร่มไม้ แต่แอบมองทุกคนอยู่เสมอ' }
  ],
  gallery: [
    { image: imageAssets.miona, label: 'mion in the kitchen', sub: 'มิอง · sunny days', color: 'yellow' },
    { image: imageAssets.arin, label: 'arin, softly', sub: 'อาริน · red mood', color: 'red' },
    { image: imageAssets.elsia, label: 'elsia under leaves', sub: 'เอลเซีย · forest au', color: 'purple' }
  ]
};

const state = { content: structuredClone(seedContent), lang: 'th', token: localStorage.getItem('apple-admin-token') };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function applySavedContent() {
  try {
    const saved = JSON.parse(localStorage.getItem('apple-content'));
    if (saved) state.content = { ...state.content, ...saved };
  } catch { /* keep seed content */ }
}

async function loadContent() {
  applySavedContent();
  try {
    const response = await fetch('/api/content');
    if (response.ok) {
      const remoteContent = await response.json();
      state.content = { ...state.content, ...remoteContent };
    }
  } catch { /* Vite / GitHub Pages uses the local seeded content */ }
  render();
}

function render() {
  $('[data-content="intro"]').textContent = state.content.intro;
  $('[data-content="introEn"]').textContent = state.content.introEn;
  renderCharacters();
  renderGallery();
}

function renderCharacters() {
  $('#characterGrid').innerHTML = state.content.characters.map((character, index) => `
    <article class="character-card ${character.color}" style="--delay: ${index * 80}ms">
      <div class="character-image-wrap"><img src="${character.image}" alt="${character.name}" /><span class="character-sticker">${index === 0 ? '☼' : index === 1 ? '♡' : '✦'}</span></div>
      <div class="character-copy"><span class="character-tag">${character.tag}</span><h3>${character.name}</h3><p class="english-name">${character.en}</p><p class="character-meta">${character.nickname} · ${character.age}</p><p>${character.bio}</p><div class="fandom-label">${character.fandom}</div><button class="small-link" data-gallery="${character.id}">view in gallery ↗</button></div>
    </article>`).join('');
}

function renderGallery() {
  const gallery = state.content.gallery;
  $('#galleryCount').textContent = `${String(gallery.length).padStart(2, '0')} photos`;
  $('#galleryGrid').innerHTML = gallery.map((item, index) => `<figure class="gallery-item ${item.color}" style="--rotation: ${index % 2 ? '2deg' : '-2deg'}"><div class="gallery-image"><img src="${item.image}" alt="${item.label}" loading="lazy" /><span>♡</span></div><figcaption><b>${item.label}</b><small>${item.sub}</small></figcaption></figure>`).join('');
}

function showPage(page) {
  $$('.page').forEach(section => section.classList.toggle('active', section.id === `page-${page}`));
  $$('.nav-tab').forEach(button => button.classList.toggle('active', button.dataset.page === page));
  window.location.hash = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openModal(id) { $('#' + id).hidden = false; document.body.classList.add('modal-open'); }
function closeModal(id) { $('#' + id).hidden = true; if ($$('.modal-backdrop:not([hidden])').length === 0) document.body.classList.remove('modal-open'); }

$$('.nav-tab').forEach(button => button.addEventListener('click', () => showPage(button.dataset.page)));
$$('[data-go]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.go)));
$('#adminButton').addEventListener('click', () => state.token ? openModal('adminModal') : openModal('loginModal'));
$$('[data-close]').forEach(button => button.addEventListener('click', () => closeModal(button.dataset.close)));
$$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(backdrop.id); }));

$('#languageToggle').addEventListener('click', () => {
  state.lang = state.lang === 'th' ? 'en' : 'th';
  $$('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    const english = { online: 'garden is blooming', welcome: 'welcome to apple tree house', welcomeSub: 'a tiny place for me and my little OCs', aboutTab: 'about', charactersTab: 'characters', galleryTab: 'gallery', aboutTitle: 'about me', ownerNote: 'a tiny corner for OCs and the AUs I love', later: "i'll add it later", gardenTitle: 'meet the little apples', gardenSub: 'three little OCs in this house, waiting to say hello' };
    const thai = { online: 'สวนกำลังผลิบาน', welcome: 'ยินดีต้อนรับสู่บ้านต้นแอปเปิ้ล', welcomeSub: 'พื้นที่เล็ก ๆ สำหรับฉันและเด็ก ๆ ของเรา', aboutTab: 'about', charactersTab: 'characters', galleryTab: 'gallery', aboutTitle: 'about me', ownerNote: 'เป็นมุมเล็ก ๆ ที่เก็บเรื่องราวของโอซีและ AU ที่รัก', later: "i'll add it later / จะมาเติมทีหลัง", gardenTitle: 'meet the little apples', gardenSub: 'เด็ก ๆ ทั้งสามคนในบ้านของเรา รอให้คุณแวะมาทำความรู้จัก' };
    element.textContent = (state.lang === 'en' ? english : thai)[key] || element.textContent;
  });
});

$('#loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const message = $('#loginMessage');
  message.textContent = 'opening the garden gate…';
  try {
    const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
    if (!response.ok) throw new Error('login failed');
    const result = await response.json(); state.token = result.token; localStorage.setItem('apple-admin-token', state.token);
  } catch {
    if (form.get('email') === 'admin@example.com' && form.get('password') === 'appletree') { state.token = 'demo-admin-token'; localStorage.setItem('apple-admin-token', state.token); } else { message.textContent = 'ลองใหม่อีกครั้งนะ · please check your login'; return; }
  }
  closeModal('loginModal'); openModal('adminModal'); fillAdminForm();
});

function fillAdminForm() { $('#contentForm [name="intro"]').value = state.content.intro; $('#contentForm [name="introEn"]').value = state.content.introEn; }
$('#contentForm').addEventListener('submit', async event => {
  event.preventDefault();
  const update = Object.fromEntries(new FormData(event.currentTarget));
  state.content = { ...state.content, ...update }; localStorage.setItem('apple-content', JSON.stringify({ intro: update.intro, introEn: update.introEn, gallery: state.content.gallery })); render();
  try { await fetch('/api/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}` }, body: JSON.stringify({ ...update, gallery: state.content.gallery }) }); } catch { /* local save remains available */ }
  $('#saveMessage').textContent = 'saved softly ♡ · บันทึกแล้ว';
});
$('#galleryForm').addEventListener('submit', async event => {
  event.preventDefault();
  const photo = Object.fromEntries(new FormData(event.currentTarget));
  state.content.gallery = [...state.content.gallery, photo];
  localStorage.setItem('apple-content', JSON.stringify({ intro: state.content.intro, introEn: state.content.introEn, gallery: state.content.gallery }));
  render();
  try { await fetch('/api/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}` }, body: JSON.stringify({ gallery: state.content.gallery }) }); } catch { /* local save remains available */ }
  event.currentTarget.reset(); $('#galleryMessage').textContent = 'photo added ♡ · เพิ่มรูปแล้ว';
});
$('#resetContent').addEventListener('click', () => { localStorage.removeItem('apple-content'); state.content = structuredClone(seedContent); fillAdminForm(); render(); $('#saveMessage').textContent = 'กลับเป็นข้อมูลตั้งต้นแล้ว'; });
$('#logoutButton').addEventListener('click', () => { state.token = null; localStorage.removeItem('apple-admin-token'); closeModal('adminModal'); });

$('#year').textContent = new Date().getFullYear();
function tick() { $('#clock').textContent = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date()).toLowerCase(); }
tick(); setInterval(tick, 30000);
const initialPage = window.location.hash.replace('#', ''); if (['about', 'characters', 'gallery'].includes(initialPage)) showPage(initialPage);
loadContent();
