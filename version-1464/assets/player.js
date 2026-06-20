(function () {
    function setupPlayer(container) {
        var video = container.querySelector("video");
        var cover = container.querySelector("[data-player-cover]");
        var url = container.getAttribute("data-video-url");
        var started = false;
        var hlsInstance = null;

        function attachSource() {
            if (!video || !url || started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 60
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attachSource();
            if (cover) {
                cover.classList.add("hidden");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {
                    if (cover) {
                        cover.classList.remove("hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("hidden");
                }
            });
            video.addEventListener("error", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
                started = false;
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("[data-player]").forEach(setupPlayer);
    });
}());
