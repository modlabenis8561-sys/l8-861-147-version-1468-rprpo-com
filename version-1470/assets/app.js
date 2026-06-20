(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function makeCard(item) {
        var article = document.createElement("article");
        article.className = "movie-card compact";
        var tagText = (item.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        article.innerHTML = [
            "<a class=\"poster-link\" href=\"" + escapeAttr(item.url) + "\">",
            "<img src=\"" + escapeAttr(item.cover) + "\" alt=\"" + escapeAttr(item.title) + "\" loading=\"lazy\" onerror=\"this.remove()\">",
            "<span class=\"poster-shade\"></span>",
            "<span class=\"poster-badge\">" + escapeHtml(item.type || "电影") + "</span>",
            "</a>",
            "<div class=\"card-body\">",
            "<a class=\"card-title\" href=\"" + escapeAttr(item.url) + "\">" + escapeHtml(item.title) + "</a>",
            "<p class=\"card-line\">" + escapeHtml(item.line || "") + "</p>",
            "<div class=\"meta-row\"><span>" + escapeHtml(item.region || "精选") + "</span><span>" + escapeHtml(item.year || "热播") + "</span><span>" + escapeHtml(item.genre || "高清") + "</span></div>",
            "<div class=\"tag-row\">" + tagText + "</div>",
            "</div>"
        ].join("");
        return article;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var changeSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle("is-active", idx === current);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle("is-active", idx === current);
                });
            };
            dots.forEach(function (dot, idx) {
                dot.addEventListener("click", function () {
                    changeSlide(idx);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    changeSlide(current + 1);
                }, 5200);
            }
        }

        document.querySelectorAll("[data-page-filter]").forEach(function (form) {
            var input = form.querySelector("input");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
            if (!input || cards.length === 0) {
                return;
            }
            input.addEventListener("input", function () {
                var value = normalize(input.value);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-filter"));
                    card.classList.toggle("is-filter-hidden", value && text.indexOf(value) === -1);
                });
            });
        });

        var globalSearch = document.querySelector("[data-global-search]");
        var results = document.querySelector("[data-search-results]");
        if (globalSearch && results && window.SEARCH_INDEX) {
            var searchInput = globalSearch.querySelector("input[name='q']");
            var resultTitle = document.querySelector("[data-result-title]");
            var resultDesc = document.querySelector("[data-result-desc]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            searchInput.value = initial;

            var runSearch = function (query) {
                var value = normalize(query);
                var list = window.SEARCH_INDEX;
                if (value) {
                    list = list.filter(function (item) {
                        return normalize([item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(" "), item.line].join(" ")).indexOf(value) !== -1;
                    });
                } else {
                    list = list.slice(0, 24);
                }
                results.innerHTML = "";
                list.slice(0, 96).forEach(function (item) {
                    results.appendChild(makeCard(item));
                });
                if (resultTitle) {
                    resultTitle.textContent = value ? "搜索结果" : "热门推荐";
                }
                if (resultDesc) {
                    resultDesc.textContent = value ? "以下为匹配影片，点击可进入播放页面。" : "输入关键词后显示匹配影片。";
                }
            };

            globalSearch.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = searchInput.value.trim();
                var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
                history.replaceState(null, "", url);
                runSearch(query);
            });

            searchInput.addEventListener("input", function () {
                runSearch(searchInput.value);
            });

            runSearch(initial);
        }
    });
})();
