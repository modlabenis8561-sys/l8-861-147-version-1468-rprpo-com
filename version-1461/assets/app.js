(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
      button.setAttribute("aria-expanded", menu.classList.contains("open") ? "true" : "false");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
        dot.setAttribute("aria-current", i === current ? "true" : "false");
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initFilters() {
    Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(function (root) {
      var input = root.querySelector("[data-search-input]");
      var genre = root.querySelector("[data-genre-filter]");
      var year = root.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      var empty = root.querySelector("[data-empty]");

      function apply() {
        var q = normalize(input && input.value);
        var selectedGenre = normalize(genre && genre.value);
        var selectedYear = normalize(year && year.value);
        var shown = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
          var cardGenre = normalize(card.getAttribute("data-genre"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matchText = !q || text.indexOf(q) !== -1;
          var matchGenre = !selectedGenre || cardGenre.indexOf(selectedGenre) !== -1;
          var matchYear = !selectedYear || cardYear === selectedYear;
          var visible = matchText && matchGenre && matchYear;
          card.classList.toggle("hidden-card", !visible);
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }

      [input, genre, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (block) {
      var video = block.querySelector("video");
      var button = block.querySelector("[data-play-button]");
      var source = video ? video.getAttribute("data-stream") : "";
      var started = false;
      var hls = null;
      if (!video || !source) {
        return;
      }

      function setError() {
        block.setAttribute("data-state", "error");
      }

      function begin() {
        if (!started) {
          started = true;
          block.classList.add("is-playing");
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal && hls) {
                setError();
                hls.destroy();
                hls = null;
              }
            });
          } else {
            video.src = source;
          }
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(setError);
        }
      }

      block.addEventListener("click", function (event) {
        if (event.target === video && started) {
          return;
        }
        begin();
      });
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          begin();
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
