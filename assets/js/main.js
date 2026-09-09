/* Progressive enhancement only: the page is complete in English without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Language ---------- */

  var DEFAULT = 'en';
  var dict = window.I18N || {};
  var available = dict.order || [DEFAULT];
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.lang [data-lang]'));

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

    root.setAttribute('lang', strings['html.lang'] || lang);

    if (strings['meta.title']) document.title = strings['meta.title'];
    var desc = document.querySelector('meta[name="description"]');
    if (desc && strings['meta.description']) desc.setAttribute('content', strings['meta.description']);

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      var value = strings[el.getAttribute('data-i18n')];
      if (typeof value === 'string') el.innerHTML = value;
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-alt]'), function (el) {
      var value = strings[el.getAttribute('data-i18n-alt')];
      if (typeof value === 'string') el.setAttribute('alt', value);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n-label]'), function (el) {
      var value = strings[el.getAttribute('data-i18n-label')];
      if (typeof value === 'string') el.setAttribute('aria-label', value);
    });

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

  /* ---------- Reveal on scroll ---------- */

  if (reduced || !('IntersectionObserver' in window)) return;

  root.className += ' js';

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) {
    observer.observe(el);
  });
})();
