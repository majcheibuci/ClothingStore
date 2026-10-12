# Réserve — Vintage Clothing Store

A small static e-commerce site for vintage clothing.
Plain HTML + CSS + vanilla JavaScript — **no build step, no dependencies**.

## Run it

Just open **`index.html`** in a browser. That's it.

For the cleanest experience (so `?id=` links and `localStorage` behave exactly
like a real host), serve the folder over HTTP instead of `file://`:

```bash
# any one of these, from the project folder:
python -m http.server 8000
# or
npx serve .
```

Then visit <http://localhost:8000>.

## Pages

| File           | What it is                                                          |
|----------------|-------------------------------------------------------------------- |
| `index.html`   | Home — hero, featured pieces, store story, Men/Women split, newsletter |
| `men.html`     | Men catalog — 20 pieces, sortable by price or era |
| `women.html`   | Women catalog — 20 pieces, sortable by price or era |
| `product.html` | Product detail — reads `?id=` from the URL (e.g. `product.html?id=m-16`) |
| `cart.html`    | Full cart + demo checkout (form validates, then shows an order confirmation) |

The cart also opens as a slide-in drawer from any page.

## How it's wired

```
js/products.js   All 40 products — the single source of truth.
js/store.js      Cart state, saved to localStorage, emits a "cart:change" event.
js/ui.js         Injects the shared header/footer/cart-drawer, renders every page.
css/styles.css   One stylesheet. Light + dark theme via CSS custom properties.
```

- **Cart** persists in `localStorage` under `reserve.cart.v1`.
- **Theme** (light/dark) follows the OS by default; the header toggle overrides it
  and is remembered under `reserve.theme`.
- **Checkout is a demo** — nothing is sent anywhere and no payment is taken.
  On submit it clears the cart and shows a fake confirmation number.

## Editing the catalog

Open `js/products.js`. Each product is one object in `RAW_PRODUCTS`:

```js
{
  id: "m-01",                  // unique; prefix m-/w- + number
  name: "Indigo Denim Trucker Jacket",
  gender: "men",                // "men" | "women"
  category: "Denim Jacket",
  era: "1990s",                 // 1970s | 1980s | 1990s | Y2K | 2000s
  price: 88,                    // whole USD
  condition: "Excellent",       // Excellent | Very Good | Well-loved
  colors: ["Indigo", "Tan"],
  sizes: ["S", "M", "L", "XL"],
  img: "1611312449408-fcece27cdbb7",   // Unsplash photo id (main image)
  alt: "1551232864-3f0890e580d9",      // Unsplash photo id (2nd gallery image)
  description: "Two or three sentences."
}
```

There's no brand field or brand filter — every name, category and colour is
written to match what's actually in its photo, so keep them in sync if you
swap an image.

- **Change a price:** edit `price`.
- **Swap an image:** replace `img` / `alt` with another Unsplash photo id
  (the part after `photo-` in an `images.unsplash.com` URL), or point them at
  your own hosted image URL by editing the `UNSPLASH()` helper / `image` field.
- **Change what's on the home page:** edit the `FEATURED_IDS` array.

If an image URL ever fails, the page automatically falls back to a placeholder
photo, so the grid never shows a broken image.

## Deploy

It's fully static — drop the folder on Netlify, GitHub Pages, Vercel, Cloudflare
Pages, or any web host. No configuration needed.
