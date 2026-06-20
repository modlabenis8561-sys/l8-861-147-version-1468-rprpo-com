import { H as Hls } from './hls-dru42stk.js';

var activeHls = null;

function setMessage(player, text) {
  var section = player.closest('.player-section');
  var message = section ? section.querySelector('[data-player-message]') : null;
  if (message) {
    message.textContent = text;
  }
}

function destroyActiveHls() {
  if (activeHls) {
    activeHls.destroy();
    activeHls = null;
  }
}

function loadVideo(player, url, autoplay) {
  var video = player.querySelector('video');
  var overlay = player.querySelector('[data-play-trigger]');

  if (!video || !url) {
    setMessage(player, '未找到可用播放地址。');
    return;
  }

  destroyActiveHls();

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    setMessage(player, '已使用浏览器原生 HLS 播放能力加载线路。');
  } else if (Hls && Hls.isSupported()) {
    activeHls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    activeHls.loadSource(url);
    activeHls.attachMedia(video);
    activeHls.on(Hls.Events.MANIFEST_PARSED, function () {
      setMessage(player, '高清线路已加载完成，可以流畅播放。');
      if (autoplay) {
        video.play().catch(function () {
          setMessage(player, '线路已加载，请再次点击播放器开始播放。');
        });
      }
    });
    activeHls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setMessage(player, '当前线路播放异常，请刷新页面或稍后再试。');
      }
    });
  } else {
    video.src = url;
    setMessage(player, '当前浏览器不支持 HLS.js，已尝试直接加载视频地址。');
  }

  if (overlay) {
    overlay.classList.add('is-hidden');
  }

  if (autoplay && video.src) {
    video.play().catch(function () {
      setMessage(player, '线路已准备好，请点击播放器播放。');
    });
  }
}

document.querySelectorAll('[data-player]').forEach(function (player) {
  var defaultSource = player.getAttribute('data-video-url');
  var overlay = player.querySelector('[data-play-trigger]');

  if (overlay) {
    overlay.addEventListener('click', function () {
      loadVideo(player, defaultSource, true);
    });
  }

  player.closest('.player-section')?.querySelectorAll('[data-source]').forEach(function (button) {
    button.addEventListener('click', function () {
      button.parentElement.querySelectorAll('[data-source]').forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      loadVideo(player, button.getAttribute('data-source'), true);
    });
  });
});
