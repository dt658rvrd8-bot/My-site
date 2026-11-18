/* =========================================================
   М Маркет.kg — логика каталога и корзины
   Товары и настройки магазина находятся в файле products.js
   ========================================================= */
(function () {
  "use strict";

  const CART_KEY = "mmarket_cart_v1";
  const FREE_DELIVERY_FROM = 5000;

  // ---------- Утилиты ----------
  const $ = (sel) => document.querySelector(sel);

  const formatPrice = (n) =>
    n.toLocaleString("ru-RU").replace(/ | |,/g, " ") + " " + SHOP.currency;

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Нормализация для поиска: регистр и «ё» → «е» (длина строки не меняется)
  const normalize = (s) => String(s).toLowerCase().replace(/ё/g, "е");

  const categoryTitle = (id) => (CATEGORIES.find((c) => c.id === id) || {}).title || "";

  const waLink = (text) =>
    "https://wa.me/" + SHOP.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");

  const fullName = (p) => (p.brand ? p.brand + " — " : "") + p.name;
  const discount = (p) => (p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const src = normalize(text);
    const q = normalize(query);
    let out = "", i = 0, idx;
    while ((idx = src.indexOf(q, i)) !== -1) {
      out += escapeHtml(text.slice(i, idx)) + "<mark>" + escapeHtml(text.slice(idx, idx + q.length)) + "</mark>";
      i = idx + q.length;
    }
    return out + escapeHtml(text.slice(i));
  }

  // ---------- Иконки категорий ----------
  const ICONS = {
    care: '<svg viewBox="0 0 48 48"><rect x="13" y="20" width="22" height="20" rx="5"/><rect x="16" y="13" width="16" height="7" rx="2"/><path d="M19 28h10M19 32h6"/></svg>',
    makeup: '<svg viewBox="0 0 48 48"><path d="M19 22h10v18H19z"/><path d="M19 22l2-12h6l2 12"/><path d="M21 10c1-2 5-2 6 0"/><path d="M19 30h10"/></svg>',
    perfume: '<svg viewBox="0 0 48 48"><rect x="12" y="18" width="24" height="22" rx="6"/><rect x="20" y="10" width="8" height="8" rx="1.5"/><path d="M28 13h5"/><circle cx="24" cy="29" r="4"/></svg>',
    bags: '<svg viewBox="0 0 48 48"><path d="M9 18h30l-3 22H12z"/><path d="M17 18v-3a7 7 0 0 1 14 0v3"/><path d="M21 26h6"/></svg>',
    household: '<svg viewBox="0 0 48 48"><path d="M17 18h12l3 6v16H14V24z"/><path d="M20 18v-6h7l6 3"/><path d="M14 30h18"/></svg>',
  };
  const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.5c0 3.3 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2-1.5 1z" fill="currentColor" stroke="none"/></svg>';
  const BAG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/></svg>';

  function mediaHtml(p) {
    if (p.image) return '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(fullName(p)) + '" loading="lazy" />';
    return '<div class="placeholder placeholder--' + p.category + '">' + (ICONS[p.category] || ICONS.care) +
      '<span class="placeholder__label">Фото скоро</span></div>';
  }

  // ---------- Подборки ----------
  const TABS = [
    { id: "all",  title: "Все",           test: () => true },
    { id: "hit",  title: "Хиты продаж",   test: (p) => p.badge === "hit" },
    { id: "new",  title: "Новинки",       test: (p) => p.badge === "new" },
    { id: "sale", title: "Скидки",        test: (p) => discount(p) > 0 },
  ];

  // ---------- Состояние ----------
  const state = { category: "all", tab: "all", sort: "popular", query: "", cart: loadCart() };

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      const cart = {};
      Object.keys(raw).forEach((id) => {
        if (PRODUCTS.some((p) => String(p.id) === id) && raw[id] > 0) cart[id] = raw[id];
      });
      return cart;
    } catch (e) { return {}; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch (e) { /* недоступно */ }
  }

  const el = {
    grid: $("#productGrid"), nav: $("#nav"), tabs: $("#tabs"), cats: $("#catTiles"), brands: $("#brands"),
    search: $("#searchInput"), searchClear: $("#searchClear"), sort: $("#sortSelect"),
    empty: $("#emptyState"), results: $("#resultsCount"), title: $("#catalogTitle"),
    cart: $("#cart"), overlay: $("#cartOverlay"), cartItems: $("#cartItems"), cartEmpty: $("#cartEmpty"),
    cartFoot: $("#cartFoot"), cartTotal: $("#cartTotal"), cartHint: $("#cartHint"),
    cartCounts: document.querySelectorAll(".js-cart-count"), chips: $("#categoryChips"),
    toast: $("#toast"),
  };

  // ---------- Контакты ----------
  function initContacts() {
    const hello = "Здравствуйте! Пишу с сайта М Маркет.kg.";
    ["#headerWhatsapp", "#heroWhatsapp", "#footerWhatsapp", "#tabbarWhatsapp"].forEach((s) => ($(s).href = waLink(hello)));
    ["#headerInstagram", "#footerInstagram"].forEach((s) => ($(s).href = SHOP.instagram));
    $("#footerAddress").textContent = SHOP.address;
    $("#footerHours").textContent = "Режим работы: " + SHOP.hours.toLowerCase();
    $("#footerHoursShort").textContent = SHOP.hours.toLowerCase();
    $("#perkHours").textContent = SHOP.hours;
    const phone = $("#footerPhone");
    phone.textContent = SHOP.phoneDisplay;
    phone.href = waLink(hello);
    $("#year").textContent = new Date().getFullYear();
  }

  // ---------- Навигация и плитки ----------
  const countIn = (catId) => PRODUCTS.filter((p) => catId === "all" || p.category === catId).length;

  function renderNav() {
    const items = [{ id: "all", title: "Все товары" }].concat(CATEGORIES);
    el.nav.innerHTML = items.map((c) =>
      '<button class="nav__item' + (state.category === c.id && state.tab !== "sale" ? " is-active" : "") + '" data-category="' + c.id + '">' +
      escapeHtml(c.title) + "</button>"
    ).join("") +
      '<button class="nav__item nav__item--sale' + (state.tab === "sale" ? " is-active" : "") + '" data-tab="sale" data-reset-category>Скидки</button>';
  }

  // Плитки под баннером: подборки + категории
  function renderCatTiles() {
    const special = [
      { tab: "sale", title: "Скидки", icon: '<span class="tile__img tile__img--sale">%</span>' },
      { tab: "new", title: "Новинки", icon: '<span class="tile__img"><svg viewBox="0 0 24 24"><path d="M12 3l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 15.4 7 18.2l1.2-5.6L4 8.8l5.6-.6z"/></svg></span>' },
      { tab: "hit", title: "Хиты продаж", icon: '<span class="tile__img"><svg viewBox="0 0 24 24"><path d="M12 21c-4 0-7-2.7-7-6.5 0-3 2-5 3.5-6.5.3 2 1.3 3 2.5 3.5C11 8 12 5 14.5 3c.5 3 4.5 5.5 4.5 11 0 4-3 7-7 7z"/></svg></span>' },
    ];
    el.cats.innerHTML =
      special.map((t) =>
        '<button class="tile' + (state.tab === t.tab ? " is-active" : "") + '" data-tab="' + t.tab + '" data-reset-category>' +
        t.icon + '<span class="tile__label">' + t.title + "</span></button>"
      ).join("") +
      CATEGORIES.map((c) =>
        '<button class="tile' + (state.category === c.id ? " is-active" : "") + '" data-category="' + c.id + '">' +
          '<span class="tile__img">' + ICONS[c.id] + "</span>" +
          '<span class="tile__label">' + escapeHtml(c.title) + "</span>" +
        "</button>"
      ).join("");
  }

  function renderChips() {
    const items = [{ id: "all", title: "Все" }].concat(CATEGORIES);
    el.chips.innerHTML = items.map((c) => {
      const active = state.category === c.id;
      return '<button class="chip' + (active ? " is-active" : "") + '" role="tab" aria-selected="' + active +
        '" data-category="' + c.id + '">' + escapeHtml(c.title) + '<span class="chip__count">' + countIn(c.id) + "</span></button>";
    }).join("");
  }

  function renderTabs() {
    const base = PRODUCTS.filter((p) => state.category === "all" || p.category === state.category);
    el.tabs.innerHTML = TABS.map((t) => {
      const n = base.filter(t.test).length;
      const active = state.tab === t.id;
      return '<button class="tab' + (active ? " is-active" : "") + '" role="tab" aria-selected="' + active +
        '" data-tab="' + t.id + '">' + t.title + " · " + n + "</button>";
    }).join("");
  }

  function renderBrands() {
    const brands = [...new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))];
    el.brands.innerHTML = brands.map((b) => '<button class="brand" data-brand="' + escapeHtml(b) + '">' + escapeHtml(b) + "</button>").join("");
  }

  function renderFooterCats() {
    $("#footerCats").innerHTML = CATEGORIES.map((c) =>
      '<li><button data-category="' + c.id + '">' + escapeHtml(c.title) + "</button></li>"
    ).join("");
  }

  function renderFilters() {
    renderNav();
    renderCatTiles();
    renderChips();
    renderTabs();
  }

  function scrollToCatalog() {
    $("#catalog").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Единый обработчик для всех кнопок категорий, подборок и брендов
  document.addEventListener("click", (e) => {
    const cat = e.target.closest("[data-category]");
    const tab = e.target.closest("[data-tab]");
    const brand = e.target.closest("[data-brand]");
    if (!cat && !tab && !brand) return;

    if (cat) {
      state.category = cat.dataset.category;
      if (!cat.closest("#categoryChips")) state.tab = "all";
    }
    if (tab) {
      state.tab = tab.dataset.tab;
      if (tab.hasAttribute("data-reset-category")) state.category = "all";
    }
    if (brand) {
      state.category = "all";
      state.tab = "all";
      el.search.value = brand.dataset.brand;
      state.query = brand.dataset.brand;
      el.searchClear.hidden = false;
    }
    renderFilters();
    renderProducts();
    if (!e.target.closest("#tabs, #categoryChips")) scrollToCatalog();
    if (cat && cat.closest("#nav")) cat.scrollIntoView({ inline: "nearest", block: "nearest" });
  });

  document.querySelectorAll(".js-to-catalog").forEach((b) => b.addEventListener("click", scrollToCatalog));
  document.querySelectorAll(".js-focus-search").forEach((b) => b.addEventListener("click", () => {
    scrollToCatalog();
    setTimeout(() => el.search.focus({ preventScroll: true }), 350);
  }));

  // ---------- Поиск ----------
  el.search.addEventListener("input", () => {
    state.query = el.search.value.trim();
    el.searchClear.hidden = !el.search.value;
    renderProducts();
    // Если каталог ещё ниже экрана — показываем результаты
    const top = $("#catalog").getBoundingClientRect().top;
    if (state.query && top > window.innerHeight * 0.6) scrollToCatalog();
  });
  el.search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearSearch();
    if (e.key === "Enter") { el.search.blur(); scrollToCatalog(); }
  });
  function clearSearch() {
    el.search.value = "";
    state.query = "";
    el.searchClear.hidden = true;
    renderProducts();
  }
  el.searchClear.addEventListener("click", () => { clearSearch(); el.search.focus(); });

  el.sort.addEventListener("change", () => { state.sort = el.sort.value; renderProducts(); });

  $("#resetFilters").addEventListener("click", () => {
    state.category = "all";
    state.tab = "all";
    clearSearch();
    renderFilters();
  });

  // ---------- Каталог ----------
  function getFiltered() {
    const q = normalize(state.query);
    const tab = TABS.find((t) => t.id === state.tab) || TABS[0];
    const list = PRODUCTS.filter((p) => {
      if (state.category !== "all" && p.category !== state.category) return false;
      if (!tab.test(p)) return false;
      if (!q) return true;
      return normalize(p.name + " " + p.brand + " " + p.description + " " + categoryTitle(p.category)).includes(q);
    });
    const rank = (p) => (p.badge === "hit" ? 0 : p.badge === "new" ? 1 : 2);
    const sorters = {
      popular: (a, b) => rank(a) - rank(b) || a.id - b.id,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      discount: (a, b) => discount(b) - discount(a) || a.price - b.price,
    };
    return list.sort(sorters[state.sort] || sorters.popular);
  }

  function pluralGoods(n) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return "товар";
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "товара";
    return "товаров";
  }

  function renderProducts() {
    const list = getFiltered();
    const tab = TABS.find((t) => t.id === state.tab);
    el.title.textContent =
      state.query ? "Результаты поиска" :
      state.category !== "all" ? categoryTitle(state.category) :
      state.tab !== "all" ? tab.title : "Каталог";
    el.results.textContent = list.length + " " + pluralGoods(list.length);
    el.empty.hidden = list.length > 0;

    el.grid.innerHTML = list.map((p) => {
      const inCart = state.cart[p.id] || 0;
      const d = discount(p);
      return (
        '<article class="card">' +
          '<div class="card__media">' + mediaHtml(p) +
            (d ? '<span class="disc">−' + d + "%</span>" : "") +
            (p.badge === "hit" ? '<span class="label label--hit">Хит</span>' : "") +
            (p.badge === "new" ? '<span class="label">Новинка</span>' : "") +
          "</div>" +
          '<div class="card__body">' +
            '<div class="card__type">' + escapeHtml(categoryTitle(p.category)) + "</div>" +
            '<h3 class="card__name">' + (p.brand ? highlight(p.brand, state.query) + " " : "") + highlight(p.name, state.query) + "</h3>" +
            '<p class="card__desc">' + highlight(p.description, state.query) + "</p>" +
            '<div class="card__buy">' +
              '<button class="price-pill' + (inCart ? " is-added" : "") + '" data-add="' + p.id + '" aria-label="В корзину: ' + escapeHtml(fullName(p)) + '">' +
                BAG_ICON +
                '<span class="price-pill__now">' + formatPrice(p.price) + "</span>" +
                (d ? '<span class="price-pill__old">' + formatPrice(p.oldPrice) + "</span>" : "") +
                '<span class="price-pill__action">' + (inCart ? "В корзине · " + inCart : "В корзину") + "</span>" +
              "</button>" +
              '<a class="card__wa" target="_blank" rel="noopener" href="' + escapeHtml(waLink(singleOrderText(p))) + '">' + WA_ICON +
                '<span class="lbl-full">Заказать в WhatsApp</span><span class="lbl-short">Заказать</span></a>' +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  // Обновляет только кнопки «В корзину», без перерисовки каталога
  function refreshBuyButtons() {
    el.grid.querySelectorAll("[data-add]").forEach((btn) => {
      const qty = state.cart[btn.dataset.add] || 0;
      btn.classList.toggle("is-added", qty > 0);
      btn.querySelector(".price-pill__action").textContent = qty ? "В корзине · " + qty : "В корзину";
    });
  }

  function singleOrderText(p) {
    return "Здравствуйте! Хочу заказать в М Маркет.kg:\n\n" +
      "• " + fullName(p) + " (" + p.description + ") — " + formatPrice(p.price) + "\n\n" +
      "Подскажите, пожалуйста, по наличию и доставке.";
  }

  el.grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.dataset.add;
    state.cart[id] = (state.cart[id] || 0) + 1;
    saveCart();
    updateCart();
    refreshBuyButtons();
    const p = PRODUCTS.find((x) => String(x.id) === id);
    showToast("Добавлено в корзину: " + p.name);
    el.cartCounts.forEach((c) => { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); });
  });

  // ---------- Корзина ----------
  function cartEntries() {
    return Object.keys(state.cart)
      .map((id) => ({ product: PRODUCTS.find((p) => String(p.id) === id), qty: state.cart[id] }))
      .filter((x) => x.product && x.qty > 0);
  }

  function updateCart() {
    const items = cartEntries();
    const count = items.reduce((s, x) => s + x.qty, 0);
    const total = items.reduce((s, x) => s + x.qty * x.product.price, 0);

    el.cartCounts.forEach((c) => {
      c.textContent = count > 99 ? "99+" : count;
      c.classList.toggle("is-empty", count === 0);
    });
    document.querySelectorAll(".js-cart-open").forEach((b) => b.setAttribute("aria-label", "Открыть корзину, товаров: " + count));

    el.cartEmpty.hidden = items.length > 0;
    el.cartFoot.hidden = items.length === 0;
    el.cartItems.hidden = items.length === 0;
    el.cartTotal.textContent = formatPrice(total);

    const left = FREE_DELIVERY_FROM - total;
    el.cartHint.textContent = left > 0
      ? "До бесплатной доставки осталось " + formatPrice(left)
      : "Доставка по Бишкеку — бесплатно";
    el.cartHint.classList.toggle("is-free", left <= 0);

    el.cartItems.innerHTML = items.map(({ product: p, qty }) =>
      '<div class="cart-item">' +
        '<div class="cart-item__thumb">' + mediaHtml(p) + "</div>" +
        "<div>" +
          (p.brand ? '<div class="cart-item__brand">' + escapeHtml(p.brand) + "</div>" : "") +
          '<p class="cart-item__name">' + escapeHtml(p.name) + "</p>" +
          '<p class="cart-item__price">' + formatPrice(p.price) + " / шт.</p>" +
          '<div class="cart-item__row">' +
            '<div class="qty">' +
              '<button class="qty__btn" data-dec="' + p.id + '" aria-label="Уменьшить количество">−</button>' +
              '<span class="qty__val">' + qty + "</span>" +
              '<button class="qty__btn" data-inc="' + p.id + '" aria-label="Увеличить количество">+</button>' +
            "</div>" +
            '<span class="cart-item__sum">' + formatPrice(p.price * qty) + "</span>" +
          "</div>" +
        "</div>" +
      "</div>"
    ).join("");
  }

  el.cartItems.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (inc) state.cart[inc.dataset.inc] = (state.cart[inc.dataset.inc] || 0) + 1;
    if (dec) {
      const id = dec.dataset.dec;
      state.cart[id] = (state.cart[id] || 0) - 1;
      if (state.cart[id] <= 0) delete state.cart[id];
    }
    if (inc || dec) { saveCart(); updateCart(); refreshBuyButtons(); }
  });

  $("#cartClear").addEventListener("click", () => {
    state.cart = {};
    saveCart(); updateCart(); refreshBuyButtons();
  });

  $("#cartCheckout").addEventListener("click", () => {
    const items = cartEntries();
    if (!items.length) return;
    const total = items.reduce((s, x) => s + x.qty * x.product.price, 0);
    const lines = items.map((x, i) =>
      (i + 1) + ". " + fullName(x.product) + " — " + x.qty + " шт. × " + formatPrice(x.product.price) +
      " = " + formatPrice(x.qty * x.product.price));
    const delivery = total >= FREE_DELIVERY_FROM
      ? "Доставка: бесплатно (заказ от 5 000 сом)"
      : "Доставка: Яндекс Такси по тарифу";
    const text = "Здравствуйте! Хочу оформить заказ в М Маркет.kg:\n\n" +
      lines.join("\n") +
      "\n\nИтого: " + formatPrice(total) + "\n" + delivery +
      "\n\nСпособ получения: доставка / самовывоз\nОплата: наличные / карта / перевод\nИмя:\nАдрес:";
    window.open(waLink(text), "_blank", "noopener");
  });

  let lastFocus = null;
  function openCart() {
    lastFocus = document.activeElement;
    el.cart.classList.add("is-open");
    el.cart.setAttribute("aria-hidden", "false");
    el.overlay.hidden = false;
    document.body.classList.add("no-scroll");
    $("#cartClose").focus();
  }
  function closeCart() {
    el.cart.classList.remove("is-open");
    el.cart.setAttribute("aria-hidden", "true");
    el.overlay.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll(".js-cart-open").forEach((b) => b.addEventListener("click", openCart));
  $("#cartClose").addEventListener("click", closeCart);
  el.overlay.addEventListener("click", closeCart);
  $("#cartToCatalog").addEventListener("click", () => { closeCart(); scrollToCatalog(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.cart.classList.contains("is-open")) closeCart();
  });

  // ---------- Уведомление ----------
  let toastTimer;
  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("is-visible"), 1800);
  }

  // ---------- Запуск ----------
  initContacts();
  renderFilters();
  renderBrands();
  renderFooterCats();
  renderProducts();
  updateCart();
})();
