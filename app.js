const CACHE_KEY = 'compressedQuestions';
const SEARCH_KEY = 'savedSearch';
const SCROLL_KEY = 'scrollPosition';

const container = document.getElementById('questionsContainer');
const searchInput = document.getElementById('novelSearch');
const offlineBanner = document.getElementById('offlineBanner');

let currentIndex = 0;
const batchSize = 10;
let isLoading = false;

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function createSpinner() {
  const spinner = document.createElement('div');
  spinner.className = 'flex justify-center my-4';
  spinner.innerHTML = `<div class="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>`;
  return spinner;
}

function renderBatch(startIndex, data) {
  const batch = data.slice(startIndex, startIndex + batchSize);
  if (batch.length === 0) return;

  batch.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-xl shadow-sm border border-gray-200 opacity-0 translate-y-4 transition-all duration-500';
    card.innerHTML = `
      <h3 class="text-lg font-semibold mb-2">Question ${q?.id ?? '–'}</h3>
      <p class="mb-3 text-gray-700">${q?.question ?? 'No question available'}</p>
      <p class="text-sm text-green-700 font-medium">Answer: ${q?.answer ?? 'Not provided'}</p>
    `;
    container.appendChild(card);
    setTimeout(() => card.classList.remove('opacity-0', 'translate-y-4'), 50 * i);
  });
}

function loadNextBatch(data = questions) {
  if (isLoading || currentIndex >= data.length) return;
  isLoading = true;

  const spinner = createSpinner();
  container.appendChild(spinner);

  setTimeout(() => {
    container.removeChild(spinner);

    // Highlight helper
    const query = searchInput?.value?.toLowerCase().trim() ?? '';
    const highlight = (text = '') => {
      if (!query) return text;
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return text.replace(
        new RegExp(escapedQuery, 'gi'),
        match => `<mark class="bg-yellow-200 text-black font-medium rounded px-1 animate-[fadeZoomIn_0.5s]">${match}</mark>`
      );
    };

    // Inject keyframes only once
    if (!document.getElementById('highlightAnim')) {
      const style = document.createElement('style');
      style.id = 'highlightAnim';
      style.innerHTML = `
        @keyframes fadeZoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }

    const batch = data.slice(currentIndex, currentIndex + batchSize);

    batch.forEach((q, i) => {
      const card = document.createElement('div');
      card.className = 'bg-white p-5 rounded-xl shadow-sm border border-gray-200 opacity-0 translate-y-4 transition-all duration-500';

      card.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">Question ${q?.id ?? '–'}</h3>
        <p class="mb-3 text-gray-700">${highlight(q?.question)}</p>
        <p class="text-sm text-green-700 font-medium">Answer: ${highlight(q?.answer)}</p>
      `;

      container.appendChild(card);
      setTimeout(() => card.classList.remove('opacity-0', 'translate-y-4'), 50 * i);
    });

    currentIndex += batchSize;
    isLoading = false;
  }, 600);
}

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    loadNextBatch(filteredQuestions);
  }

  // Save scroll position
  localStorage.setItem(SCROLL_KEY, window.scrollY.toString());
});

let onlineTimeout;

function updateOnlineStatus() {
  const banner = document.getElementById("offlineBanner");
  const statusText = document.getElementById("networkStatusText");
  const statusIcon = document.getElementById("networkStatusIcon");

  // Clear any existing timeout
  clearTimeout(onlineTimeout);

  if (!navigator?.onLine) {
    // User is offline
    statusText.textContent = "You're currently offline. Some features may not work.";
    statusIcon.textContent = "⚠️";
    banner.classList.remove("hidden", "opacity-0", "bg-green-600");
    banner.classList.add("bg-red-600", "opacity-100");
  } else {
    // User is back online
    statusText.textContent = "Back online. Everything should work now.";
    statusIcon.textContent = "✅";
    banner.classList.remove("hidden", "opacity-0", "bg-red-600");
    banner.classList.add("bg-green-600", "opacity-100");

    // Auto-hide after 3 seconds
    onlineTimeout = setTimeout(() => {
      banner.classList.remove("opacity-100");
      banner.classList.add("opacity-0");

      // Fully hide after fade-out
      setTimeout(() => {
        banner.classList.add("hidden");
      }, 300);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", updateOnlineStatus);
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
// Compressed Caching
function cacheQuestionsCompressed(data) {
  const compressed = LZString.compress(JSON.stringify(data));
  localStorage.setItem(CACHE_KEY, compressed);
}
function getCachedQuestionsCompressed() {
  const compressed = localStorage.getItem(CACHE_KEY);
  if (!compressed) return null;
  try {
    return JSON.parse(LZString.decompress(compressed));
  } catch (e) {
    console.warn("Failed to decompress:", e);
    return null;
  }
}

// Initial questions source with fallback
const questions = getCachedQuestionsCompressed() ?? jambNovelQuestions?.novel2025 ?? [];
cacheQuestionsCompressed(questions);

// Search & Input memory
let filteredQuestions = [...questions];

const handleSearch = debounce(() => {
  const query = searchInput?.value?.toLowerCase().trim() ?? '';
  localStorage.setItem(SEARCH_KEY, query);

  container.innerHTML = '';
  currentIndex = 0;

  filteredQuestions = questions.filter(q =>
    q?.question?.toLowerCase()?.includes(query) || q?.answer?.toLowerCase()?.includes(query)
  );

  if (filteredQuestions.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-500 italic">No matching questions found.</p>`;
    return;
  }

  // Highlight with animation
  const highlight = (text = '') => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(
      new RegExp(escapedQuery, 'gi'),
      match => `<mark class="bg-yellow-200 text-black font-medium rounded px-1 animate-[fadeZoomIn_0.5s]">${match}</mark>`
    );
  };

  // Inject keyframes (only once)
  if (!document.getElementById('highlightAnim')) {
    const style = document.createElement('style');
    style.id = 'highlightAnim';
    style.innerHTML = `
      @keyframes fadeZoomIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }

  filteredQuestions.slice(0, batchSize).forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-xl shadow-sm border border-gray-200 opacity-0 translate-y-4 transition-all duration-500';

    card.innerHTML = `
      <h3 class="text-lg font-semibold mb-2">Question ${q?.id ?? '–'}</h3>
      <p class="mb-3 text-gray-700">${highlight(q?.question)}</p>
      <p class="text-sm text-green-700 font-medium">Answer: ${highlight(q?.answer)}</p>
    `;
    container.appendChild(card);
    setTimeout(() => card.classList.remove('opacity-0', 'translate-y-4'), 50 * i);
  });

  currentIndex = batchSize;
}, 300);

searchInput?.addEventListener('input', handleSearch);

// Scroll-to-top
const scrollTopBtn = document?.getElementById('scrollTopBtn');

window?.addEventListener('scroll', () => {
  const shouldShow = window?.scrollY > 300;

  if (shouldShow) {
    scrollTopBtn?.classList?.remove('hidden');
    requestAnimationFrame(() => {
      scrollTopBtn?.classList?.remove('opacity-0', 'scale-90');
      scrollTopBtn?.classList?.add('opacity-100', 'scale-100');
    });
  } else {
    scrollTopBtn?.classList?.remove('opacity-100', 'scale-100');
    scrollTopBtn?.classList?.add('opacity-0', 'scale-90');

    setTimeout(() => {
      if (window?.scrollY < 300) {
        scrollTopBtn?.classList?.add('hidden');
      }
    }, 300);
  }
});

scrollTopBtn?.addEventListener('click', () => {
  window?.scrollTo({ top: 0, behavior: 'smooth' });
});

// Restore state
document.addEventListener('DOMContentLoaded', () => {
  const savedSearch = localStorage.getItem(SEARCH_KEY);
  if (savedSearch) {
    searchInput.value = savedSearch;
    handleSearch(); // triggers search render
  } else {
    loadNextBatch(questions);
  }

  // Restore scroll
  const savedScroll = parseInt(localStorage.getItem(SCROLL_KEY));
  if (!isNaN(savedScroll)) {
    setTimeout(() => window.scrollTo(0, savedScroll), 400);
  }
});
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;

    // Reset toast styling
    toast.classList.remove("hidden", "bg-red-600", "bg-green-600");
    toast.classList.add(type === "success" ? "bg-green-600" : "bg-red-600");

    // Show and auto-hide
    setTimeout(() => toast.classList.add("hidden"), 3500);
}

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;

    // Clear existing styles
    toast.classList.remove("hidden", "bg-red-600", "bg-green-600");
    toast.classList.add(type === "success" ? "bg-green-600" : "bg-red-600");

    setTimeout(() => toast.classList.add("hidden"), 3500);
}

function downloadPDF() {
    const spinner = document.getElementById("pdfSpinner");
    const element = container;

    // Check if user is online
    if (!navigator.onLine) {
        showToast("You are offline. Please connect to the internet to download.", "error");
        return; // Stop execution
    }

    // Show spinner
    spinner.classList.remove("hidden");
    spinner.classList.add("opacity-100");
    document.body.style.overflow = "hidden";

    const opt = {
        margin: 0.5,
        filename: "Lekki_Headmaster_Questions_ctrotech.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            showToast("PDF Download Successful!", "success");
        })
        .catch((error) => {
            console.error("PDF download failed:", error);

            const msg = error?.message?.toLowerCase();
            let message = "An unknown error occurred. Please try again.";

            if (msg?.includes("network")) {
                message = "Network error: Please check your connection.";
            } else if (msg?.includes("timeout")) {
                message = "Timeout: The process took too long.";
            } else if (msg?.includes("canvas") || msg?.includes("html2pdf")) {
                message = "PDF generation error. Please try again.";
            }

            showToast(message, "error");
        })
        .finally(() => {
            spinner.classList.add("opacity-0");
            setTimeout(() => {
                spinner.classList.add("hidden");
                spinner.classList.remove("opacity-100");
                document.body.style.overflow = "unset";
            }, 300);
        });
}
