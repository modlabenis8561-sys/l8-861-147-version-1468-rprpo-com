import { H as Hls } from './hls-vendor-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
    const players = Array.from(document.querySelectorAll('.movie-player'));

    players.forEach(function (player) {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play-button]');
        const message = player.querySelector('[data-player-message]');
        const source = player.getAttribute('data-video-url');
        let hasStarted = false;

        if (!video || !button || !source) {
            return;
        }

        button.addEventListener('click', function () {
            if (hasStarted) {
                return;
            }

            hasStarted = true;
            button.classList.add('hidden');
            setMessage(message, '正在加载播放源，请稍候……');
            startPlayback(video, source, message);
        });
    });
});

function startPlayback(video, source, message) {
    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            playVideo(video, message);
        });

        hls.on(Hls.Events.ERROR, function (_event, data) {
            if (data && data.fatal) {
                setMessage(message, '播放源加载失败，请刷新页面后重试。');
            }
        });

        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
            playVideo(video, message);
        }, { once: true });
        return;
    }

    setMessage(message, '当前浏览器暂不支持 HLS 播放，请更换现代浏览器。');
}

function playVideo(video, message) {
    const promise = video.play();

    if (promise && typeof promise.then === 'function') {
        promise
            .then(function () {
                setMessage(message, '');
            })
            .catch(function () {
                setMessage(message, '浏览器阻止了自动播放，请点击播放器控制栏继续播放。');
            });
    } else {
        setMessage(message, '');
    }
}

function setMessage(message, text) {
    if (!message) {
        return;
    }

    message.textContent = text;
    message.hidden = !text;
}
