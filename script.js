/* =========================================================
   М Маркет — логика каталога и корзины
   Товары и настройки магазина находятся в файле products.js
   ========================================================= */
(function () {
  "use strict";

  const CART_KEY = "mmarket_cart_v1";

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

  // Подсветка совпадений поиска
  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const src = normalize(text);
    const q = normalize(query);
    let out = "";
    let i = 0;
    let idx;
    while ((idx = src.indexOf(q, i)) !== -1) {
      out += escapeHtml(text.slice(i, idx)) + "<mark>" + escapeHtml(text.slice(idx, idx + q.length)) + "</mark>";
      i = idx + q.length;
    }
    return out + escapeHtml(text.slice(i));
  }

  // ---------- Иконки-заглушки по категориям ----------
  const ICONS = {
    care: '<svg viewBox="0 0 48 48"><rect x="13" y="20" width="22" height="20" rx="5"/><rect x="16" y="13" width="16" height="7" rx="2"/><path d="M19 28h10M19 32h6"/></svg>',
    makeup: '<svg viewBox="0 0 48 48"><path d="M19 22h10v18H19z"/><path d="M19 22l2-12h6l2 12"/><path d="M21 10c1-2 5-2 6 0"/><path d="M19 30h10"/></svg>',
    perfume: '<svg viewBox="0 0 48 48"><rect x="12" y="18" width="24" height="22" rx="6"/><rect x="20" y="10" width="8" height="8" rx="1.5"/><path d="M28 13h5"/><circle cx="24" cy="29" r="4"/></svg>',
    bags: '<svg viewBox="0 0 48 48"><path d="M9 18h30l-3 22H12z"/><path d="M17 18v-3a7 7 0 0 1 14 0v3"/><path d="M21 26h6"/></svg>',
    household: '<svg viewBox="0 0 48 48"><path d="M17 18h12l3 6v16H14V24z"/><path d="M20 18v-6h7l6 3"/><path d="M14 30h18"/></svg>',
  };

  function mediaHtml(p) {
    if (p.image) {
      return '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy" />';
    }
    return (
      '<div class="placeholder placeholder--' + p.category + '">' +
      (ICONS[p.category] || ICONS.care) +
      '<span class="placeholder__label">Фото скоро</span></div>'
    );
  }

  // ---------- Состояние ----------
  const state = {
    category: "all",
    query: "",
    cart: loadCart(),
  };

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      const cart = {};
      Object.keys(raw).forEach((id) => {
        if (PRODUCTS.some((p) => String(p.id) === id) && raw[id] > 0) cart[id] = raw[id];
      });
      return cart;
    } catch (e) {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    } catch (e) { /* хранилище недоступно — корзина живёт до перезагрузки */ }
  }

  // ---------- Элементы ----------
  const el = {
    grid: $("#productGrid"),
    filters: $("#filters"),
    search: $("#searchInput"),
    searchClear: $("#searchClear"),
    empty: $("#emptyState"),
    results: $("#resultsCount"),
    cart: $("#cart"),
    overlay: $("#cartOverlay"),
    cartItems: $("#cartItems"),
    cartEmpty: $("#cartEmpty"),
    cartFoot: $("#cartFoot"),
    cartTotal: $("#cartTotal"),
    cartCount: $("#cartCount"),
    toast: $("#toast"),
  };

  // ---------- Контакты ----------
  function initContacts() {
    const hello = "Здравствуйте! Пишу с сайта М Маркет.";
    ["#headerWhatsapp", "#heroWhatsapp", "#footerWhatsapp"].forEach((s) => ($(s).href = waLink(hello)));
    ["#headerInstagram", "#footerInstagram"].forEach((s) => ($(s).href = SHOP.instagram));
    $("#footerAddress").textContent = SHOP.address;
    $("#footerHours").textContent = SHOP.hours;
    $("#year").textContent = new Date().getFullYear();
  }

  // ---------- Фильтры ----------
  function renderFilters() {
    const all = [{ id: "all", title: "Все" }].concat(CATEGORIES);
    el.filters.innerHTML = all
      .map((c) => {
        const count = c.id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === c.id).length;
        const active = state.category === c.id;
        return (
          '<button class="chip' + (active ? " is-active" : "") + '" role="tab" aria-selected="' + active +
          '" data-category="' + c.id + '">' + escapeHtml(c.title) +
          '<span class="chip__count">' + count + "</span></button>"
        );
      })
      .join("");
  }

  el.filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    state.category = btn.dataset.category;
    renderFilters();
    renderProducts();
    btn.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  });

  // ---------- Поиск ----------
  el.search.addEventListener("input", () => {
    state.query = el.search.value.trim();
    el.searchClear.hidden = !el.search.value;
    renderProducts();
  });

  el.search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearSearch();
  });

  function clearSearch() {
    el.search.value = "";
    state.query = "";
    el.searchClear.hidden = true;
    renderProducts();
  }

  el.searchClear.addEventListener("click", () => {
    clearSearch();
    el.search.focus();
  });

  $("#resetFilters").addEventListener("click", () => {
    state.category = "all";
    clearSearch();
    renderFilters();
  });

  // ---------- Каталог ----------
  function getFiltered() {
    const q = normalize(state.query);
    return PRODUCTS.filter((p) => {
      if (state.category !== "all" && p.category !== state.category) return false;
      if (!q) return true;
      return normalize(p.name + " " + p.description + " " + categoryTitle(p.category)).includes(q);
    });
  }

  function pluralGoods(n) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return "товар";
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "товара";
    return "товаров";
  }

  function renderProducts() {
    const list = getFiltered();
    el.results.textContent = list.length + " " + pluralGoods(list.length);
    el.empty.hidden = list.length > 0;

    el.grid.innerHTML = list
      .map((p) => {
        const inCart = state.cart[p.id] || 0;
        return (
          '<article class="card">' +
            '<div class="card__media">' + mediaHtml(p) +
              '<span class="badge">' + escapeHtml(categoryTitle(p.category)) + "</span>" +
            "</div>" +
            '<div class="card__body">' +
              '<h3 class="card__name">' + highlight(p.name, state.query) + "</h3>" +
              '<p class="card__desc">' + highlight(p.description, state.query) + "</p>" +
              '<div class="card__price">' + formatPrice(p.price) + "</div>" +
              '<div class="card__actions">' +
                '<button class="btn btn--dark' + (inCart ? " is-added" : "") + '" data-add="' + p.id + '">' +
                  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/></svg>' +
                  (inCart ? "В корзине · " + inCart : "В корзину") +
                "</button>" +
                '<a class="btn btn--wa" target="_blank" rel="noopener" href="' + escapeHtml(waLink(singleOrderText(p))) + '">' +
                  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z"/><path d="M9 8.5c0 3.3 3 6.5 6.5 6.5l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2-1.5 1z" fill="currentColor" stroke="none"/></svg>' +
                  "<span class=\"lbl-full\">Заказать в WhatsApp</span><span class=\"lbl-short\">Заказать</span>" +
                "</a>" +
              "</div>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function singleOrderText(p) {
    return (
      "Здравствуйте! Хочу заказать в М Маркет:\n\n" +
      "• " + p.name + " (" + p.description + ") — " + formatPrice(p.price) + "\n\n" +
      "Подскажите, пожалуйста, по наличию и доставке."
    );
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

    el.cartItems.innerHTML = items
      .map(({ product: p, qty }) =>
        '<div class="cart-item">' +
          '<div class="cart-item__thumb">' + mediaHtml(p) + "</div>" +
          "<div>" +
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
      )
      .join("");
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
    if (inc || dec) {
      saveCart();
      updateCart();
      renderProducts();
    }
  });

  $("#cartClear").addEventListener("click", () => {
    state.cart = {};
    saveCart();
    updateCart();
    renderProducts();
  });

  $("#cartCheckout").addEventListener("click", () => {
    const items = cartEntries();
    if (!items.length) return;
    const total = items.reduce((s, x) => s + x.qty * x.product.price, 0);
    const lines = items.map(
      (x, i) => (i + 1) + ". " + x.product.name + " — " + x.qty + " шт. × " + formatPrice(x.product.price) +
        " = " + formatPrice(x.qty * x.product.price)
    );
    const text =
      "Здравствуйте! Хочу оформить заказ в М Маркет:\n\n" +
      lines.join("\n") +
      "\n\nИтого: " + formatPrice(total) +
      "\n\nСпособ получения: доставка / самовывоз\nИмя:\nАдрес:";
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
  $("#cartToCatalog").addEventListener("click", () => {
    closeCart();
    $("#catalog").scrollIntoView({ behavior: "smooth" });
  });
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
  renderProducts();
  updateCart();
})();
