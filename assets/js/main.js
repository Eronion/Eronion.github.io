/* Progressive enhancement only: the page is complete in English without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var each = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };

  root.classList.add('js');

  /* ---------- Language ---------- */

  var DEFAULT = 'en';
  var dict = window.I18N || {};
  var available = dict.order || [DEFAULT];
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.lang [data-lang]'));

  /* English lives in the markup: snapshot it once so switching back needs no second copy. */
  var english = { 'html.lang': 'en', 'meta.title': document.title };
  var descEl = document.querySelector('meta[name="description"]');
  if (descEl) english['meta.description'] = descEl.getAttribute('content');
  each('[data-i18n]', function (el) { english[el.getAttribute('data-i18n')] = el.innerHTML; });
  each('[data-i18n-alt]', function (el) { english[el.getAttribute('data-i18n-alt')] = el.getAttribute('alt'); });
  each('[data-i18n-label]', function (el) { english[el.getAttribute('data-i18n-label')] = el.getAttribute('aria-label'); });
  dict.en = english;

  function supported(lang) {
    return lang && available.indexOf(lang) !== -1 ? lang : null;
  }

  function stored() {
    try { return supported(localStorage.getItem('lang')); } catch (e) { return null; }
  }

  function remember(lang) {
    try { localStorage.setItem('lang', lang); } catch (e) { /* private mode: ignore */ }
  }

  function fromQuery() {
    var match = /[?&]lang=([a-z]{2})/i.exec(window.location.search);
    return match ? supported(match[1].toLowerCase()) : null;
  }

  function apply(lang) {
    var strings = dict[lang];
    if (!strings) return;
    var get = function (key) {
      return typeof strings[key] === 'string' ? strings[key] : english[key];
    };

    root.setAttribute('lang', get('html.lang') || lang);
    document.title = get('meta.title');
    if (descEl) descEl.setAttribute('content', get('meta.description'));

    each('[data-i18n]', function (el) { el.innerHTML = get(el.getAttribute('data-i18n')); });
    each('[data-i18n-alt]', function (el) { el.setAttribute('alt', get(el.getAttribute('data-i18n-alt'))); });
    each('[data-i18n-label]', function (el) { el.setAttribute('aria-label', get(el.getAttribute('data-i18n-label'))); });

    buttons.forEach(function (btn) {
      var on = btn.getAttribute('data-lang') === lang;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.classList.toggle('on', on);
    });
  }

  if (available.length > 1 && buttons.length) root.classList.add('js-i18n');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.getAttribute('data-lang');
      if (!supported(lang)) return;
      remember(lang);
      apply(lang);
    });
  });

  /* English is the default: only an explicit ?lang= or a remembered choice changes it. */
  apply(fromQuery() || stored() || DEFAULT);

  /* ---------- Project filter ---------- */

  var filters = Array.prototype.slice.call(document.querySelectorAll('.filters [data-filter]'));
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      each('.grid .item', function (item) {
        item.hidden = cat !== 'all' && item.getAttribute('data-cat') !== cat;
      });
    });
  });

  /* ---------- Reveal on scroll ---------- */

  if (reduced || !('IntersectionObserver' in window)) return;

  root.classList.add('js-reveal');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  each('.reveal', function (el) { observer.observe(el); });
})();
