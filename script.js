document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const merchantFilter = document.getElementById("merchantFilter");
  const clearButton = document.getElementById("clearFilters");
  const resultsCount = document.getElementById("resultsCount");
  const emptyState = document.getElementById("emptyState");
  const categoryTiles = document.getElementById("categoryTiles");

  const safeText = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));

  function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const merchant = merchantFilter.value;

    const filtered = products.filter(product => {
      const searchable = `${product.name} ${product.description} ${product.category} ${product.merchant}`.toLowerCase();
      return searchable.includes(query)
        && (category === "All" || product.category === category)
        && (merchant === "All" || product.merchant === merchant);
    });

    resultsCount.textContent = `SHOWING ${filtered.length} OF ${products.length} PRODUCTS`;
    emptyState.hidden = filtered.length !== 0;
    grid.innerHTML = filtered.map(product => {
      const url = safeUrl(product.affiliateUrl);
      const image = safeUrl(product.image);
      return `
        <article class="product-card">
          <div class="product-image">
            ${image ? `<img src="${image}" alt="${safeText(product.name)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.hidden=false">` : ""}
            <span class="image-fallback" ${image ? "hidden" : ""}>LF</span>
            <span class="product-tag">${safeText(product.category)}</span>
          </div>
          <div class="product-info">
            <div class="product-category">${safeText(product.category)}</div>
            <h3>${safeText(product.name)}</h3>
            <p class="product-description">${safeText(product.description)}</p>
            <div class="product-meta"><span class="product-price">${safeText(product.price || "View price")}</span><span class="merchant">${safeText(product.merchant)}</span></div>
            <a class="product-button" href="${url || "#"}" target="_blank" rel="sponsored nofollow noopener noreferrer" ${url ? "" : 'aria-disabled="true"'}>View at store <span>↗</span></a>
          </div>
        </article>`;
    }).join("");
  }

  function safeUrl(value) {
    try {
      const parsed = new URL(value, window.location.href);
      return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "";
    } catch { return ""; }
  }

  [searchInput, categoryFilter, merchantFilter].forEach(control => {
    control.addEventListener(control.tagName === "INPUT" ? "input" : "change", renderProducts);
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "All";
    merchantFilter.value = "All";
    document.querySelectorAll(".category-tile").forEach(tile => tile.classList.remove("selected"));
    renderProducts();
  });

  categoryTiles?.addEventListener("click", event => {
    const tile = event.target.closest("[data-category]");
    if (!tile) return;
    categoryFilter.value = tile.dataset.category;
    document.querySelectorAll(".category-tile").forEach(item => item.classList.toggle("selected", item === tile));
    renderProducts();
    document.getElementById("shop").scrollIntoView({behavior:"smooth"});
  });

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  menuToggle?.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  mainNav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  renderProducts();
});
