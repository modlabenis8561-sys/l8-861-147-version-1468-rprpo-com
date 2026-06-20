(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var previous = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === activeIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === activeIndex);
        });
    }

    function restart() {
        if (!slides.length) {
            return;
        }
        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-target-slide') || 0));
            restart();
        });
    });

    if (previous) {
        previous.addEventListener('click', function () {
            showSlide(activeIndex - 1);
            restart();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(activeIndex + 1);
            restart();
        });
    }

    restart();

    var searchInput = document.getElementById('movieSearch');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
    var empty = document.querySelector('.empty-state');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
    var currentCategory = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = normalize(searchInput ? searchInput.value : '');
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre')
            ].join(' '));
            var category = card.getAttribute('data-category');
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchCategory = currentCategory === 'all' || category === currentCategory;
            var show = matchQuery && matchCategory;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');
        if (initialQuery) {
            searchInput.value = initialQuery;
        }
        searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            currentCategory = button.getAttribute('data-filter-category') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyFilters();
        });
    });

    applyFilters();
})();
