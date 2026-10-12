/* ============================================================================
   ui.js — shared chrome + per-page rendering
   Depends on: products.js, store.js
   Branches on document.body.dataset.page: "home" | "catalog" | "product" | "cart"
   ========================================================================== */

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80&auto=format&fit=crop";

  const ICON = {
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>',
    tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
  };

  /* --------------------------------------------------------------------------
     THEME
     ------------------------------------------------------------------------ */
  const THEME_KEY = "reserve.theme";
  function initTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") {
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch (e) {}
  }
  function toggleTheme() {
    const cur =
      document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    syncThemeButton();
  }
  function syncThemeButton() {
    const btn = $("#theme-toggle");
    if (!btn) return;
    const isDark =
      (document.documentElement.getAttribute("data-theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark";
    btn.innerHTML = isDark ? ICON.sun : ICON.moon;
    btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }
  initTheme();

  /* --------------------------------------------------------------------------
     HEADER + FOOTER + DRAWER injection
     ------------------------------------------------------------------------ */
  const PAGE = document.body.dataset.page || "";
  const here = location.pathname.split("/").pop() || "index.html";

  function navLink(href, label) {
    const current = href === here ? ' aria-current="page"' : "";
    return `<a href="${href}"${current}>${label}</a>`;
  }

  function mountHeader() {
    const el = $("#site-header");
    if (!el) return;
    el.className = "site-header";
    el.innerHTML = `
      <div class="container site-header__bar">
        <button class="icon-btn nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">${ICON.menu}</button>
        <a class="brand" href="index.html">Ré<span>serve</span></a>
        <nav class="nav" id="primary-nav" aria-label="Primary">
          ${navLink("index.html", "Home")}
          ${navLink("men.html", "Men")}
          ${navLink("women.html", "Women")}
        </nav>
        <div class="header-actions">
          <button class="icon-btn" id="theme-toggle" aria-label="Toggle theme"></button>
          <button class="icon-btn cart-btn" id="open-cart" aria-label="Open cart">
            ${ICON.cart}
            <span class="cart-count" id="cart-count" aria-hidden="true">0</span>
          </button>
        </div>
      </div>`;

    const nav = $("#primary-nav");
    const toggle = $("#nav-toggle");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.innerHTML = open ? ICON.close : ICON.menu;
    });
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A" && nav.classList.contains("is-open")) toggle.click();
    });

    $("#theme-toggle").addEventListener("click", toggleTheme);
    syncThemeButton();
    $("#open-cart").addEventListener("click", openDrawer);
  }

  function mountFooter() {
    const el = $("#site-footer");
    if (!el) return;
    el.className = "site-footer";
    el.innerHTML = `
      <div class="container site-footer__grid">
        <div class="site-footer__brand">
          <a class="brand" href="index.html">Ré<span>serve</span></a>
          <p>Hand-picked vintage clothing, sourced across Europe and graded piece by piece. One of each — when it's gone, it's gone.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><a href="men.html">Men</a></li>
            <li><a href="women.html">Women</a></li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li><a href="#" data-noop>Sizing &amp; grading</a></li>
            <li><a href="#" data-noop>Shipping &amp; returns</a></li>
            <li><a href="#" data-noop>Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="container site-footer__bottom">
        <span>&copy; ${new Date().getFullYear()} Réserve Vintage. A student demo store — no real orders are placed.</span>
        <span>Est. 2026 · Skopje</span>
      </div>`;
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-noop]")) e.preventDefault();
    });
  }

  function mountDrawer() {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="drawer-overlay" id="drawer-overlay"></div>
      <aside class="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" aria-hidden="true">
        <div class="drawer__head">
          <h2>Your cart</h2>
          <button class="icon-btn" id="close-cart" aria-label="Close cart">${ICON.close}</button>
        </div>
        <div class="drawer__body" id="drawer-body"></div>
        <div class="drawer__foot" id="drawer-foot" hidden>
          <div class="drawer__subtotal"><span>Subtotal</span><strong id="drawer-subtotal">$0</strong></div>
          <p class="drawer__note">Shipping &amp; taxes calculated at checkout.</p>
          <a href="cart.html" class="btn btn--block">Checkout</a>
        </div>
      </aside>
      <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
    document.body.appendChild(wrap);

    $("#close-cart").addEventListener("click", closeDrawer);
    $("#drawer-overlay").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && $("#cart-drawer").classList.contains("is-open")) closeDrawer();
    });
  }

  let lastFocus = null;
  function openDrawer() {
    renderDrawer();
    lastFocus = document.activeElement;
    $("#drawer-overlay").classList.add("is-open");
    $("#cart-drawer").classList.add("is-open");
    $("#cart-drawer").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("#close-cart").focus();
  }
  function closeDrawer() {
    $("#drawer-overlay").classList.remove("is-open");
    $("#cart-drawer").classList.remove("is-open");
    $("#cart-drawer").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function renderDrawer() {
    const { lines, subtotal } = Store.getSummary();
    const body = $("#drawer-body");
    const foot = $("#drawer-foot");
    if (!lines.length) {
      body.innerHTML = `<div class="drawer__empty">
        <p>Your cart is empty.</p>
        <a href="men.html" class="btn btn--ghost btn--sm">Browse the archive</a>
      </div>`;
      foot.hidden = true;
      return;
    }
    body.innerHTML = lines.map(lineRow).join("");
    foot.hidden = false;
    $("#drawer-subtotal").textContent = money(subtotal);
    body.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const { id, size } = btn.dataset;
        const act = btn.dataset.act;
        const line = Store.getSummary().lines.find((l) => l.id === id && l.size === size);
        if (act === "inc") Store.setQty(id, size, (line ? line.qty : 1) + 1);
        if (act === "dec") Store.setQty(id, size, (line ? line.qty : 1) - 1);
        if (act === "rm") Store.remove(id, size);
        renderDrawer();
      });
    });
  }

  function lineRow(l) {
    return `<div class="line">
      <img class="line__img" src="${l.product.image}" alt="${escapeAttr(l.product.name)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      <div>
        <div class="line__name">${l.product.name}</div>
        <div class="line__meta">${l.product.category} · Size ${l.size}</div>
        <div class="line__qty">
          <button data-act="dec" data-id="${l.id}" data-size="${escapeAttr(l.size)}" aria-label="Decrease quantity">&minus;</button>
          <span>${l.qty}</span>
          <button data-act="inc" data-id="${l.id}" data-size="${escapeAttr(l.size)}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="line__right">
        <span class="line__price">${money(l.lineTotal)}</span>
        <button class="line__remove" data-act="rm" data-id="${l.id}" data-size="${escapeAttr(l.size)}">Remove</button>
      </div>
    </div>`;
  }

  /* --------------------------------------------------------------------------
     CART COUNT badge
     ------------------------------------------------------------------------ */
  function syncCartCount() {
    const el = $("#cart-count");
    if (!el) return;
    const { count } = Store.getSummary();
    el.textContent = count;
    el.classList.toggle("is-visible", count > 0);
  }
  window.addEventListener("cart:change", () => {
    syncCartCount();
    if ($("#cart-drawer") && $("#cart-drawer").classList.contains("is-open")) renderDrawer();
    if (PAGE === "cart") renderCartPage();
  });

  /* --------------------------------------------------------------------------
     TOAST
     ------------------------------------------------------------------------ */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2600);
  }

  /* --------------------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------------------ */
  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }
  function imgFallback(el) {
    el.setAttribute("onerror", `this.onerror=null;this.src='${FALLBACK_IMG}'`);
  }

  function cardHTML(p) {
    return `<article class="card reveal">
      <div class="card__media">
        <div class="card__badges">
          <span class="badge badge--era">${p.era}</span>
        </div>
        <img src="${p.image}" alt="${escapeAttr(p.name)}" loading="lazy"
             onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
        <div class="card__quickadd">
          <button class="btn btn--sm btn--block" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
      <div class="card__body">
        <h3 class="card__name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <span class="card__meta">${p.category} · ${p.condition}</span>
        <span class="card__price">${money(p.price)}</span>
      </div>
    </article>`;
  }

  function wireQuickAdds(ctx = document) {
    ctx.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const p = getProduct(btn.dataset.add);
        if (!p) return;
        Store.add(p.id, p.sizes[0], 1);
        toast(`Added · ${p.name}`);
        openDrawer();
      });
    });
  }

  /* Intersection reveal */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* --------------------------------------------------------------------------
     HOME
     ------------------------------------------------------------------------ */
  function initHome() {
    const mount = $("#featured-grid");
    if (mount) {
      mount.innerHTML = featuredProducts().map(cardHTML).join("");
      wireQuickAdds(mount);
    }
    const form = $("#newsletter-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("input");
        if (!input.value || !/.+@.+\..+/.test(input.value)) {
          $("#newsletter-done").textContent = "Please enter a valid email.";
          return;
        }
        $("#newsletter-done").textContent = "Thanks — you're on the list.";
        input.value = "";
      });
    }
  }

  /* --------------------------------------------------------------------------
     CATALOG (men.html / women.html)
     ------------------------------------------------------------------------ */
  function initCatalog() {
    const gender = document.body.dataset.gender; // "men" | "women"
    const grid = $("#catalog-grid");
    const countEl = $("#result-count");
    const sortSel = $("#sort-select");
    const base = productsByGender(gender);

    const params = new URLSearchParams(location.search);
    let sort = params.get("sort") || "featured";
    if (sortSel) sortSel.value = sort;

    function syncURL() {
      const q = new URLSearchParams();
      if (sort !== "featured") q.set("sort", sort);
      const qs = q.toString();
      try {
        history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
      } catch (e) {
        /* some browsers block replaceState on file:// — harmless to skip */
      }
    }

    function apply() {
      let list = base.slice();
      switch (sort) {
        case "price-asc": list.sort((a, b) => a.price - b.price); break;
        case "price-desc": list.sort((a, b) => b.price - a.price); break;
        case "era-new": list.sort((a, b) => b.eraRank - a.eraRank); break;
        default: /* featured — keep source order */ break;
      }
      countEl.textContent = `${list.length} ${list.length === 1 ? "piece" : "pieces"}`;

      if (!list.length) {
        grid.innerHTML = `<div class="empty-state">No pieces match that filter right now.</div>`;
      } else {
        grid.innerHTML = list.map(cardHTML).join("");
        wireQuickAdds(grid);
        initReveal();
      }
      syncURL();
    }

    if (sortSel) {
      sortSel.addEventListener("change", () => {
        sort = sortSel.value;
        apply();
      });
    }
    apply();
  }

  /* --------------------------------------------------------------------------
     PRODUCT DETAIL (product.html)
     ------------------------------------------------------------------------ */
  function initProduct() {
    const mount = $("#pdp");
    const id = new URLSearchParams(location.search).get("id");
    const p = id ? getProduct(id) : null;

    if (!p) {
      mount.innerHTML = `<div class="container empty-state">
        <h1>Piece not found</h1>
        <p>That item may have already sold. Everything here is one of one.</p>
        <p style="margin-top:1.5rem"><a class="btn btn--ghost btn--sm" href="men.html">Shop Men</a>
        <a class="btn btn--ghost btn--sm" href="women.html">Shop Women</a></p>
      </div>`;
      document.title = "Not found · Réserve";
      return;
    }

    document.title = `${p.name} · Réserve`;
    let chosenSize = "";
    let qty = 1;
    const genderHref = p.gender === "men" ? "men.html" : "women.html";
    const genderLabel = p.gender === "men" ? "Men" : "Women";

    mount.innerHTML = `
      <div class="container pdp__grid">
        <div class="pdp__gallery">
          <div class="pdp__main"><img id="pdp-main" src="${p.images[0]}" alt="${escapeAttr(p.name)}"
            onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"></div>
          <div class="pdp__thumbs" role="tablist" aria-label="Product images">
            ${p.images
              .map(
                (src, i) =>
                  `<button role="tab" aria-current="${i === 0}" data-src="${src}" aria-label="Image ${i + 1}">
                     <img src="${src}" alt="" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
                   </button>`
              )
              .join("")}
          </div>
        </div>
        <div class="pdp__info">
          <p class="breadcrumb"><a href="index.html">Home</a> / <a href="${genderHref}">${genderLabel}</a> / <span>${p.category}</span></p>
          <p class="eyebrow">${p.category} · ${p.era}</p>
          <h1>${p.name}</h1>
          <div class="pdp__price">${money(p.price)}</div>
          <div class="pdp__tags">
            <span class="badge">${p.category}</span>
            <span class="badge">${p.condition}</span>
            <span class="badge">${p.colors.join(" / ")}</span>
          </div>
          <p class="pdp__desc">${p.description}</p>

          <span class="field-label">Size</span>
          <div class="size-row" id="size-row">
            ${p.sizes.map((s) => `<button class="size-opt" data-size="${s}" aria-pressed="false">${s}</button>`).join("")}
          </div>
          <p class="size-hint" id="size-hint"></p>

          <span class="field-label">Quantity</span>
          <div class="qty">
            <button id="qty-dec" aria-label="Decrease quantity">&minus;</button>
            <span id="qty-val">1</span>
            <button id="qty-inc" aria-label="Increase quantity">+</button>
          </div>

          <button class="btn btn--block" id="add-to-cart">Add to cart</button>

          <ul class="pdp__meta-list">
            <li><span>Era</span><span>${p.era}</span></li>
            <li><span>Condition</span><span>${p.condition}</span></li>
            <li><span>Category</span><span>${p.category}</span></li>
            <li><span>Colours</span><span>${p.colors.join(", ")}</span></li>
            <li><span>Availability</span><span>One in stock</span></li>
          </ul>
        </div>
      </div>
      <div class="container section" style="padding-top:0">
        <div class="section__head"><h2>You may also like</h2></div>
        <div class="product-grid" id="related-grid"></div>
      </div>`;

    // gallery thumbs
    $$("#pdp .pdp__thumbs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        $("#pdp-main").src = btn.dataset.src;
        $$("#pdp .pdp__thumbs button").forEach((b) => b.setAttribute("aria-current", "false"));
        btn.setAttribute("aria-current", "true");
      });
    });

    // size
    $$("#size-row .size-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        chosenSize = btn.dataset.size;
        $$("#size-row .size-opt").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        $("#size-hint").textContent = "";
      });
    });

    // qty
    $("#qty-dec").addEventListener("click", () => {
      qty = Math.max(1, qty - 1);
      $("#qty-val").textContent = qty;
    });
    $("#qty-inc").addEventListener("click", () => {
      qty = Math.min(99, qty + 1);
      $("#qty-val").textContent = qty;
    });

    // add
    $("#add-to-cart").addEventListener("click", () => {
      if (!chosenSize) {
        $("#size-hint").textContent = "Please choose a size first.";
        $("#size-row").scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      Store.add(p.id, chosenSize, qty);
      toast(`Added · ${p.name} (${chosenSize})`);
      openDrawer();
    });

    // related — same category first, then fill with the rest of the section
    const related = productsByGender(p.gender)
      .filter((x) => x.id !== p.id && x.category === p.category)
      .concat(productsByGender(p.gender).filter((x) => x.id !== p.id && x.category !== p.category))
      .slice(0, 4);
    const rg = $("#related-grid");
    rg.innerHTML = related.map(cardHTML).join("");
    wireQuickAdds(rg);
  }

  /* --------------------------------------------------------------------------
     CART PAGE (cart.html)
     ------------------------------------------------------------------------ */
  function renderCartPage() {
    const mount = $("#cart-mount");
    if (!mount) return;
    const { lines, subtotal, count } = Store.getSummary();

    if (!lines.length && !mount.dataset.ordered) {
      mount.innerHTML = `<div class="container empty-state">
        <h1>Your cart is empty</h1>
        <p>Nothing reserved yet.</p>
        <p style="margin-top:1.5rem">
          <a class="btn btn--ghost btn--sm" href="men.html">Shop Men</a>
          <a class="btn btn--ghost btn--sm" href="women.html">Shop Women</a>
        </p>
      </div>`;
      return;
    }
    if (mount.dataset.ordered) return; // keep confirmation on screen

    const shipping = subtotal >= 150 ? 0 : 9;
    mount.innerHTML = `
      <div class="container cart-page">
        <h1 style="font-size:clamp(2rem,5vw,3rem);margin-bottom:2rem">Cart</h1>
        <div class="cart-layout">
          <div>
            <table class="cart-table">
              <thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th><th></th></tr></thead>
              <tbody>
                ${lines
                  .map(
                    (l) => `<tr>
                  <td>
                    <div class="cart-item">
                      <img src="${l.product.image}" alt="${escapeAttr(l.product.name)}"
                        onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
                      <div>
                        <h3><a href="product.html?id=${l.id}">${l.product.name}</a></h3>
                        <p>${l.product.category} · ${l.product.era} · Size ${l.size}</p>
                      </div>
                    </div>
                  </td>
                  <td class="cart-td-price">${money(l.product.price)}</td>
                  <td>
                    <div class="line__qty">
                      <button data-act="dec" data-id="${l.id}" data-size="${escapeAttr(l.size)}" aria-label="Decrease quantity">&minus;</button>
                      <span>${l.qty}</span>
                      <button data-act="inc" data-id="${l.id}" data-size="${escapeAttr(l.size)}" aria-label="Increase quantity">+</button>
                    </div>
                  </td>
                  <td class="cart-td-total">${money(l.lineTotal)}</td>
                  <td><button class="line__remove" data-act="rm" data-id="${l.id}" data-size="${escapeAttr(l.size)}">Remove</button></td>
                </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <aside class="summary">
            <h2>Order summary</h2>
            <div class="summary__row"><span>Subtotal (${count} ${count === 1 ? "item" : "items"})</span><span>${money(subtotal)}</span></div>
            <div class="summary__row"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
            <div class="summary__row summary__row--total"><span>Total</span><strong>${money(subtotal + shipping)}</strong></div>

            <form class="checkout-form" id="checkout-form" novalidate>
              <div>
                <label for="cf-name">Full name</label>
                <input id="cf-name" name="name" autocomplete="name" required>
                <div class="form-error" data-for="name"></div>
              </div>
              <div>
                <label for="cf-email">Email</label>
                <input id="cf-email" name="email" type="email" autocomplete="email" required>
                <div class="form-error" data-for="email"></div>
              </div>
              <div>
                <label for="cf-address">Shipping address</label>
                <input id="cf-address" name="address" autocomplete="street-address" required>
                <div class="form-error" data-for="address"></div>
              </div>
              <div class="row-2">
                <div>
                  <label for="cf-city">City</label>
                  <input id="cf-city" name="city" autocomplete="address-level2" required>
                  <div class="form-error" data-for="city"></div>
                </div>
                <div>
                  <label for="cf-zip">Postal code</label>
                  <input id="cf-zip" name="zip" autocomplete="postal-code" required>
                  <div class="form-error" data-for="zip"></div>
                </div>
              </div>
              <button type="submit" class="btn btn--block">Place order · ${money(subtotal + shipping)}</button>
              <p class="muted" style="font-size:.76rem;text-align:center;margin:0">Demo checkout — no card is charged and no data leaves your browser.</p>
            </form>
          </aside>
        </div>
      </div>`;

    mount.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const { id, size, act } = btn.dataset;
        const line = Store.getSummary().lines.find((l) => l.id === id && l.size === size);
        if (act === "inc") Store.setQty(id, size, (line ? line.qty : 1) + 1);
        if (act === "dec") Store.setQty(id, size, (line ? line.qty : 1) - 1);
        if (act === "rm") Store.remove(id, size);
      });
    });

    const form = $("#checkout-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      let ok = true;
      form.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
      const checks = {
        name: (v) => v.trim().length >= 2 || "Enter your name.",
        email: (v) => /.+@.+\..+/.test(v.trim()) || "Enter a valid email.",
        address: (v) => v.trim().length >= 4 || "Enter your address.",
        city: (v) => v.trim().length >= 2 || "Enter your city.",
        zip: (v) => v.trim().length >= 3 || "Enter a postal code."
      };
      Object.entries(checks).forEach(([field, fn]) => {
        const res = fn(String(data.get(field) || ""));
        if (res !== true) {
          ok = false;
          const box = form.querySelector(`.form-error[data-for="${field}"]`);
          if (box) box.textContent = res;
        }
      });
      if (!ok) {
        form.querySelector(".form-error:not(:empty)")?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }
      const orderNo = "RSV-" + Date.now().toString(36).toUpperCase().slice(-6);
      mount.dataset.ordered = "1";
      Store.clear();
      mount.innerHTML = `<div class="container order-confirm">
        <div class="tick">${ICON.tick}</div>
        <h1>Order placed</h1>
        <p class="order-no">Confirmation ${orderNo}</p>
        <p class="muted">Thank you, ${escapeAttr(String(data.get("name")).trim())}. This is a demo store, so no payment was taken and nothing will ship — but your cart has been cleared just like the real thing.</p>
        <p style="margin-top:2rem">
          <a class="btn" href="index.html">Back to home</a>
        </p>
      </div>`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* --------------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------------ */
  mountHeader();
  mountFooter();
  mountDrawer();
  syncCartCount();

  if (PAGE === "home") initHome();
  if (PAGE === "catalog") initCatalog();
  if (PAGE === "product") initProduct();
  if (PAGE === "cart") renderCartPage();

  initReveal();
})();
