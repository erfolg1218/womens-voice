/* =========================================================
   Women's Voice — common script
   - モバイルメニュー
   - IntersectionObserver による静かなリビール
   - 統計グラフのアニメーション
   - フォーム (未接続: 送信しない)
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("global-nav");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1200) setMenu(false);
    });
  }

  /* ---------- charts ---------- */
  function drawCharts(scope) {
    scope.querySelectorAll(".donut__value").forEach(function (circle) {
      var r = parseFloat(circle.getAttribute("r"));
      var c = 2 * Math.PI * r;
      var value = parseFloat(circle.dataset.value) || 0;
      var offset = parseFloat(circle.dataset.offset) || 0;
      circle.style.strokeDasharray = (c * value / 100) + " " + c;
      circle.style.strokeDashoffset = String(-c * offset / 100);
    });
    scope.querySelectorAll(".bar__fill").forEach(function (bar) {
      bar.style.width = (parseFloat(bar.dataset.value) || 0) + "%";
    });
  }

  // 初期状態 (0 から描画するため)
  document.querySelectorAll(".donut__value").forEach(function (circle) {
    var r = parseFloat(circle.getAttribute("r"));
    var c = 2 * Math.PI * r;
    circle.style.strokeDasharray = "0 " + c;
  });

  /* ---------- reveal ---------- */
  var targets = document.querySelectorAll(".reveal, .reveal-img, .flow, [data-chart]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduce) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
      if (el.hasAttribute("data-chart")) drawCharts(el);
    });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-visible");
        if (el.hasAttribute("data-chart")) drawCharts(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- forms (未接続) ----------
     フォームは現在どこにも送信しない。送信操作時は「準備中」である旨を表示する。
     「送信しました」等の完了表示は絶対に出さないこと。 */
  document.querySelectorAll("form[data-offline-form]").forEach(function (form) {
    var notice = form.querySelector(".form__notice");
    // JS 無効時は送信ボタンを無効のままにし、ページ遷移・データ送出を起こさない
    form.querySelectorAll("[type=submit][disabled]").forEach(function (b) { b.disabled = false; });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (notice) {
        notice.classList.add("is-shown");
        notice.setAttribute("tabindex", "-1");
        notice.focus({ preventScroll: true });
        notice.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      }
    });
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
