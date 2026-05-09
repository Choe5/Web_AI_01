(function () {
  var KEY = 'ai-course-theme';

  /* ---- Prevent flash: apply class on <html> immediately ---- */
  if (localStorage.getItem(KEY) === 'light') {
    document.documentElement.classList.add('pre-light');
  }

  /* ---- Inline color fixer ----
     Replaces white / light inline text colors with dark-slate equivalents.
     Handles: #fff, #ffffff, #e2e8f0, #f1f5f9, #cbd5e1, rgba(255,255,255,a).
     Originals saved to data-dark-style attr for restoration. */
  function fixInlineColors() {
    document.querySelectorAll('[style]').forEach(function (el) {
      var orig = el.getAttribute('style');
      var fixed = orig

        /* rgba(255,255,255, alpha) → dark slate by alpha */
        .replace(
          /color\s*:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)/gi,
          function (_, a) {
            var alpha = parseFloat(a);
            if (alpha >= 0.75) return 'color:#2D1F0E';
            if (alpha >= 0.45) return 'color:#4A3520';
            return 'color:#6B5337';
          }
        )

        /* #fff / #ffffff → warm dark brown */
        .replace(/color\s*:\s*#fff\b/gi, 'color:#2D1F0E')
        .replace(/color\s*:\s*#ffffff\b/gi, 'color:#2D1F0E')

        /* common light-text hex values → warm brown tones */
        .replace(/color\s*:\s*#(?:e2e8f0|E2E8F0)/g, 'color:#2D1F0E')
        .replace(/color\s*:\s*#(?:f1f5f9|F1F5F9)/g, 'color:#1A0F00')
        .replace(/color\s*:\s*#(?:cbd5e1|CBD5E1)/g, 'color:#4A3520')
        .replace(/color\s*:\s*#(?:94a3b8|94A3B8)/g, 'color:#6B5337');

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
