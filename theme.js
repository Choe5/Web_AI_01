(function () {
  var KEY = 'ai-course-theme';

  /* ---- Prevent flash: apply class on <html> immediately ---- */
  if (localStorage.getItem(KEY) === 'light') {
    document.documentElement.classList.add('pre-light');
  }

  /* ---- Inline color fixer ----
     Regex-replaces rgba(255,255,255,alpha) text colors in inline style attrs
     with dark-slate equivalents. Originals saved to data-dark-style attr. */
  function fixInlineColors() {
    document.querySelectorAll('[style]').forEach(function (el) {
      var orig = el.getAttribute('style');
      var fixed = orig.replace(
        /color\s*:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)/gi,
        function (_, a) {
          var alpha = parseFloat(a);
          if (alpha >= 0.75) return 'color:#1E293B';
          if (alpha >= 0.45) return 'color:#334155';
          return 'color:#475569';
        }
      );
      if (fixed !== orig) {
        el.setAttribute('data-dark-style', orig);
        el.setAttribute('style', fixed);
      }
    });
  }

  function restoreInlineColors() {
    document.querySelectorAll('[data-dark-style]').forEach(function (el) {
      el.setAttribute('style', el.getAttribute('data-dark-style'));
      el.removeAttribute('data-dark-style');
    });
  }

  /* ---- Toggle button ---- */
  function injectToggle() {
    if (document.getElementById('theme-toggle')) return;
    var btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.setAttribute('aria-label', '切換亮暗主題');
    var nav = document.querySelector('.nav-bar, #nav, .nav-glass, nav');
    if (!nav) return;
    nav.appendChild(btn);
    btn.addEventListener('click', toggleTheme);
  }

  function updateBtn(light) {
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.innerHTML = light ? '🌙&nbsp;暗色' : '☀️&nbsp;亮色';
  }

  /* ---- Apply / remove theme ---- */
  function applyTheme(light, animate) {
    if (animate) {
      document.body.style.transition = 'background 0.35s, color 0.3s';
    }
    if (light) {
      document.body.classList.add('light-mode');
      fixInlineColors();
    } else {
      restoreInlineColors();
      document.body.classList.remove('light-mode');
    }
    if (animate) {
      setTimeout(function () { document.body.style.transition = ''; }, 400);
    }
    document.documentElement.classList.remove('pre-light');
    updateBtn(light);
  }

  function toggleTheme() {
    var isLight = !document.body.classList.contains('light-mode');
    localStorage.setItem(KEY, isLight ? 'light' : 'dark');
    applyTheme(isLight, true);
  }

  /* ---- Init on DOM ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    injectToggle();
    var isLight = localStorage.getItem(KEY) === 'light';
    applyTheme(isLight, false);
  });
})();
