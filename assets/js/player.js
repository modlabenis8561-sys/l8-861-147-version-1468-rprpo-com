(function () {
    window.initMoviePlayer = function (videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }
        var playerBox = video.closest(".player-box");
        var cover = playerBox ? playerBox.querySelector(".player-cover") : null;
        var hls = null;
        var loaded = false;

        function loadSource() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }
            video.src = sourceUrl;
        }

        function play() {
            loadSource();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", function (event) {
                event.preventDefault();
                play();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
}());
