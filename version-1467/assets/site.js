document.addEventListener('DOMContentLoaded', function () {
    initMobileNavigation();
    initHeroSlider();
    initCardFilters();
    initSearchQueryFromUrl();
});

function initMobileNavigation() {
    const button = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', function () {
        nav.classList.toggle('open');
    });
}

function initHeroSlider() {
    const root = document.querySelector('[data-hero]');

    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;
    let timer = null;

    function showSlide(nextIndex) {
        activeIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, index) {
            slide.classList.toggle('active', index === activeIndex);
        });

        dots.forEach(function (dot, index) {
            dot.classList.toggle('active', index === activeIndex);
        });
    }

    function startTimer() {
        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            const nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
            window.clearInterval(timer);
            showSlide(nextIndex);
            startTimer();
        });
    });

    if (slides.length > 1) {
        startTimer();
    }
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function initCardFilters() {
    const roots = Array.from(document.querySelectorAll('[data-filter-root]'));

    roots.forEach(function (root) {
        const list = root.querySelector('[data-card-list]');
        const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : Array.from(root.querySelectorAll('.movie-card'));

        if (!cards.length) {
            return;
        }

        const searchInput = root.querySelector('[data-card-search]');
        const typeSelect = root.querySelector('[data-card-type]');
        const yearSelect = root.querySelector('[data-card-year]');
        const regionSelect = root.querySelector('[data-card-region]');
        const resetButton = root.querySelector('[data-filter-reset]');
        const resultCount = root.querySelector('[data-result-count]');
        const emptyState = root.querySelector('[data-empty-state]');

        function applyFilter() {
            const query = normalizeText(searchInput ? searchInput.value : '');
            const typeValue = normalizeText(typeSelect ? typeSelect.value : '');
            const yearValue = normalizeText(yearSelect ? yearSelect.value : '');
            const regionValue = normalizeText(regionSelect ? regionSelect.value : '');
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = normalizeText([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));

                const matchesQuery = !query || haystack.includes(query);
                const matchesType = !typeValue || normalizeText(card.dataset.type).includes(typeValue);
                const matchesYear = !yearValue || normalizeText(card.dataset.year) === yearValue;
                const matchesRegion = !regionValue || normalizeText(card.dataset.region).includes(regionValue);
                const isVisible = matchesQuery && matchesType && matchesYear && matchesRegion;

                card.hidden = !isVisible;

                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (resultCount) {
                resultCount.textContent = String(visibleCount);
            }

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        [searchInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                [searchInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
                    if (control) {
                        control.value = '';
                    }
                });

                applyFilter();
            });
        }

        applyFilter();
    });
}

function initSearchQueryFromUrl() {
    const searchInput = document.querySelector('.search-page [data-card-search]');

    if (!searchInput) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
