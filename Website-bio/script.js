
// =========================================
// KUA MAKALE — SHARE FUNCTION
// =========================================

const shareButton = document.getElementById("share-button");
const shareFeedback = document.getElementById("share-feedback");

// Mengambil URL halaman yang sedang dibuka.
// Setelah deploy, URL ini otomatis menjadi URL website Anda.
const pageUrl = window.location.href;

const shareData = {
  title: "KUA Makale - Layanan Digital",
  text: "Akses kanal digital KUA Makale. Melayani dengan Integritas dan Sepenuh Hati.",
  url: pageUrl
};

// Menampilkan pesan status kepada pengguna.
function showFeedback(message) {
  shareFeedback.textContent = message;
}

// Fallback clipboard untuk browser yang tidak mendukung
// navigator.clipboard, misalnya pada kondisi tertentu.
function legacyCopyText(text) {
  const textArea = document.createElement("textarea");

  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.setAttribute("aria-hidden", "true");

  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";

  document.body.appendChild(textArea);
  textArea.select();

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }

  textArea.remove();
  return copied;
}

// Menyalin URL halaman.
async function copyPageUrl() {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(pageUrl);
      showFeedback("Tautan berhasil disalin. Silakan bagikan!");
      return true;
    }

    if (legacyCopyText(pageUrl)) {
      showFeedback("Tautan berhasil disalin. Silakan bagikan!");
      return true;
    }

    showFeedback("Salin URL dari bilah alamat browser Anda.");
    return false;
  } catch (error) {
    if (legacyCopyText(pageUrl)) {
      showFeedback("Tautan berhasil disalin. Silakan bagikan!");
      return true;
    }

    showFeedback("Salin URL dari bilah alamat browser Anda.");
    return false;
  }
}

// Tombol Bagikan.
shareButton.addEventListener("click", async () => {
  showFeedback("");

  // Web Share API umumnya tersedia pada HTTPS
  // dan browser/perangkat yang mendukungnya.
  if (typeof navigator.share === "function") {
    try {
      await navigator.share(shareData);
      showFeedback("Terima kasih telah membagikan halaman ini.");
      return;
    } catch (error) {
      // Pengguna membatalkan menu berbagi: jangan tampilkan error.
      if (error.name === "AbortError") {
        return;
      }

      // Jika berbagi gagal, coba salin URL sebagai alternatif.
      await copyPageUrl();
      return;
    }
  }

  // Browser tanpa Web Share API langsung mencoba menyalin URL.
  await copyPageUrl();
});


// =========================================
// JENIS PELAYANAN & MODAL PANEL LAYANAN
// =========================================

const filterButtons = document.querySelectorAll(".gallery-filter-btn");
const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
const lightbox = document.getElementById("gallery-lightbox");
const lightboxBackdrop = document.getElementById("lightbox-backdrop");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxTag = document.getElementById("lightbox-tag");
const lightboxCounter = document.getElementById("lightbox-counter");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxDesc = document.getElementById("lightbox-desc");

// Elemen 3 Tab Panel (Tentang, Pengajuan Layanan, Dokumentasi)
const tabButtons = document.querySelectorAll(".service-tab-btn");
const tabPanes = document.querySelectorAll(".service-pane");
const paneTentangContent = document.getElementById("pane-tentang-content");
const panePengajuanContent = document.getElementById("pane-pengajuan-content");

let currentActiveFilter = "all";
let currentVisibleItems = [...galleryItems];
let currentLightboxIndex = 0;
let currentActiveTab = "tentang";
let lastFocusedElement = null;

// 1. FILTER KATEGORI PELAYANAN
function applyFilter(category) {
  currentActiveFilter = category;

  filterButtons.forEach((btn) => {
    const isSelected = btn.dataset.filter === category;
    btn.classList.toggle("active", isSelected);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");
  });

  currentVisibleItems = [];

  galleryItems.forEach((item) => {
    const itemCategory = item.dataset.category;
    const isVisible = category === "all" || itemCategory === category;

    if (isVisible) {
      item.classList.remove("hidden");
      currentVisibleItems.push(item);
    } else {
      item.classList.add("hidden");
    }
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    applyFilter(btn.dataset.filter);
  });
});

// 2. NAVIGASI 3 TAB PANEL LAYANAN (Tentang, Pengajuan, Dokumentasi)
function switchTab(targetTab) {
  currentActiveTab = targetTab;

  tabButtons.forEach((btn) => {
    const isSelected = btn.dataset.tab === targetTab;
    btn.classList.toggle("active", isSelected);
    btn.setAttribute("aria-selected", isSelected ? "true" : "false");
  });

  tabPanes.forEach((pane) => {
    if (pane.id === `pane-${targetTab}`) {
      pane.classList.remove("hidden");
      pane.classList.add("active");
    } else {
      pane.classList.add("hidden");
      pane.classList.remove("active");
    }
  });
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.tab);
  });
});

// 3. UPDATE KONTEN MODAL PANEL LAYANAN
function updateLightboxContent(index) {
  if (currentVisibleItems.length === 0) return;

  // Wrap around index
  if (index < 0) {
    currentLightboxIndex = currentVisibleItems.length - 1;
  } else if (index >= currentVisibleItems.length) {
    currentLightboxIndex = 0;
  } else {
    currentLightboxIndex = index;
  }

  const targetItem = currentVisibleItems[currentLightboxIndex];
  const thumb = targetItem.querySelector(".gallery-thumb");
  const title = targetItem.querySelector(".gallery-item-title");
  const tag = targetItem.querySelector(".gallery-item-tag");

  // Isi data umum di header
  if (lightboxImg && thumb) {
    lightboxImg.src = thumb.src;
    lightboxImg.alt = thumb.alt || (title ? title.textContent : "");
  }
  if (lightboxTitle && title) {
    lightboxTitle.textContent = title.textContent;
  }
  if (lightboxTag && tag) {
    lightboxTag.textContent = tag.textContent;
  }
  if (lightboxCounter) {
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentVisibleItems.length}`;
  }

  // Isi data panel 1: Tentang Layanan
  const dataTentang = targetItem.querySelector(".data-tentang");
  if (paneTentangContent && dataTentang) {
    paneTentangContent.innerHTML = dataTentang.innerHTML;
  }

  // Isi data panel 2: Pengajuan Layanan
  const dataPengajuan = targetItem.querySelector(".data-pengajuan");
  if (panePengajuanContent && dataPengajuan) {
    panePengajuanContent.innerHTML = dataPengajuan.innerHTML;
  }

  // Isi data panel 3: Dokumentasi
  const dataDokumentasi = targetItem.querySelector(".data-dokumentasi");
  if (lightboxDesc && dataDokumentasi) {
    lightboxDesc.innerHTML = dataDokumentasi.innerHTML;
  }
}

function openLightbox(item) {
  lastFocusedElement = document.activeElement;
  const index = currentVisibleItems.indexOf(item);
  if (index === -1) return;

  updateLightboxContent(index);
  switchTab("tentang"); // Selalu buka tab Tentang terlebih dahulu

  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.style.overflow = "";

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

function showPrevPhoto() {
  updateLightboxContent(currentLightboxIndex - 1);
}

function showNextPhoto() {
  updateLightboxContent(currentLightboxIndex + 1);
}

// Event Listeners untuk Item Galeri/Layanan
galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    openLightbox(item);
  });

  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(item);
    }
  });
});

// Event Listeners untuk Navigasi & Tutup Modal
if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener("click", closeLightbox);
}

if (lightboxPrev) {
  lightboxPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrevPhoto();
  });
}

if (lightboxNext) {
  lightboxNext.addEventListener("click", (e) => {
    e.stopPropagation();
    showNextPhoto();
  });
}

// Navigasi Keyboard (Escape, ArrowLeft, ArrowRight, 1, 2, 3) untuk Desktop
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;

  if (e.key === "Escape") {
    closeLightbox();
  } else if (e.key === "ArrowLeft") {
    showPrevPhoto();
  } else if (e.key === "ArrowRight") {
    showNextPhoto();
  } else if (e.key === "1") {
    switchTab("tentang");
  } else if (e.key === "2") {
    switchTab("pengajuan");
  } else if (e.key === "3") {
    switchTab("dokumentasi");
  }
});

// Navigasi Touch / Usap Layar (Swipe) pada Gadget
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

if (lightbox) {
  lightbox.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleLightboxSwipe();
    },
    { passive: true }
  );
}

function handleLightboxSwipe() {
  const horizontalDiff = touchEndX - touchStartX;
  const verticalDiff = touchEndY - touchStartY;

  // Pastikan gesture lebih dominan horizontal daripada vertikal
  if (Math.abs(horizontalDiff) > 40 && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
    if (horizontalDiff < 0) {
      // Usap ke kiri -> Foto berikutnya
      showNextPhoto();
    } else {
      // Usap ke kanan -> Foto sebelumnya
      showPrevPhoto();
    }
  }
}
