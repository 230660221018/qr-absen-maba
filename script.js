/*  =======================
    PENCARIAN FOTO NRP
    - Membaca data.json (sekali, lalu di-cache)
    - Mencari NRP yang dimasukkan user
    - Menampilkan foto + tombol download
    - Aman untuk Netlify / GitHub Pages / Niagahoster
    ======================= */

let CACHE_DATA = null;        // cache isi data.json
let LOADING = false;          // status loading agar tidak fetch berulang

const elInput  = document.getElementById('nrpInput');
const elStatus = document.getElementById('status');
const elHasil  = document.getElementById('hasil');

/** Util: tampilkan status */
function setStatus(msg, type = ''){
  elStatus.className = `status ${type}`;
  elStatus.textContent = msg || '';
}

/** Util: escape HTML sederhana */
function esc(str){ return (str||'').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s])); }

/** Muat data.json sekali lalu simpan di cache */
async function loadData(){
  if (CACHE_DATA || LOADING) return CACHE_DATA;
  try{
    LOADING = true;
    setStatus('Memuat data…');
    const res = await fetch('data.json', {cache: 'no-store'});
    if (!res.ok) throw new Error('HTTP '+res.status);
    const json = await res.json();
    CACHE_DATA = Array.isArray(json) ? json : [];
    setStatus(`Data siap.`, 'ok');
    return CACHE_DATA;
  }catch(err){
    console.error(err);
    setStatus('Gagal memuat data. Pastikan situs dibuka via Live Server/hosting & data.json ada.', 'error');
    return null;
  }finally{
    LOADING = false;
  }
}

/** Cari foto berdasarkan NRP (klik tombol) */
async function cariFoto(){
  const nrp = (elInput.value || '').trim();
  elHasil.innerHTML = '';
  if (!nrp){
    setStatus('NRP tidak boleh kosong.', 'error');
    return;
  }

  const data = await loadData();
  if (!data) return;

  // Pencarian exact match
  const item = data.find(d => (d.nrp||'').trim() === nrp);
  if (!item){
    setStatus('NRP tidak ditemukan.', 'error');
    return;
  }

  setStatus('');

  // Tentukan path foto final (pakai folder /foto/)
  const fotoPath = `foto/${item.foto}`;

  // Buat elemen hasil dengan loading ringan
  const wrap = document.createElement('div');
  wrap.className = 'card-result';
  wrap.innerHTML = `
    <img class="preview" alt="Foto ${esc(item.nrp)}" />
    <div class="meta">
      <span class="nrp-label">NRP: ${esc(item.nrp)}</span>
      <a class="download-btn" href="${encodeURI(fotoPath)}" download="${esc(item.foto)}">Download Foto</a>
    </div>
  `;
  elHasil.appendChild(wrap);

  // Load gambar dengan verifikasi onload/onerror
  const img = wrap.querySelector('.preview');
  img.addEventListener('error', () => {
    setStatus('Foto ditemukan di data.json namun file gambar tidak ada / namanya beda (cek folder /foto).', 'error');
    img.remove();
  });
  img.addEventListener('load', () => {
    // opsional: bisa setStatus('Siap diunduh', 'ok');
  });
  // Mulai load
  img.src = fotoPath;
}

/* Enter untuk submit lebih cepat */
elInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    cariFoto();
  }
});
