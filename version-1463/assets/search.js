(function () {
  var form = document.querySelector('[data-search-form]');
  var results = document.querySelector('[data-search-results]');
  var status = document.querySelector('[data-search-status]');
  var movies = window.MOVIE_SEARCH_DATA || [];

  if (!form || !results) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[character];
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <span class="poster-wrap">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-chip">播放</span>',
      '  </span>',
      '  <span class="card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <em>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</em>',
      '    <small>' + escapeHtml(movie.oneLine) + '</small>',
      '    <span class="tag-row">' + tags + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runSearch() {
    var data = new FormData(form);
    var q = normalize(data.get('q'));
    var category = normalize(data.get('category'));
    var type = normalize(data.get('type'));
    var region = normalize(data.get('region'));
    var year = normalize(data.get('year'));

    var filtered = movies.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.summary,
        (movie.tags || []).join(' ')
      ].join(' '));

      return (!q || text.indexOf(q) !== -1) &&
        (!category || (movie.categories || []).indexOf(category) !== -1) &&
        (!type || normalize(movie.type) === type) &&
        (!region || normalize(movie.region) === region) &&
        (!year || normalize(movie.year) === year);
    });

    var display = filtered.slice(0, 120);
    results.innerHTML = display.map(card).join('') || '<p class="empty-result">没有找到匹配影片，请更换关键词或筛选条件。</p>';
    if (status) {
      status.textContent = '找到 ' + filtered.length + ' 部影片，当前展示前 ' + display.length + ' 部。';
    }
  }

  function applyQueryString() {
    var params = new URLSearchParams(window.location.search);
    params.forEach(function (value, key) {
      var field = form.elements[key];
      if (field) {
        field.value = value;
      }
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    runSearch();
  });

  form.addEventListener('input', function () {
    runSearch();
  });

  applyQueryString();
  if (window.location.search) {
    runSearch();
  }
}());
