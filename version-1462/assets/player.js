function setupMoviePlayer(source) {
  var video = document.getElementById('movie-player');
  var overlay = document.getElementById('player-overlay');
  var startButton = document.getElementById('player-start');
  var loaded = false;
  var hlsInstance = null;

  if (!video || !overlay || !startButton || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    loadSource();
    overlay.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', startPlayback);

  startButton.addEventListener('click', function (event) {
    event.stopPropagation();
    startPlayback();
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
