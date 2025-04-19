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

// Offline/Online Banner
function updateOnlineStatus() {
  offlineBanner.classList.toggle('hidden', navigator.onLine);
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
document.addEventListener('DOMContentLoaded', updateOnlineStatus);

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

function downloadPDF() {
                const element = container;
                const opt = {
                    margin: 0.5,
                    filename: "Lekki_Headmaster_Questions_ctrotech.pdf",
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
                };
                html2pdf().set(opt).from(element).save();
            }