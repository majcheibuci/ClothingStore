/* ============================================================================
   store.js — cart state + localStorage persistence
   State shape in storage:  [{ id, size, qty }]
   Product details are resolved from PRODUCTS (products.js) at read time.
   Emits a "cart:change" event on window whenever the cart mutates.
   ========================================================================== */

const CART_KEY = "reserve.cart.v1";

const Store = (() => {
  let items = load();

  function load() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((l) => l && typeof l.id === "string")
        .map((l) => ({ id: l.id, size: String(l.size || ""), qty: clampQty(l.qty) }));
    } catch (e) {
      return [];
    }
  }

  function persist() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
      /* private mode / quota — cart simply won't persist */
    }
    window.dispatchEvent(new CustomEvent("cart:change", { detail: getSummary() }));
  }

  function clampQty(n) {
    n = parseInt(n, 10);
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(n, 99);
  }

  function keyOf(id, size) {
    return id + "::" + size;
  }

  /* ---- public API ---- */

  function add(id, size, qty = 1) {
    const product = getProduct(id);
    if (!product) return;
    if (!size) size = (product.sizes && product.sizes[0]) || "One Size";
    qty = clampQty(qty);

    const existing = items.find((l) => keyOf(l.id, l.size) === keyOf(id, size));
    if (existing) {
      existing.qty = clampQty(existing.qty + qty);
    } else {
      items.push({ id, size, qty });
    }
    persist();
  }

  function setQty(id, size, qty) {
    const line = items.find((l) => keyOf(l.id, l.size) === keyOf(id, size));
    if (!line) return;
    line.qty = clampQty(qty);
    persist();
  }

  function remove(id, size) {
    items = items.filter((l) => keyOf(l.id, l.size) !== keyOf(id, size));
    persist();
  }

  function clear() {
    items = [];
    persist();
  }

  /* Returns lines joined with their product record + line totals. */
  function detailed() {
    return items
      .map((l) => {
        const product = getProduct(l.id);
        if (!product) return null;
        return {
          ...l,
          product,
          lineTotal: product.price * l.qty
        };
      })
      .filter(Boolean);
  }

  function getSummary() {
    const lines = detailed();
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    return { count, subtotal, lines };
  }

  return { add, setQty, remove, clear, detailed, getSummary };
})();

/* Shared currency helper. */
function money(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
