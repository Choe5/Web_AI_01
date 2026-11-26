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

  /* ---- Keyboard accessibility for onclick elements ----
     可點擊的 span / div（圖片燈箱、卡片、影片等）原本只綁了滑鼠
     onclick；這裡讓它們可用 Tab 聚焦、並以 Enter / 空白鍵觸發。 */
  function enhanceKeyboardA11y() {
    var sel = '[onclick], .term-card, .limit-card';
    document.querySelectorAll(sel).forEach(function (el) {
      var tag = el.tagName.toLowerCase();
      if (tag === 'a' || tag === 'button') return;      /* 已原生可用 */
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
      el.addEventListener('keydown', function (e) {
        /* 只在「元素本身」有焦點時觸發；避免彈窗內按 Enter 冒泡到背景而誤關彈窗 */
        if (e.target !== el) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          el.click();
        }
      });
    });
  }

  /* ---- 詳解彈窗 Detail modal ----
     用法：卡片加 data-detail（可選 data-detail-title、data-detail-color），
     卡片內放 <template class="detail-tpl">…</template>，內文用
     .dm-plain / .dm-analogy / .dm-example(.dm-ask) / .dm-you / .dm-caution / .dm-prompt */
  var dmLastFocus = null;

  function cardTitle(card) {
    var h = card.querySelector('h3, h4, .tool-name, .auto-name, .cap-title, .arch-box-title, .limit-title, .detail-title');
    if (h) return h.textContent.replace(/\s+/g, ' ').trim();
    var d = card.querySelector('div, p');
    return (d ? d.textContent : card.textContent).replace(/\s+/g, ' ').trim().slice(0, 40);
  }

  function buildDetailModal() {
    var m = document.getElementById('detailModal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'detailModal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-labelledby', 'dmTitle');
    m.hidden = true;
    m.innerHTML =
      '<div class="dm-box" id="dmBox">' +
        '<div class="dm-bar" id="dmBar"></div>' +
        '<button type="button" class="dm-close" id="dmClose" aria-label="關閉詳細說明">✕</button>' +
        '<h2 class="dm-title" id="dmTitle"></h2>' +
        '<div class="dm-body" id="dmBody"></div>' +
      '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m) closeDetail(); });
    document.getElementById('dmClose').addEventListener('click', closeDetail);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !m.hidden) closeDetail();
    });
    return m;
  }

  function openDetail(card) {
    var tpl = card.querySelector('template.detail-tpl');
    if (!tpl) return;
    var m = buildDetailModal();
    document.getElementById('dmTitle').textContent =
      card.getAttribute('data-detail-title') || cardTitle(card);
    var body = document.getElementById('dmBody');
    body.innerHTML = '';
    body.appendChild(tpl.content.cloneNode(true));
    document.getElementById('dmBar').style.background =
      card.getAttribute('data-detail-color') || '';
    dmLastFocus = card;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('dmBox').scrollTop = 0;
    document.getElementById('dmClose').focus();
  }

  function closeDetail() {
    var m = document.getElementById('detailModal');
    if (!m || m.hidden) return;
    m.hidden = true;
    document.body.style.overflow = '';
    if (dmLastFocus) dmLastFocus.focus();
  }

  /* 在卡片內加「📖 看詳解 →」提示；橫向 flex/grid 卡片則加到最後一個內容區塊裡 */
  function addHint(card) {
    if (card.querySelector('.detail-hint')) return;
    var target = card;
    var cs = window.getComputedStyle(card);
    var isRow = (cs.display.indexOf('flex') > -1 && cs.flexDirection.indexOf('column') !== 0) ||
                cs.display.indexOf('grid') > -1;
    if (isRow) {
      var kids = Array.prototype.filter.call(card.children, function (c) {
        return c.tagName !== 'TEMPLATE' && c.tagName !== 'SCRIPT';
      });
      if (kids.length) target = kids[kids.length - 1];
    }
    var s = document.createElement('span');
    s.className = 'detail-hint';
    s.textContent = '📖 看詳解 →';
    target.appendChild(s);
  }

  function initDetailCards() {
    document.querySelectorAll('[data-detail]').forEach(function (card) {
      addHint(card);
      card.classList.add('has-detail');
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('click', function (e) {
        if (e.target.closest('a, button, input, textarea, select, .copy-btn')) return;
        openDetail(card);
      });
      card.addEventListener('keydown', function (e) {
        if (e.target !== card) return;
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          openDetail(card);
        }
      });
    });
    /* unit3 限制卡沿用自己的 #limitModal，這裡只補上「可以點」的提示 */
    document.querySelectorAll('.limit-card').forEach(addHint);
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
    enhanceKeyboardA11y();
    initDetailCards();
  });
})();
