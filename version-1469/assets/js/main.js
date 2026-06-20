(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-mobile-menu-button]');
        var panel = document.querySelector('[data-mobile-menu]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart(index) {
            window.clearInterval(timer);
            show(index);
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                restart(index);
            });
        });

        show(0);
        start();
    }

    function initInlineFilters() {
        var filterScope = document.querySelector('[data-filter-scope]');
        if (!filterScope) {
            return;
        }
        var keyword = filterScope.querySelector('[data-filter-keyword]');
        var year = filterScope.querySelector('[data-filter-year]');
        var type = filterScope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-movie-card]'));

        function matchCard(card) {
            var text = (card.getAttribute('data-search-text') || '').toLowerCase();
            var cardYear = card.getAttribute('data-year') || '';
            var cardType = card.getAttribute('data-type') || '';
            var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var keywordMatch = !keywordValue || text.indexOf(keywordValue) >= 0;
            var yearMatch = !yearValue || cardYear === yearValue;
            var typeMatch = !typeValue || cardType === typeValue;
            return keywordMatch && yearMatch && typeMatch;
        }

        function applyFilters() {
            cards.forEach(function (card) {
                card.hidden = !matchCard(card);
            });
        }

        [keyword, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }

    function initPlayer() {
        var player = document.querySelector('[data-video-player]');
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var message = player.querySelector('[data-player-message]');
        var videoUrl = player.getAttribute('data-video-url');
        var hlsInstance = null;

        function setMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add('show');
        }

        function startVideo() {
            if (!video || !videoUrl) {
                return;
            }
            if (button) {
                button.classList.add('hidden');
            }
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.src !== videoUrl) {
                    video.src = videoUrl;
                }
                video.play().catch(function () {
                    setMessage('播放暂时无法加载，请稍后重试');
                });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {
                        setMessage('点击播放键继续观看');
                    });
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage('播放暂时无法加载，请稍后重试');
                    }
                });
                return;
            }

            setMessage('播放暂时无法加载，请稍后重试');
        }

        if (button) {
            button.addEventListener('click', startVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused && !video.currentSrc) {
                startVideo();
            }
        });
    }

    function createResultCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + encodeURI(item.url) + '">',
            '<img src="' + encodeURI(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="quality-badge">高清</span>',
            '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3 class="movie-title"><a href="' + encodeURI(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
            '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
            '<p class="movie-line">' + escapeHtml(item.summary) + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        if (!results || !window.movieSearchData) {
            return;
        }
        var input = document.querySelector('[data-search-page-input]');
        var year = document.querySelector('[data-search-page-year]');
        var type = document.querySelector('[data-search-page-type]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }

        function render() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var matches = window.movieSearchData.filter(function (item) {
                var haystack = [
                    item.title,
                    item.summary,
                    item.region,
                    item.type,
                    item.genre,
                    item.category,
                    (item.tags || []).join(' ')
                ].join(' ').toLowerCase();
                var keywordMatch = !keyword || haystack.indexOf(keyword) >= 0;
                var yearMatch = !yearValue || item.year === yearValue;
                var typeMatch = !typeValue || item.type === typeValue;
                return keywordMatch && yearMatch && typeMatch;
            }).slice(0, 80);

            if (!keyword && !yearValue && !typeValue) {
                results.innerHTML = '<div class="search-empty"><h2>搜索影视内容</h2><p>输入片名、题材、地区或标签即可浏览相关作品。</p></div>';
                return;
            }

            if (!matches.length) {
                results.innerHTML = '<div class="search-empty"><h2>没有找到相关内容</h2><p>换一个关键词继续浏览更多影视作品。</p></div>';
                return;
            }

            results.innerHTML = '<div class="search-results-head"><h2>相关影视</h2><p>为你展示匹配度较高的内容。</p></div><div class="movie-grid compact">' + matches.map(createResultCard).join('') + '</div>';
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', render);
                control.addEventListener('change', render);
            }
        });
        render();
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initInlineFilters();
        initPlayer();
        initSearchPage();
    });
})();
