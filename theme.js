(function () {
  var KEY = 'ai-course-theme';
  var ROOT = document.documentElement; /* <html> — exists before <body> */

  /* ---- Inline color fixer ---- */
  function fixInlineColors() {
    document.querySelectorAll('[style]').forEach(function (el) {
      var orig = el.getAttribute('style');
      var fixed = orig
        .replace(
          /color\s*:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)/gi,
          function (_, a) {
            var alpha = parseFloat(a);
            if (alpha >= 0.75) return 'color:#431407';
            if (alpha >= 0.45) return 'color:#7C2D12';
            return 'color:#92400E';
          }
        )
        .replace(/color\s*:\s*#fff\b/gi,            'color:#431407')
        .replace(/color\s*:\s*#ffffff\b/gi,         'color:#431407')
        .replace(/color\s*:\s*#(?:e2e8f0|E2E8F0)/g,'color:#431407')
        .replace(/color\s*:\s*#(?:f1f5f9|F1F5F9)/g,'color:#431407')
        .replace(/color\s*:\s*#(?:cbd5e1|CBD5E1)/g,'color:#7C2D12')
        .replace(/color\s*:\s*#(?:94a3b8|94A3B8)/g,'color:#92400E');
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
    if (animate && document.body) {
      document.body.style.transition = 'background 0.35s, color 0.3s';
    }
    if (light) {
      ROOT.classList.add('light-mode');
      fixInlineColors();
    } else {
      restoreInlineColors();
      ROOT.classList.remove('light-mode');
    }
    if (animate && document.body) {
      setTimeout(function () { document.body.style.transition = ''; }, 400);
    }
    updateBtn(light);
  }

  function toggleTheme() {
    var isLight = !ROOT.classList.contains('light-mode');
    localStorage.setItem(KEY, isLight ? 'light' : 'dark');
    applyTheme(isLight, true);
  }

  /* ---- Init on DOM ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    injectToggle();
    /* Class already set by inline <head> script if needed;
       just run the inline color fixer if we're in light mode. */
    if (ROOT.classList.contains('light-mode')) {
      fixInlineColors();
    }
    updateBtn(ROOT.classList.contains('light-mode'));
  });
})();
