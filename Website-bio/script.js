
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
// GALERI KEGIATAN & LIGHTBOX MODAL
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

let currentActiveFilter = "all";
let currentVisibleItems = [...galleryItems];
let currentLightboxIndex = 0;
let lastFocusedElement = null;

// 1. FILTER KATEGORI GALERI
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

// 2. LIGHTBOX MODAL
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
  const desc = targetItem.querySelector(".gallery-item-desc");
  const tag = targetItem.querySelector(".gallery-item-tag");

  lightboxImg.src = thumb.src;
  lightboxImg.alt = thumb.alt || title.textContent;
  lightboxTitle.textContent = title.textContent;
  lightboxDesc.textContent = desc.textContent;
  lightboxTag.textContent = tag.textContent;
  lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentVisibleItems.length}`;
}

function openLightbox(item) {
  lastFocusedElement = document.activeElement;
  const index = currentVisibleItems.indexOf(item);
  if (index === -1) return;

  updateLightboxContent(index);
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

// Event Listeners untuk Item Galeri
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

// Event Listeners untuk Navigasi & Tutup Lightbox
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

// Navigasi Keyboard (Escape, ArrowLeft, ArrowRight)
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;

  if (e.key === "Escape") {
    closeLightbox();
  } else if (e.key === "ArrowLeft") {
    showPrevPhoto();
  } else if (e.key === "ArrowRight") {
    showNextPhoto();
  }
});
