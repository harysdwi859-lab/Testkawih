/* ─── AISinja app.js ─────────────────────── */

const API = {
  quotesanime: 'https://api.danzy.web.id/api/random/quotesanime',
  ytmp3:       'https://api.danzy.web.id/api/download/ytmp3',
  ytmp4:       'https://api.danzy.web.id/api/download/ytmp4',
  facebook:    'https://api.danzy.web.id/api/download/facebook',
  instagram:   'https://api.danzy.web.id/api/download/instagram',
  tiktok:      'https://api.danzy.web.id/api/download/tiktok',
  spotify:     'https://api.danzy.web.id/api/download/spotify',
  removebg:    'https://api.danzy.web.id/api/maker/removebg',
  upscale:     'https://api.danzy.web.id/api/tools/upscale',
  timpa:       'https://api.danzy.web.id/api/maker/timpa',
  haramgen:    'https://api.danzy.web.id/api/ai/nsfwgen',
  haramedit:   'https://api.danzy.web.id/api/ai/editimg',
  harameditv2: 'https://api.danzy.web.id/api/maker/deepnude',
};

const GIRL_APIS = [
  'https://app.siputzx.my.id/api/r/cecan/china',
  'https://app.siputzx.my.id/api/r/cecan/japan',
  'https://app.siputzx.my.id/api/r/cecan/korea',
];

const LOADING_MSGS = [
  'Sabar proses dulu, Sambil nunggu liat cewek cantik ye kan 😏',
  'Diproses dulu bang, jangan kemana-mana dulu ye 🙏',
  'Tunggu sebentar, sistemnya lagi kerja keras nih 💪',
  'Proses lagi jalan, nikmatin dulu pemandangannya 👀',
  'Sabar sabar, yang bagus butuh waktu 😌',
  'Loading... tapi view-nya gratis kan? 😁',
];

/* ─── PAGE NAVIGATION ─────────────────────── */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + name);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openMusic() {
  window.open('https://kawihfy.vercel.app', '_blank');
}

function toggleMobileMenu() {
  const m = document.getElementById('mobile-menu');
  m.classList.toggle('hidden');
}

/* ─── TAB SWITCHER ─────────────────────── */
function switchTab(prefix, name, btn) {
  document.querySelectorAll(`[id^="${prefix}-"]`).forEach(p => {
    p.classList.remove('active-panel');
  });
  btn.closest('.tool-tabs').querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
  });
  const panel = document.getElementById(`${prefix}-${name}`);
  if (panel) panel.classList.add('active-panel');
  btn.classList.add('active');
}

/* ─── LOADING SCREEN ─────────────────────── */
let loadingTimer = null;

function loadGirlImage() {
  const girlImg = document.getElementById('loading-girl');
  const apiUrl  = GIRL_APIS[Math.floor(Math.random() * GIRL_APIS.length)];
  const bust    = '?t=' + Date.now();

  girlImg.style.opacity = '0';
  girlImg.src = '';

  const tmp = new Image();
  tmp.referrerPolicy = 'no-referrer';
  tmp.crossOrigin    = 'anonymous';
  tmp.onload = () => {
    girlImg.src           = tmp.src;
    girlImg.style.opacity = '1';
  };
  tmp.onerror = () => {
    // Kalau API block crossOrigin, coba tanpa crossOrigin
    const tmp2 = new Image();
    tmp2.referrerPolicy = 'no-referrer';
    tmp2.onload = () => {
      girlImg.src           = tmp2.src;
      girlImg.style.opacity = '1';
    };
    tmp2.onerror = () => {
      girlImg.src           = 'https://picsum.photos/seed/' + Math.floor(Math.random() * 999) + '/400/533';
      girlImg.style.opacity = '1';
    };
    tmp2.src = apiUrl + bust;
  };
  tmp.src = apiUrl + bust;
}

function showLoading(callback) {
  const screen   = document.getElementById('loading-screen');
  const progress = document.getElementById('loading-progress');
  const timerEl  = document.getElementById('loading-timer');
  const msgEl    = document.getElementById('loading-msg');

  msgEl.textContent = LOADING_MSGS[Math.floor(Math.random() * LOADING_MSGS.length)];
  loadGirlImage(); // load via img src (no CORS issue)

  screen.classList.remove('hidden');
  progress.style.width = '0%';

  const duration = 5000;
  const start = Date.now();

  clearInterval(loadingTimer);
  loadingTimer = setInterval(() => {
    const elapsed   = Date.now() - start;
    const pct       = Math.min((elapsed / duration) * 100, 100);
    const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
    progress.style.width = pct + '%';
    timerEl.textContent  = remaining + 's';
    if (elapsed >= duration) {
      clearInterval(loadingTimer);
      screen.classList.add('hidden');
      if (typeof callback === 'function') callback();
    }
  }, 100);
}

function hideLoading() {
  clearInterval(loadingTimer);
  document.getElementById('loading-screen').classList.add('hidden');
}

/* ─── RESULT MODAL ─────────────────────── */
function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('result-modal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('result-modal').classList.add('hidden');
}
document.getElementById('result-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

/* ─── HELPER: safe JSON parse + auto download trigger ─────────────────────── */
async function safeFetch(url, options) {
  const res = await fetch(url, options);
  const ct  = res.headers.get('content-type') || '';
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${res.statusText}`);
  }
  if (!ct.includes('json')) {
    const text = await res.text();
    throw new Error(`Respons bukan JSON: ${text.substring(0, 120)}`);
  }
  return res.json();
}

// Trigger download otomatis + tampilkan preview popup
function triggerAutoDownload(url, filename, previewHtml) {
  // Buat anchor → klik otomatis
  const a = document.createElement('a');
  a.href     = url;
  a.download = filename || 'download';
  a.target   = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Tampilkan modal preview setelah trigger
  showModal(previewHtml);
}

/* ─── DOWNLOAD HANDLER ─────────────────────── */
function runDownload(type) {
  const urlInput = document.getElementById(type + '-url');
  const url      = urlInput ? urlInput.value.trim() : '';
  if (!url) { alert('Masukkan URL terlebih dahulu!'); return; }

  // FIX #5 — Spotify 403: info dulu sebelum request
  if (type === 'spotify') {
    showLoading(async () => {
      try {
        const data = await safeFetch(`${API.spotify}?url=${encodeURIComponent(url)}`);
        renderDownloadResult(type, data, url);
      } catch(e) {
        if (e.message.includes('403') || e.message.toLowerCase().includes('forbidden')) {
          showModal(`<h3>⚠️ Spotify Tidak Tersedia</h3><p class="result-err">API Spotify sedang error 403 (akses ditolak dari server pihak ketiga). Coba lagi nanti atau gunakan converter lain seperti <a href="https://spotifydown.com" target="_blank">spotifydown.com</a>.</p>`);
        } else {
          showModal(`<h3>❌ Error</h3><p class="result-err">${e.message}</p>`);
        }
      }
    });
    return;
  }

  showLoading(async () => {
    try {
      const data = await safeFetch(`${API[type]}?url=${encodeURIComponent(url)}`);
      renderDownloadResult(type, data, url);
    } catch(e) {
      showModal(`<h3>❌ Error</h3><p class="result-err">Gagal menghubungi server atau respons tidak valid.<br><small>${e.message}</small></p>`);
    }
  });
}

function renderDownloadResult(type, data, originalUrl) {
  let html = `<h3>✅ ${type.toUpperCase()} — Hasil Download</h3>`;

  if (!data || data.status === false || data.error) {
    html += `<p class="result-err">⚠ ${data?.message || data?.error || 'Tidak ada hasil.'}</p>`;
    showModal(html); return;
  }

  // FIX #3 — YT MP3
  if (type === 'ytmp3') {
    const link  = data?.data?.download || data?.result?.link || data?.link || data?.url || data?.download;
    const title = data?.data?.title    || data?.result?.title || data?.title || 'Audio';
    const thumb = data?.data?.thumbnail || data?.result?.thumbnail || data?.thumbnail || '';
    html += thumb ? `<img src="${thumb}" class="result-img" style="max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : '';
    html += `<p><b>${title}</b></p>`;
    if (link) {
      html += `<a href="${link}" target="_blank" download class="dl-btn">⬇ Download MP3</a>`;
      triggerAutoDownload(link, title + '.mp3', html);
    } else {
      html += `<p class="result-err">Link tidak ditemukan dalam respons API.</p>`;
      showModal(html);
    }
    return;
  }

  // FIX #3 — YT MP4
  if (type === 'ytmp4') {
    // Coba ambil semua kualitas kalau ada
    const qualities = data?.data?.qualities || data?.result?.qualities || null;
    const link  = data?.data?.download || data?.result?.link || data?.link || data?.url || data?.download;
    const title = data?.data?.title    || data?.result?.title || data?.title || 'Video';
    const thumb = data?.data?.thumbnail || data?.result?.thumbnail || data?.thumbnail || '';
    html += thumb ? `<img src="${thumb}" class="result-img" style="max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : '';
    html += `<p><b>${title}</b></p>`;
    if (qualities && Array.isArray(qualities) && qualities.length) {
      qualities.forEach(q => {
        const ql = q?.url || q?.link || q?.download;
        if (ql) html += `<a href="${ql}" target="_blank" download class="dl-btn">⬇ ${q?.quality || 'Video'}</a>`;
      });
      showModal(html);
    } else if (link) {
      html += `<a href="${link}" target="_blank" download class="dl-btn">⬇ Download MP4</a>`;
      triggerAutoDownload(link, title + '.mp4', html);
    } else {
      html += `<p class="result-err">Link tidak ditemukan dalam respons API.</p>`;
      showModal(html);
    }
    return;
  }

  // FIX #4 — Facebook: auto download dengan preview
  if (type === 'facebook') {
    const hd  = data?.data?.hd    || data?.result?.hd    || data?.hd    || null;
    const sd  = data?.data?.sd    || data?.result?.sd    || data?.sd    || null;
    const url = data?.data?.url   || data?.result?.url   || data?.url   || null;
    const title = data?.data?.title || data?.title || 'Video Facebook';
    const thumb = data?.data?.thumbnail || data?.thumbnail || '';
    html += thumb ? `<img src="${thumb}" class="result-img" style="max-height:160px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : '';
    html += `<p><b>${title}</b></p>`;
    const bestLink = hd || sd || url;
    if (hd)  html += `<a href="${hd}"  target="_blank" download class="dl-btn">⬇ Download HD</a>`;
    if (sd)  html += `<a href="${sd}"  target="_blank" download class="dl-btn">⬇ Download SD</a>`;
    if (!hd && !sd && url) html += `<a href="${url}" target="_blank" download class="dl-btn">⬇ Download Video</a>`;
    if (!bestLink) { html += `<p class="result-err">Link tidak ditemukan.</p>`; showModal(html); return; }
    triggerAutoDownload(bestLink, title + '.mp4', html);
    return;
  }

  // FIX #4 — TikTok: auto download + preview
  if (type === 'tiktok') {
    const nowm  = data?.data?.nowatermark || data?.result?.nowatermark || data?.nowatermark || null;
    const wm    = data?.data?.watermark   || data?.result?.watermark   || data?.watermark   || null;
    const url   = data?.data?.url || data?.result?.url || data?.url || null;
    const title = data?.data?.title || data?.title || 'Video TikTok';
    const thumb = data?.data?.cover || data?.data?.thumbnail || data?.thumbnail || '';
    html += thumb ? `<img src="${thumb}" class="result-img" style="max-height:200px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />` : '';
    html += `<p><b>${title}</b></p>`;
    const bestLink = nowm || wm || url;
    if (nowm) html += `<a href="${nowm}" target="_blank" download class="dl-btn">⬇ Download No Watermark</a>`;
    if (wm)   html += `<a href="${wm}"   target="_blank" download class="dl-btn">⬇ Download With Watermark</a>`;
    if (!nowm && !wm && url) html += `<a href="${url}" target="_blank" download class="dl-btn">⬇ Download</a>`;
    if (!bestLink) { html += `<p class="result-err">Link tidak ditemukan.</p>`; showModal(html); return; }
    triggerAutoDownload(bestLink, 'tiktok.mp4', html);
    return;
  }

  // Instagram
  if (type === 'instagram') {
    const items = data?.data?.medias || data?.result || data?.media || [];
    if (Array.isArray(items) && items.length > 0) {
      items.forEach((item, i) => {
        const link  = item?.url || item?.link || item?.download;
        const isVid = item?.type === 'video' || (link && link.includes('.mp4'));
        if (link) html += `<a href="${link}" target="_blank" download class="dl-btn">${isVid ? '🎬' : '🖼'} Media ${i+1}</a>`;
      });
    } else {
      const link = data?.data?.url || data?.url || data?.link;
      if (link) html += `<a href="${link}" target="_blank" download class="dl-btn">⬇ Download</a>`;
      else html += `<p class="result-err">Tidak ada media ditemukan.</p>`;
    }
    showModal(html);
    return;
  }

  // Generic fallback
  const link  = data?.data?.download || data?.result?.url || data?.url || data?.link || data?.download;
  const title = data?.data?.title    || data?.title || type.toUpperCase();
  html += `<p><b>${title}</b></p>`;
  if (link) {
    html += `<a href="${link}" target="_blank" download class="dl-btn">⬇ Download</a>`;
    triggerAutoDownload(link, title, html);
  } else {
    html += `<p class="result-err">Respons API tidak terbaca otomatis.</p>`;
    showModal(html);
  }
}

/* ─── EDITING HANDLER ─────────────────────── */
function runEdit(type) {
  if (type === 'removebg') {
    const url  = document.getElementById('removebg-url').value.trim();
    const file = document.getElementById('removebg-file').files[0];
    if (!url && !file) { alert('Masukkan URL atau upload gambar!'); return; }
    showLoading(async () => {
      try {
        let res;
        if (file) {
          const form = new FormData();
          form.append('image', file);
          res = await fetch(API.removebg, { method: 'POST', body: form });
        } else {
          res = await fetch(`${API.removebg}?url=${encodeURIComponent(url)}`);
        }
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('image')) {
          const blob   = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          showModal(`<h3>✅ Background Dihapus!</h3><img src="${objUrl}" class="result-img" /><a href="${objUrl}" download="no-bg.png" class="dl-btn">⬇ Download Hasil</a>`);
        } else {
          const data   = await res.json();
          const imgUrl = data?.result?.url || data?.data?.url || data?.url || data?.image;
          if (imgUrl) showModal(`<h3>✅ Background Dihapus!</h3><img src="${imgUrl}" class="result-img" /><a href="${imgUrl}" target="_blank" download class="dl-btn">⬇ Download Hasil</a>`);
          else showModal(`<h3>❌ Error</h3><p class="result-err">${JSON.stringify(data)}</p>`);
        }
      } catch(e) {
        showModal(`<h3>❌ Error</h3><p class="result-err">${e.message}</p>`);
      }
    });
  }

  else if (type === 'upscale') {
    const url  = document.getElementById('upscale-url').value.trim();
    const file = document.getElementById('upscale-file').files[0];
    if (!url && !file) { alert('Masukkan URL atau upload gambar!'); return; }
    showLoading(async () => {
      try {
        let res;
        if (file) {
          const form = new FormData();
          form.append('image', file);
          res = await fetch(API.upscale, { method: 'POST', body: form });
        } else {
          res = await fetch(`${API.upscale}?url=${encodeURIComponent(url)}`);
        }
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('image')) {
          const blob   = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          showModal(`<h3>✅ Gambar Diupscale!</h3><img src="${objUrl}" class="result-img" /><a href="${objUrl}" download="upscaled.png" class="dl-btn">⬇ Download Hasil</a>`);
        } else {
          const data   = await res.json();
          const imgUrl = data?.result?.url || data?.data?.url || data?.url || data?.image;
          if (imgUrl) showModal(`<h3>✅ Gambar Diupscale!</h3><img src="${imgUrl}" class="result-img" /><a href="${imgUrl}" target="_blank" download class="dl-btn">⬇ Download Hasil</a>`);
          else showModal(`<h3>❌ Error</h3><p class="result-err">${JSON.stringify(data)}</p>`);
        }
      } catch(e) {
        showModal(`<h3>❌ Error</h3><p class="result-err">${e.message}</p>`);
      }
    });
  }

  else if (type === 'timpa') {
    const url  = document.getElementById('timpa-url').value.trim();
    const file = document.getElementById('timpa-file').files[0];
    const text = document.getElementById('timpa-text').value.trim();
    if ((!url && !file) || !text) { alert('Masukkan gambar dan teks!'); return; }
    showLoading(async () => {
      try {
        let res;
        if (file) {
          const form = new FormData();
          form.append('image', file);
          form.append('text', text);
          res = await fetch(API.timpa, { method: 'POST', body: form });
        } else {
          res = await fetch(`${API.timpa}?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        }
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('image')) {
          const blob   = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          showModal(`<h3>✅ Teks Ditambahkan!</h3><img src="${objUrl}" class="result-img" /><a href="${objUrl}" download="timpa.png" class="dl-btn">⬇ Download Hasil</a>`);
        } else {
          const data   = await res.json();
          const imgUrl = data?.result?.url || data?.data?.url || data?.url || data?.image;
          if (imgUrl) showModal(`<h3>✅ Teks Ditambahkan!</h3><img src="${imgUrl}" class="result-img" /><a href="${imgUrl}" target="_blank" download class="dl-btn">⬇ Download Hasil</a>`);
          else showModal(`<h3>❌ Error</h3><p class="result-err">${JSON.stringify(data)}</p>`);
        }
      } catch(e) {
        showModal(`<h3>❌ Error</h3><p class="result-err">${e.message}</p>`);
      }
    });
  }
}

/* ─── CONVERT HANDLER (client-side) ─────────────────────── */
function runConvert(type) {
  if (type === 'pngtojpeg') {
    const file = document.getElementById('pngtojpeg-file').files[0];
    if (!file) { alert('Upload file PNG terlebih dahulu!'); return; }
    showLoading(() => {
      const img    = new Image();
      const reader = new FileReader();
      reader.onload = e => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            showModal(`<h3>✅ Konversi PNG → JPEG</h3><img src="${url}" class="result-img" /><a href="${url}" download="converted.jpg" class="dl-btn">⬇ Download JPEG</a>`);
          }, 'image/jpeg', 0.92);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  else if (type === 'jpegtopng') {
    const file = document.getElementById('jpegtopng-file').files[0];
    if (!file) { alert('Upload file JPEG terlebih dahulu!'); return; }
    showLoading(() => {
      const img    = new Image();
      const reader = new FileReader();
      reader.onload = e => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            showModal(`<h3>✅ Konversi JPEG → PNG</h3><img src="${url}" class="result-img" /><a href="${url}" download="converted.png" class="dl-btn">⬇ Download PNG</a>`);
          }, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  else if (type === 'pdftoimg') {
    const file = document.getElementById('pdftoimg-file').files[0];
    if (!file) { alert('Upload file PDF terlebih dahulu!'); return; }
    showLoading(() => {
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src   = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          convertPdfToImg(file);
        };
        document.head.appendChild(script);
      } else {
        convertPdfToImg(file);
      }
    });
  }

  else if (type === 'imgtopdf') {
    const files = document.getElementById('imgtopdf-file').files;
    if (!files.length) { alert('Upload gambar terlebih dahulu!'); return; }
    showLoading(() => {
      if (!window.jspdf) {
        const script = document.createElement('script');
        script.src   = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => convertImgToPdf(files);
        document.head.appendChild(script);
      } else {
        convertImgToPdf(files);
      }
    });
  }
}

async function convertPdfToImg(file) {
  try {
    const arrayBuf = await file.arrayBuffer();
    const pdf      = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
    let html = `<h3>✅ PDF → Gambar (${pdf.numPages} halaman)</h3>`;
    const links = [];
    for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
      const page    = await pdf.getPage(i);
      const vp      = page.getViewport({ scale: 1.5 });
      const canvas  = document.createElement('canvas');
      canvas.width  = vp.width; canvas.height = vp.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      const dataUrl = canvas.toDataURL('image/png');
      links.push({ dataUrl, idx: i });
    }
    links.forEach(({ dataUrl, idx }) => {
      html += `<div style="margin-bottom:12px;"><img src="${dataUrl}" class="result-img" /><a href="${dataUrl}" download="page-${idx}.png" class="dl-btn">⬇ Download Halaman ${idx}</a></div>`;
    });
    if (pdf.numPages > 10) html += `<p style="color:var(--text-muted);font-size:0.7rem;margin-top:8px;">*Hanya menampilkan 10 halaman pertama</p>`;
    showModal(html);
  } catch(e) {
    showModal(`<h3>❌ Error</h3><p class="result-err">${e.message}</p>`);
  }
}

async function convertImgToPdf(files) {
  try {
    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF();
    let firstPage   = true;
    for (const file of files) {
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload  = e => res(e.target.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const img = new Image();
      await new Promise(res => { img.onload = res; img.src = dataUrl; });
      const pw    = doc.internal.pageSize.getWidth();
      const ph    = doc.internal.pageSize.getHeight();
      const ratio = Math.min(pw / img.width, ph / img.height);
      const w = img.width * ratio, h = img.height * ratio;
      const x = (pw - w) / 2,     y = (ph - h) / 2;
      if (!firstPage) doc.addPage();
      doc.addImage(dataUrl, 'JPEG', x, y, w, h);
      firstPage = false;
    }
    const blob = doc.output('blob');
    const url  = URL.createObjectURL(blob);
    showModal(`<h3>✅ Gambar → PDF</h3><p style="margin-bottom:12px;color:var(--text-muted);font-size:0.75rem;">${files.length} gambar berhasil digabung</p><a href="${url}" download="result.pdf" class="dl-btn">⬇ Download PDF</a>`);
  } catch(e) {
    showModal(`<h3>❌ Error</h3><p class="result-err">${e.message}</p>`);
  }
}

/* ─── VIP — AGE VERIFICATION + PASSWORD ─────────────────────── */
let vipUnlocked  = false;
let ageVerified  = false;

// FIX #1 — Age verification gate
function confirmAge(confirmed) {
  document.getElementById('vip-age-gate').style.display = 'none';
  if (!confirmed) {
    // Tolak → balik ke home
    showPage('home');
    return;
  }
  ageVerified = true;
  document.getElementById('vip-lock').style.display = 'flex';
}

// Override showPage untuk intercept VIP
const _origShowPage = showPage;
function showPage(name) {
  if (name === 'vip' && !ageVerified) {
    // Tampilkan age gate dulu
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-vip').classList.add('active');
    document.getElementById('vip-age-gate').style.display  = 'flex';
    document.getElementById('vip-lock').style.display       = 'none';
    document.getElementById('vip-content').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + name);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// FIX #6 — Jangan bocor lokasi password
async function checkVIP() {
  const pw = document.getElementById('vip-password').value.trim();
  if (!pw) { alert('Masukkan password VIP!'); return; }

  const sheetId = window.VIP_SHEET_ID || '';
  if (!sheetId) {
    // Metode 1: hardcode
    if (window.VIP_PASSWORD && pw === window.VIP_PASSWORD) {
      unlockVIP();
    } else {
      alert('Sandi salah jir! 🙅');   // FIX: gak kasih tau disimpan di mana
    }
    return;
  }

  // Metode 2: Google Sheets
  try {
    const res      = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&range=A1`);
    const csv      = await res.text();
    const storedPw = csv.replace(/["'\n\r]/g, '').trim();
    if (pw === storedPw) unlockVIP();
    else alert('Sandi salah jir! 🙅');   // FIX: gak kasih tau sumber sandi
  } catch(e) {
    alert('Sandi salah jir! 🙅');
  }
}

function unlockVIP() {
  vipUnlocked = true;
  document.getElementById('vip-lock').style.display = 'none';
  document.getElementById('vip-content').classList.remove('hidden');
}

function runVIP(type) {
  if (!vipUnlocked) { alert('Akses ditolak!'); return; }

  if (type === 'haramgen') {
    const prompt = document.getElementById('haramgen-prompt').value.trim();
    if (!prompt) { alert('Masukkan prompt!'); return; }
    showLoading(async () => {
      try {
        const res = await fetch(`${API.haramgen}?prompt=${encodeURIComponent(prompt)}`);
        const ct  = res.headers.get('content-type') || '';
        if (ct.includes('image')) {
          const blob = await res.blob();
          const url  = URL.createObjectURL(blob);
          showModal(`<h3>✅ Generate Selesai</h3><img src="${url}" class="result-img" /><a href="${url}" download="gen.png" class="dl-btn">⬇ Download</a>`);
        } else {
          const data   = await res.json();
          const imgUrl = data?.url || data?.result?.url || data?.data?.url || data?.image;
          if (imgUrl) showModal(`<h3>✅ Generate Selesai</h3><img src="${imgUrl}" class="result-img" /><a href="${imgUrl}" target="_blank" download class="dl-btn">⬇ Download</a>`);
          else showModal(`<h3>❌ Error</h3><p class="result-err">${JSON.stringify(data)}</p>`);
        }
      } catch(e) {
        showModal(`<h3>❌ Error</h3><p class="result-err">${e.message}</p>`);
      }
    });
  }

  else if (type === 'haramedit') {
    const url = document.getElementById('haramedit-url').value.trim();
    if (!url) { alert('Masukkan URL gambar!'); return; }
    showLoading(async () => {
      try {
        const res = await fetch(`${API.haramedit}?url=${encodeURIComponent(url)}`);
        const ct  = res.headers.get('content-type') || '';
        if (ct.includes('image')) {
          const blob   = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          showModal(`<h3>✅ Edit Selesai</h3><img src="${objUrl}" class="result-img" /><a href="${objUrl}" download="edited.png" class="dl-btn">⬇ Download</a>`);
        } else {
          const data   = await res.json();
          const imgUrl = data?.url || data?.result?.url || data?.data?.url;
          if (imgUrl) showModal(`<h3>✅ Edit Selesai</h3><img src="${imgUrl}" class="result-img" /><a href="${imgUrl}" target="_blank" download class="dl-btn">⬇ Download</a>`);
          else showModal(`<h3>❌ Error</h3><p class="result-err">${JSON.stringify(data)}</p>`);
        }
      } catch(e) {
        showModal(`<h3>❌ Error</h3><p class="result-err">${e.message}</p>`);
      }
    });
  }

  else if (type === 'harameditv2') {
    const url = document.getElementById('harameditv2-url').value.trim();
    if (!url) { alert('Masukkan URL gambar!'); return; }
    showLoading(async () => {
      try {
        const res = await fetch(`${API.harameditv2}?url=${encodeURIComponent(url)}`);
        const ct  = res.headers.get('content-type') || '';
        if (ct.includes('image')) {
          const blob   = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          showModal(`<h3>✅ Edit v2 Selesai</h3><img src="${objUrl}" class="result-img" /><a href="${objUrl}" download="editedv2.png" class="dl-btn">⬇ Download</a>`);
        } else {
          const data   = await res.json();
          const imgUrl = data?.url || data?.result?.url || data?.data?.url;
          if (imgUrl) showModal(`<h3>✅ Edit v2 Selesai</h3><img src="${imgUrl}" class="result-img" /><a href="${imgUrl}" target="_blank" download class="dl-btn">⬇ Download</a>`);
          else showModal(`<h3>❌ Error</h3><p class="result-err">${JSON.stringify(data)}</p>`);
        }
      } catch(e) {
        showModal(`<h3>❌ Error</h3><p class="result-err">${e.message}</p>`);
      }
    });
  }
}

/* ─── ANIME QUOTE ─────────────────────── */
const QUOTE_INTERVAL_MS = 5 * 60 * 1000;
let quoteNextAt = Date.now() + QUOTE_INTERVAL_MS;

async function fetchQuote() {
  const textEl = document.getElementById('quote-text');
  const charEl = document.getElementById('quote-char');
  const imgEl  = document.getElementById('quote-img');
  textEl.textContent = 'Memuat quote…';
  charEl.textContent = '—';
  try {
    const res   = await fetch(API.quotesanime);
    const data  = await res.json();
    const quote = data?.quote    || data?.text    || data?.data?.quote    || data?.result?.quote    || '...';
    const char  = data?.character|| data?.name    || data?.data?.character|| data?.result?.character|| 'Unknown';
    const anime = data?.anime    || data?.title   || data?.data?.anime    || '';
    const img   = data?.image    || data?.img     || data?.data?.image    || data?.result?.image    || '';
    textEl.textContent = `"${quote}"`;
    charEl.textContent = `— ${char}${anime ? ' · ' + anime : ''}`;
    if (img) { imgEl.src = img; imgEl.style.display = 'block'; }
    else imgEl.style.display = 'none';
  } catch(e) {
    textEl.textContent = '"Quotes gagal dimuat, tapi semangat terus!"';
    charEl.textContent = '— AISinja';
    imgEl.style.display = 'none';
  }
  quoteNextAt = Date.now() + QUOTE_INTERVAL_MS;
}

function startQuoteCountdown() {
  const cdEl = document.getElementById('quote-countdown');
  setInterval(() => {
    const remaining = Math.max(0, quoteNextAt - Date.now());
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    cdEl.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    if (remaining === 0) fetchQuote();
  }, 1000);
}

/* ─── INIT ─────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  fetchQuote();
  startQuoteCountdown();
  setInterval(fetchQuote, QUOTE_INTERVAL_MS);
});
