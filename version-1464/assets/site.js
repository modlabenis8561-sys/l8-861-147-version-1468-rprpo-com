(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var section = scope.closest("section") || document;
            var list = section.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
            var input = scope.querySelector("[data-search-input]");
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
            var clear = scope.querySelector("[data-clear-filter]");
            var empty = null;

            function cardText(card) {
                return [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" ").toLowerCase();
            }

            function matchYear(cardYear, selected) {
                if (!selected) {
                    return true;
                }
                var numeric = parseInt(cardYear, 10);
                if (selected === "2010-2019") {
                    return numeric >= 2010 && numeric <= 2019;
                }
                if (selected === "2000-2009") {
                    return numeric >= 2000 && numeric <= 2009;
                }
                if (selected === "更早") {
                    return numeric > 0 && numeric < 2000;
                }
                return cardYear.indexOf(selected) !== -1;
            }

            function applyFilters() {
                if (!list) {
                    return;
                }
                var query = input ? input.value.trim().toLowerCase() : "";
                var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var visible = true;
                    if (query && cardText(card).indexOf(query) === -1) {
                        visible = false;
                    }
                    selects.forEach(function (select) {
                        var field = select.getAttribute("data-filter-select");
                        var value = select.value;
                        if (!value || !visible) {
                            return;
                        }
                        if (field === "year") {
                            visible = matchYear(card.getAttribute("data-year") || "", value);
                            return;
                        }
                        var dataValue = (card.getAttribute("data-" + field) || "").toLowerCase();
                        visible = dataValue.indexOf(value.toLowerCase()) !== -1;
                    });
                    card.style.display = visible ? "" : "none";
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (!empty) {
                    empty = document.createElement("div");
                    empty.className = "no-result";
                    empty.textContent = "没有找到匹配的影片";
                    list.appendChild(empty);
                }
                empty.style.display = visibleCount ? "none" : "block";
            }

            if (input) {
                input.addEventListener("input", applyFilters);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                }
            }
            selects.forEach(function (select) {
                select.addEventListener("change", applyFilters);
            });
            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    selects.forEach(function (select) {
                        select.value = "";
                    });
                    applyFilters();
                });
            }
            applyFilters();
        });
    });
}());
