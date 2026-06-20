(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var nextButton = document.querySelector('[data-hero-next]');
    var prevButton = document.querySelector('[data-hero-prev]');
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === heroIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === heroIndex);
        });
    }

    function startHero() {
        if (heroTimer || slides.length < 2) {
            return;
        }

        heroTimer = setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function restartHero() {
        if (heroTimer) {
            clearInterval(heroTimer);
            heroTimer = null;
        }

        startHero();
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
            restartHero();
        });
    });

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            showHero(heroIndex + 1);
            restartHero();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            showHero(heroIndex - 1);
            restartHero();
        });
    }

    showHero(0);
    startHero();

    var searchInput = document.querySelector('[data-search-input]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var list = document.querySelector('[data-filter-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    function getItems() {
        if (!list) {
            return [];
        }

        return Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    }

    function applySearch() {
        if (!list) {
            return;
        }

        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var visibleCount = 0;

        getItems().forEach(function (item) {
            var text = (item.getAttribute('data-title') + ' ' + item.getAttribute('data-meta')).toLowerCase();
            var matched = !query || text.indexOf(query) !== -1;

            item.classList.toggle('is-hidden', !matched);

            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    function applySort() {
        if (!list || !sortSelect) {
            return;
        }

        var mode = sortSelect.value;
        var items = getItems();

        items.sort(function (a, b) {
            if (mode === 'year') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }

            if (mode === 'title') {
                return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
            }

            return Number(a.getAttribute('data-index') || 0) - Number(b.getAttribute('data-index') || 0);
        });

        items.forEach(function (item) {
            list.appendChild(item);
        });

        applySearch();
    }

    if (searchInput) {
        searchInput.addEventListener('input', applySearch);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applySort);
    }

    applySearch();
})();
