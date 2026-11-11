/* Lobbes theme – theme.js (vanilla, geen dependencies). Alles werkt ook zonder JS via gewone formulieren. */
(function () {
  'use strict';
  var L = window.Lobbes || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var lastFocus = null;

  function trapOpen(el, focusSel) {
    lastFocus = document.activeElement;
    el.classList.add('is-open');
    el.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    var f = $(focusSel || 'button, a, input', el);
    if (f) setTimeout(function () { f.focus(); }, 50);
  }
  function trapClose(el) {
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  /* ---------- Mobiel menu ---------- */
  var nav = $('#MobileNav');
  $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { trapOpen(nav); b.setAttribute('aria-expanded', 'true'); }); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', function () { trapClose(nav); $$('[data-menu-open]').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); }); }); });

  /* ---------- Cart drawer ---------- */
  var drawer = $('#CartDrawer');
  function openDrawer() { if (drawer) trapOpen(drawer, '.drawer__head button'); }
  function closeDrawer() { if (drawer) trapClose(drawer); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-drawer-close]');
    if (t) { e.preventDefault(); closeDrawer(); }
    var o = e.target.closest('[data-drawer-open]');
    if (o && drawer && L.cartType === 'drawer') { e.preventDefault(); openDrawer(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (drawer && drawer.classList.contains('is-open')) closeDrawer();
    if (nav && nav.classList.contains('is-open')) trapClose(nav);
  });

  function renderSections(sections) {
    if (!sections) return;
    if (sections['cart-drawer']) {
      var doc = new DOMParser().parseFromString(sections['cart-drawer'], 'text/html');
      var fresh = doc.querySelector('#CartDrawerInner');
      var cur = $('#CartDrawerInner');
      if (fresh && cur) cur.replaceWith(fresh);
    }
    if (sections['header']) {
      var d2 = new DOMParser().parseFromString(sections['header'], 'text/html');
      var c = d2.querySelector('[data-cart-count]');
      $$('[data-cart-count]').forEach(function (el) { if (c) { el.textContent = c.textContent; el.hidden = c.hidden; } });
    }
  }

  function post(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); });
  }

  /* Add to cart (progressive enhancement) */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-product-form]');
    if (!form || L.cartType !== 'drawer' || !drawer) return;
    e.preventDefault();
    var btn = $('[type=submit]', form);
    var err = $('[data-form-error]', form);
    if (err) err.textContent = '';
    btn.classList.add('is-loading'); btn.setAttribute('aria-disabled', 'true');
    var fd = new FormData(form);
    post(L.routes.cartAdd, { items: [{ id: Number(fd.get('id')), quantity: Number(fd.get('quantity') || 1) }], sections: ['cart-drawer', 'header'] })
      .then(function (res) {
        renderSections(res.sections);
        var st = $('#CartDrawerStatus'); if (st) st.textContent = L.strings.added;
        openDrawer();
      })
      .catch(function (j) { if (err) err.textContent = (j && (j.description || j.message)) || L.strings.error; })
      .finally(function () { btn.classList.remove('is-loading'); btn.removeAttribute('aria-disabled'); });
  });

  /* Drawer: hoeveelheid wijzigen / verwijderen / upsell */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-line-change]');
    if (!b || !drawer || !drawer.contains(b)) return;
    e.preventDefault();
    var line = Number(b.dataset.line), qty = Number(b.dataset.qty);
    post(L.routes.cartChange, { line: line, quantity: qty, sections: ['cart-drawer', 'header'] })
      .then(function (res) { renderSections(res.sections); var st = $('#CartDrawerStatus'); if (st) st.textContent = ''; })
      .catch(function () { window.location.href = L.routes.cart; });
  });
  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-upsell-form]');
    if (!form || !drawer || !drawer.contains(form)) return;
    e.preventDefault();
    var fd = new FormData(form);
    post(L.routes.cartAdd, { items: [{ id: Number(fd.get('id')), quantity: 1 }], sections: ['cart-drawer', 'header'] })
      .then(function (res) { renderSections(res.sections); })
      .catch(function () { form.submit(); });
  });

  /* Cart-pagina: +/- knoppen */
  $$('[data-qty-wrap]').forEach(function (wrap) {
    var input = $('input', wrap);
    $$('button', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = Math.max(0, Number(input.value) + Number(b.dataset.step));
        input.value = v;
        var f = wrap.closest('form'); if (f && f.dataset.autosubmit !== undefined) f.submit();
      });
    });
    input.addEventListener('change', function () { var f = wrap.closest('form'); if (f && f.dataset.autosubmit !== undefined) f.submit(); });
  });

  /* ---------- Product ---------- */
  $$('[data-product]').forEach(function (root) {
    var json = $('[data-product-json]', root);
    if (!json) return;
    var product = JSON.parse(json.textContent);
    var form = $('form[data-product-form]', root);
    var idInput = $('input[name=id]', form);
    var atc = $('[data-atc]', root);
    var sticky = $('[data-sticky-atc]');
    var money = function (cents) { return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: product.currency || 'EUR' }).format(cents / 100); };

    function currentOptions() {
      return product.options.map(function (_, i) {
        var c = $('[data-option-index="' + i + '"]:checked', root) || $('select[data-option-index="' + i + '"]', root);
        return c ? c.value : null;
      });
    }
    function findVariant(opts) {
      return product.variants.find(function (v) { return v.options.every(function (o, i) { return o === opts[i]; }); });
    }
    function update() {
      var opts = currentOptions();
      var v = findVariant(opts);
      $$('[data-selected-option]', root).forEach(function (el) { el.textContent = opts[Number(el.dataset.selectedOption)] || ''; });
      if (!v) { atc.disabled = true; atc.textContent = (L.strings.unavailable || 'Niet beschikbaar'); return; }
      idInput.value = v.id;
      atc.disabled = !v.available;
      atc.textContent = v.available ? L.strings.addToCart : L.strings.soldOut;
      $$('[data-price]', root).forEach(function (el) { el.textContent = money(v.price); });
      if (sticky) { $('[data-sticky-price]', sticky).textContent = money(v.price) + ' · ' + opts.join(' / '); var sb = $('button', sticky); sb.disabled = !v.available; }
      if (history.replaceState) { var u = new URL(location.href); u.searchParams.set('variant', v.id); history.replaceState({}, '', u); }
      // Galerij naar variantafbeelding
      var target = v.featured_media_id ? $('[data-media-id="' + v.featured_media_id + '"]', root) : $('[data-media-option="' + (opts[0] || '').toLowerCase() + '"]', root);
      if (target) { var track = target.parentElement; track.scrollTo({ left: target.offsetLeft - track.offsetLeft, behavior: 'smooth' }); }
      updateBundles(v);
    }
    function updateBundles(v) {
      $$('[data-bundle-qty]', root).forEach(function (opt) {
        var q = Number(opt.dataset.bundleQty), d = Number(opt.dataset.bundleDiscount || 0);
        var total = (v.price - d) * q;
        var p = $('[data-bundle-total]', opt); if (p) p.textContent = money(total);
        var each = $('[data-bundle-each]', opt); if (each) each.textContent = money(v.price - d);
        var s = $('[data-bundle-saving]', opt); if (s) s.textContent = money(d * q);
      });
    }
    $$('[data-option-index]', root).forEach(function (el) { el.addEventListener('change', update); });

    // Galerij thumbnails + dots
    var track = $('.gallery__track', root);
    if (track) {
      var slides = $$('.gallery__slide', track);
      var thumbs = $$('.gallery__thumbs button', root);
      var dots = $$('.gallery__dots span', root);
      thumbs.forEach(function (t, i) { t.addEventListener('click', function () { track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' }); }); });
      var raf;
      track.addEventListener('scroll', function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var i = Math.round(track.scrollLeft / track.clientWidth);
          thumbs.forEach(function (t, j) { t.setAttribute('aria-current', j === i ? 'true' : 'false'); });
          dots.forEach(function (d, j) { d.classList.toggle('is-active', j === i); });
        });
      }, { passive: true });
    }

    // Sticky mobiele koopknop
    if (sticky && atc && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        var past = !e.isIntersecting && e.boundingClientRect.top < 0;
        sticky.classList.toggle('is-visible', past);
        sticky.setAttribute('aria-hidden', past ? 'false' : 'true');
        if (past) sticky.removeAttribute('inert'); else sticky.setAttribute('inert', '');
      }).observe(atc);
      $('button', sticky).addEventListener('click', function () {
        if (form.requestSubmit) form.requestSubmit(); else atc.click();
      });
    }
    var initial = findVariant(currentOptions());
    if (initial) updateBundles(initial);
  });
})();
