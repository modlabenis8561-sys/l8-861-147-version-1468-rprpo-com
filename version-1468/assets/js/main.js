(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector(".menu-button");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (slides.length === 0) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        var slider = document.querySelector(".hero-slider");
        if (slider) {
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
        }

        show(0);
        start();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll(".filter-grid"));
        grids.forEach(function (grid) {
            var panel = grid.previousElementSibling;
            var search = panel ? panel.querySelector(".local-search") : null;
            var sort = panel ? panel.querySelector(".sort-select") : null;
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

            function apply() {
                var query = normalize(search ? search.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region")
                    ].join(" "));
                    card.classList.toggle("hidden", query && haystack.indexOf(query) === -1);
                });
            }

            function reorder() {
                var mode = sort ? sort.value : "latest";
                var visibleCards = cards.slice();
                visibleCards.sort(function (a, b) {
                    if (mode === "year") {
                        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                    }
                    if (mode === "title") {
                        return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                    }
                    return cards.indexOf(a) - cards.indexOf(b);
                });
                visibleCards.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            if (sort) {
                sort.addEventListener("change", function () {
                    reorder();
                    apply();
                });
            }
        });
    }

    function createResultCard(movie) {
        var genre = String(movie.genre || "").split(/[，,\/、;；\s]+/).filter(Boolean).slice(0, 2);
        var tags = genre.map(function (item) {
            return "<span>" + escapeHtml(item) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-region=\"" + escapeHtml(movie.region) + "\">" +
                "<a class=\"movie-poster\" href=\"./" + encodeURI(movie.url) + "\">" +
                    "<img src=\"./" + encodeURI(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<div class=\"movie-card-meta\"><a href=\"./" + encodeURI(movie.categoryUrl) + "\">" + escapeHtml(movie.category) + "</a><span>" + escapeHtml(movie.year) + "</span></div>" +
                    "<h3><a href=\"./" + encodeURI(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"tag-row\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    function setupSearchPage() {
        var resultBox = document.getElementById("search-results");
        var summary = document.getElementById("search-result-summary");
        var input = document.getElementById("search-page-input");
        if (!resultBox || !summary || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }
        var keyword = normalize(query);
        if (!keyword) {
            resultBox.innerHTML = "<div class=\"empty-state\">输入关键词后查看匹配影片</div>";
            return;
        }
        var results = window.SEARCH_MOVIES.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.tags,
                movie.oneLine,
                movie.category
            ].join(" "));
            return haystack.indexOf(keyword) !== -1;
        }).slice(0, 120);
        summary.textContent = results.length ? "已找到相关影片" : "未找到相关影片";
        resultBox.innerHTML = results.length ? results.map(createResultCard).join("") : "<div class=\"empty-state\">未找到相关影片</div>";
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
}());
