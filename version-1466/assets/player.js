(function () {
    window.setupMoviePlayer = function (source) {
        var run = function () {
            var video = document.getElementById('movieVideo');
            var button = document.getElementById('playToggle');
            var started = false;
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function attach() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.controls = true;
                button.hidden = true;
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        button.hidden = false;
                    });
                }
            }

            button.addEventListener('click', attach);
            video.addEventListener('click', function () {
                if (!started) {
                    attach();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        } else {
            run();
        }
    };
})();
