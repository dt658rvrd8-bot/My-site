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
    cartFoot: $("#cartFoot"), cartTotal: $("#cartTotal"), cartCount: $("#cartCount"), cartHint: $("#cartHint"),
    toast: $("#toast"),
  };

  // ---------- Контакты ----------
  function initContacts() {
    const hello = "Здравствуйте! Пишу с сайта М Маркет.kg.";
    ["#headerWhatsapp", "#heroWhatsapp", "#footerWhatsapp"].forEach((s) => ($(s).href = waLink(hello)));
    ["#headerInstagram", "#footerInstagram"].forEach((s) => ($(s).href = SHOP.instagram));
    $("#footerAddress").textContent = SHOP.address;
    $("#footerHours").textContent = "Режим работы: " + SHOP.hours;
    $("#perkHours").textContent = SHOP.hours;
    const phone = $("#footerPhone");
    phone.textContent = "WhatsApp: " + SHOP.phoneDisplay;
    phone.href = waLink(hello);
    phone.target = "_blank";
    phone.rel = "noopener";
    $("#year").textContent = new Date().getFullYear();
  }

  // ---------- Навигация и плитки ----------
  const countIn = (catId) => PRODUCTS.filter((p) => catId === "all" || p.category === catId).length;

  function renderNav() {
    const items = [{ id: "all", title: "Все товары" }].concat(CATEGORIES);
    el.nav.innerHTML = items.map((c) =>
      '<button class="nav__item' + (state.category === c.id ? " is-active" : "") + '" data-category="' + c.id + '">' +
      escapeHtml(c.title) + "</button>"
    ).join("") +
      '<button class="nav__item nav__item--sale' + (state.tab === "sale" ? " is-active" : "") + '" data-tab="sale">Скидки</button>';
  }

  function renderCatTiles() {
    el.cats.innerHTML = CATEGORIES.map((c) =>
      '<button class="cat' + (state.category === c.id ? " is-active" : "") + '" data-category="' + c.id + '">' +
        '<span class="cat__icon">' + ICONS[c.id] + "</span>" +
        '<span class="cat__title">' + escapeHtml(c.title) + "</span>" +
        '<span class="cat__count">' + countIn(c.id) + " шт.</span>" +
      "</button>"
    ).join("");
  }

  function renderTabs() {
    const base = PRODUCTS.filter((p) => state.category === "all" || p.category === state.category);
    el.tabs.innerHTML = TABS.map((t) => {
      const n = base.filter(t.test).length;
      const active = state.tab === t.id;
      return '<button class="tab' + (active ? " is-active" : "") + '" role="tab" aria-selected="' + active +
        '" data-tab="' + t.id + '">' + t.title + '<span class="tab__count">' + n + "</span></button>";
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
      if (state.tab === "sale" && cat.closest("#nav")) state.tab = "all";
    }
    if (tab) state.tab = tab.dataset.tab;
    if (brand) {
      state.category = "all";
      state.tab = "all";
      el.search.value = brand.dataset.brand;
      state.query = brand.dataset.brand;
      el.searchClear.hidden = false;
    }
    renderFilters();
    renderProducts();
    if (!e.target.closest("#tabs")) scrollToCatalog();
    if (cat && cat.closest("#nav")) cat.scrollIntoView({ inline: "nearest", block: "nearest" });
  });

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
      state.tab !== "all" ? tab.title : "Все товары";
    el.results.textContent = list.length + " " + pluralGoods(list.length);
    el.empty.hidden = list.length > 0;

    el.grid.innerHTML = list.map((p) => {
      const inCart = state.cart[p.id] || 0;
      const d = discount(p);
      const badges =
        (p.badge === "hit" ? '<span class="badge badge--hit">Хит</span>' : "") +
        (p.badge === "new" ? '<span class="badge badge--new">Новинка</span>' : "") +
        (d ? '<span class="badge badge--sale">−' + d + "%</span>" : "");
      return (
        '<article class="card">' +
          '<div class="card__media">' + mediaHtml(p) + '<div class="badges">' + badges + "</div></div>" +
          '<div class="card__body">' +
            (p.brand
              ? '<div class="card__brand">' + highlight(p.brand, state.query) + "</div>"
              : '<div class="card__cat">' + escapeHtml(categoryTitle(p.category)) + "</div>") +
            '<h3 class="card__name">' + highlight(p.name, state.query) + "</h3>" +
            '<p class="card__desc">' + highlight(p.description, state.query) + "</p>" +
            '<div class="card__prices">' +
              '<span class="card__price' + (d ? " card__price--sale" : "") + '">' + formatPrice(p.price) + "</span>" +
              (d ? '<span class="card__old">' + formatPrice(p.oldPrice) + "</span>" : "") +
            "</div>" +
            '<div class="card__actions">' +
              '<button class="btn btn--dark' + (inCart ? " is-added" : "") + '" data-add="' + p.id + '">' + BAG_ICON +
                (inCart ? "В корзине · " + inCart : "В корзину") + "</button>" +
              '<a class="btn btn--outline" target="_blank" rel="noopener" href="' + escapeHtml(waLink(singleOrderText(p))) + '">' + WA_ICON +
                '<span class="lbl-full">Заказать в WhatsApp</span><span class="lbl-short">Заказать</span></a>' +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
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
    renderProducts();
    const p = PRODUCTS.find((x) => String(x.id) === id);
    showToast("Добавлено в корзину: " + p.name);
    el.cartCount.classList.remove("bump");
    void el.cartCount.offsetWidth;
    el.cartCount.classList.add("bump");
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

    el.cartCount.textContent = count > 99 ? "99+" : count;
    el.cartCount.classList.toggle("is-empty", count === 0);
    $("#cartOpen").setAttribute("aria-label", "Открыть корзину, товаров: " + count);

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
    if (inc || dec) { saveCart(); updateCart(); renderProducts(); }
  });

  $("#cartClear").addEventListener("click", () => {
    state.cart = {};
    saveCart(); updateCart(); renderProducts();
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
  $("#cartOpen").addEventListener("click", openCart);
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
