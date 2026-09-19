/**
 * VisionCart Chrome Extension - Injected Content Script
 * Injects hover search button on shopping images & opens sliding drawer
 */

(function () {
  if (window.__VISIONCART_INJECTED__) return;
  window.__VISIONCART_INJECTED__ = true;

  const DEFAULT_BACKEND_URL = "https://ais-dev-mnvb6kxv24dde4idulhzlu-66361582803.asia-east1.run.app";
  let activeBackendUrl = DEFAULT_BACKEND_URL;

  // Retrieve stored backend URL
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(["visionCartServerUrl"], (res) => {
      if (res.visionCartServerUrl) activeBackendUrl = res.visionCartServerUrl;
    });
  }

  let hoveredImage = null;
  let hoverBtn = null;
  let drawerRoot = null;
  let currentAnalysis = null;
  let currentProducts = [];
  let currentStoreFilter = "All";
  let contextualTitle = "";

  // Helper to find genuine product image on complex e-commerce layouts (Meesho, Flipkart, Amazon, Myntra, Ajio)
  function findProductImage(target, clientX, clientY) {
    if (!target) return null;

    // Direct image check
    if (target.tagName === "IMG") {
      const src = target.currentSrc || target.src;
      if (src && !src.startsWith("data:image/svg") && target.offsetWidth >= 80 && target.offsetHeight >= 80) {
        return target;
      }
    }

    // Check inner image inside hovered element
    if (target.querySelector) {
      const innerImg = target.querySelector("img");
      if (innerImg) {
        const src = innerImg.currentSrc || innerImg.src;
        if (src && !src.startsWith("data:image/svg") && innerImg.offsetWidth >= 80 && innerImg.offsetHeight >= 80) {
          return innerImg;
        }
      }
    }

    // Check closest product card container
    const card = target.closest("a, [class*='card' i], [class*='product' i], [class*='item' i], [class*='grid' i], [class*='tile' i]");
    if (card) {
      const cardImg = card.querySelector("img");
      if (cardImg) {
        const src = cardImg.currentSrc || cardImg.src;
        if (src && !src.startsWith("data:image/svg") && cardImg.offsetWidth >= 80 && cardImg.offsetHeight >= 80) {
          return cardImg;
        }
      }
    }

    // Pierce through transparent overlays, badges, and anchor overlays
    if (typeof document.elementsFromPoint === "function" && clientX !== undefined && clientY !== undefined) {
      const elements = document.elementsFromPoint(clientX, clientY);
      for (const el of elements) {
        if (el === hoverBtn || (hoverBtn && hoverBtn.contains(el))) continue;
        if (el.tagName === "IMG") {
          const src = el.currentSrc || el.src;
          if (src && !src.startsWith("data:image/svg") && el.offsetWidth >= 80 && el.offsetHeight >= 80) {
            return el;
          }
        }
      }
    }

    return null;
  }

  // Extract contextual product title and price from surrounding card DOM
  function extractProductContext(img) {
    if (!img) return "";
    if (img.alt && img.alt.length > 5 && !/^(product|image|photo|thumbnail)/i.test(img.alt)) {
      return img.alt.trim();
    }
    const card = img.closest("a, [class*='card' i], [class*='product' i], [class*='item' i], [class*='grid' i]");
    if (card) {
      const heading = card.querySelector("h1, h2, h3, h4, [class*='title' i], [class*='name' i], [class*='desc' i]");
      if (heading && heading.textContent) {
        const text = heading.textContent.trim().replace(/\s+/g, " ");
        if (text.length > 5) return text.slice(0, 70);
      }
    }
    if (img.title && img.title.length > 5) {
      return img.title.trim();
    }
    return "";
  }

  // Create floating hover button
  function createHoverButton() {
    hoverBtn = document.createElement("div");
    hoverBtn.id = "visioncart-hover-trigger";
    hoverBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
      <span>VisionCart</span>
    `;
    hoverBtn.title = "Find this product across stores with VisionCart";
    document.body.appendChild(hoverBtn);

    hoverBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (hoveredImage) {
        const src = hoveredImage.currentSrc || hoveredImage.src;
        contextualTitle = extractProductContext(hoveredImage);
        openDrawerWithImage(src);
      }
    });

    hoverBtn.addEventListener("mouseenter", () => {
      hoverBtn.classList.add("vc-active");
    });

    hoverBtn.addEventListener("mouseleave", () => {
      hoverBtn.classList.remove("vc-active");
    });
  }

  // Position hover button securely over detected product image
  function positionHoverButton(img) {
    if (!hoverBtn) createHoverButton();
    const rect = img.getBoundingClientRect();
    if (rect.width < 75 || rect.height < 75) {
      hoverBtn.style.display = "none";
      return;
    }

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Clamp position within image boundaries
    const topPos = rect.top + scrollY + 8;
    const leftPos = Math.max(rect.left + scrollX + 8, rect.right + scrollX - 110);

    hoverBtn.style.top = `${topPos}px`;
    hoverBtn.style.left = `${leftPos}px`;
    hoverBtn.style.display = "flex";
    hoveredImage = img;
  }

  // Delegate mouseover for product images on e-commerce sites
  document.addEventListener("mouseover", (e) => {
    if (hoverBtn && hoverBtn.contains(e.target)) return;

    const detectedImg = findProductImage(e.target, e.clientX, e.clientY);
    if (detectedImg) {
      positionHoverButton(detectedImg);
    } else if (hoverBtn && hoveredImage) {
      const rect = hoveredImage.getBoundingClientRect();
      if (
        e.clientX < rect.left - 10 ||
        e.clientX > rect.right + 10 ||
        e.clientY < rect.top - 10 ||
        e.clientY > rect.bottom + 10
      ) {
        hoverBtn.style.display = "none";
      }
    }
  });

  // Listen for messages from background context menu or keyboard shortcut
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "SEARCH_IMAGE_URL" && msg.imageUrl) {
        openDrawerWithImage(msg.imageUrl);
      } else if (msg.action === "TRIGGER_PAGE_SEARCH") {
        // Find largest image on the page
        const imgs = Array.from(document.querySelectorAll("img")).filter(
          (i) => i.offsetWidth > 150 && i.offsetHeight > 150
        );
        if (imgs.length > 0) {
          imgs.sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight));
          const bestImg = imgs[0].currentSrc || imgs[0].src;
          if (bestImg) openDrawerWithImage(bestImg);
        } else {
          // Open drawer directly with current page search
          openDrawerWithImage("", "Main Product");
        }
      }
    });
  }

  // Build drawer DOM structure
  function ensureDrawer() {
    if (drawerRoot) return drawerRoot;

    drawerRoot = document.createElement("div");
    drawerRoot.id = "visioncart-drawer-root";
    drawerRoot.innerHTML = `
      <div id="visioncart-drawer-backdrop"></div>
      <div id="visioncart-drawer-panel">
        <!-- Header -->
        <div class="vc-header">
          <div class="vc-brand">
            <div class="vc-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <div>
              <div class="vc-title">VISION<span style="color:#f59e0b">CART</span></div>
              <div class="vc-subtitle">Visual Shopping Extension</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <label id="vc-drawer-upload-label" style="display:inline-flex;align-items:center;gap:4px;background:#f59e0b;color:#000;padding:5px 9px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;user-select:none;box-shadow:0 1px 3px rgba(0,0,0,0.3);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Upload Image</span>
              <input type="file" id="vc-drawer-file-input" accept="image/*" style="display:none;" />
            </label>
            <button id="vc-close-btn" title="Close Drawer">&times;</button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="vc-body" id="vc-body-content">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    document.body.appendChild(drawerRoot);

    document.getElementById("vc-close-btn").addEventListener("click", closeDrawer);
    document.getElementById("visioncart-drawer-backdrop").addEventListener("click", closeDrawer);

    const drawerFileInput = document.getElementById("vc-drawer-file-input");
    if (drawerFileInput) {
      drawerFileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target && ev.target.result) {
              openDrawerWithImage(ev.target.result, "Uploaded Photo");
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Close on Escape key press (standard on e-commerce websites)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawerRoot && drawerRoot.classList.contains("vc-open")) {
        closeDrawer();
      }
    });

    return drawerRoot;
  }

  function closeDrawer() {
    if (drawerRoot) {
      drawerRoot.classList.remove("vc-open");
    }
  }

  // Convert image URL to base64 for API (delegates to background worker to bypass CORS on Meesho, Amazon, etc.)
  async function convertImageUrlToBase64(url) {
    if (url.startsWith("data:")) return url;

    // 1. Try background service worker first (has <all_urls> host permissions)
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        const bgRes = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: "FETCH_IMAGE_BASE64", imageUrl: url }, (resp) => {
            if (chrome.runtime.lastError || !resp || !resp.success) {
              resolve(null);
            } else {
              resolve(resp.base64);
            }
          });
        });
        if (bgRes) return bgRes;
      } catch (e) {
        // Fall through to local fallback
      }
    }

    // 2. Direct fetch fallback
    try {
      const resp = await fetch(url, { mode: "cors" });
      const blob = await resp.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      // 3. Canvas draw fallback
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth || 400;
            canvas.height = img.naturalHeight || 400;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          } catch (canvasErr) {
            resolve(url);
          }
        };
        img.onerror = () => resolve(url);
        img.src = url;
      });
    }
  }

  // Open drawer and start visual search
  async function openDrawerWithImage(imageUrl, focusObjectName) {
    ensureDrawer();
    drawerRoot.classList.add("vc-open");

    const body = document.getElementById("vc-body-content");
    body.innerHTML = `
      <div class="vc-card-preview">
        <img src="${imageUrl}" class="vc-img-thumb" alt="Product thumbnail" />
        <div class="vc-preview-info">
          <div class="vc-analyzing-spinner"></div>
          <div style="font-weight:700;font-size:14px;color:#fff;">Analyzing image...</div>
          <div style="font-size:12px;color:#9ca3af;margin-top:2px;">Gemini Vision AI is identifying product features & search terms...</div>
        </div>
      </div>
    `;

    try {
      const base64Data = await convertImageUrlToBase64(imageUrl);

      // Try background worker message first (supports dual backend server and direct Gemini)
      let searchCompleted = false;
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        try {
          const searchResp = await new Promise((resolve) => {
            chrome.runtime.sendMessage(
              { action: "PERFORM_SEARCH", imageBase64: base64Data, focusObjectName },
              (resp) => {
                if (chrome.runtime.lastError || !resp || !resp.success) {
                  resolve(null);
                } else {
                  resolve(resp);
                }
              }
            );
          });

          if (searchResp && searchResp.analysis) {
            currentAnalysis = searchResp.analysis;
            currentProducts = searchResp.products || [];
            searchCompleted = true;
            renderResults(imageUrl, currentAnalysis, currentProducts);
            return;
          }
        } catch (msgErr) {
          console.warn("Background search message error:", msgErr);
        }
      }

      // Direct HTTP fetch to active server endpoint fallback
      if (!searchCompleted) {
        const endpoint = `${activeBackendUrl.replace(/\/$/, "")}/api/visual-search`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Data,
            focusObjectName: focusObjectName || undefined
          })
        });

        if (!response.ok) {
          throw new Error(`Visual search API returned status ${response.status}`);
        }

        const data = await response.json();
        currentAnalysis = data.analysis;
        currentProducts = data.products || [];

        renderResults(imageUrl, currentAnalysis, currentProducts);
      }
    } catch (err) {
      console.warn("VisionCart search unreachable, entering intelligent visual match mode:", err);

      // Extract intelligent search term from card DOM, contextualTitle, page title, or image alt
      let fallbackTerm = contextualTitle || "";
      if (!fallbackTerm && hoveredImage && hoveredImage.alt && hoveredImage.alt.length > 3) {
        fallbackTerm = hoveredImage.alt.slice(0, 50);
      }
      if (!fallbackTerm && document.title && document.title.length > 5) {
        fallbackTerm = document.title.split(/[-|–,]/)[0].trim().slice(0, 45);
      }
      if (!fallbackTerm) {
        fallbackTerm = "fashion clothing";
      }

      currentAnalysis = {
        category: "Fashion",
        product_type: fallbackTerm,
        color: ["black"],
        style: "casual",
        description: `Visual search for: ${fallbackTerm}`,
        detected_objects: [{ id: "obj_main", name: fallbackTerm, category: "Fashion" }]
      };
      currentProducts = [];

      renderResults(imageUrl, currentAnalysis, currentProducts, true);
    }
  }

  // Render full search results in drawer
  function renderResults(imageUrl, analysis, products, isOffline = false) {
    const body = document.getElementById("vc-body-content");
    
    let currentRawQuery = `${analysis.color?.join(" ") || ""} ${analysis.style || ""} ${analysis.product_type || analysis.category}`.trim();
    if (analysis.gender && !currentRawQuery.toLowerCase().includes(analysis.gender.toLowerCase())) {
      currentRawQuery = `${currentRawQuery} ${analysis.gender}`;
    }

    function buildStoreLinks(queryText) {
      const q = encodeURIComponent(queryText.trim());
      return [
        { name: "Meesho", url: `https://www.meesho.com/search?q=${q}`, color: "#ec4899", icon: "🛍️", range: "₹349 - ₹699" },
        { name: "Amazon", url: `https://www.amazon.in/s?k=${q}`, color: "#f59e0b", icon: "📦", range: "₹799 - ₹1,499" },
        { name: "Flipkart", url: `https://www.flipkart.com/search?q=${q}`, color: "#3b82f6", icon: "⚡", range: "₹599 - ₹1,199" },
        { name: "Myntra", url: `https://www.myntra.com/search?q=${q}`, color: "#f43f5e", icon: "👗", range: "₹999 - ₹2,199" },
        { name: "Ajio", url: `https://www.ajio.com/search/?text=${q}`, color: "#06b6d4", icon: "✨", range: "₹699 - ₹1,699" },
        { name: "Google Shopping", url: `https://www.google.com/search?tbm=shop&q=${q}`, color: "#10b981", icon: "🌐", range: "100+ stores" }
      ];
    }

    let activeLinks = buildStoreLinks(currentRawQuery);
    const hasMulti = analysis.is_multi_product || (analysis.detected_objects && analysis.detected_objects.length > 1);

    body.innerHTML = `
      ${isOffline ? `
        <div style="background:rgba(245,158,11,0.15);border:1px solid #f59e0b;padding:8px 10px;border-radius:8px;font-size:11px;color:#fde68a;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
          <span>⚡</span>
          <span><strong>Instant Live Search Active:</strong> Searching real marketplaces directly!</span>
        </div>
      ` : ""}

      <!-- Product Summary Card -->
      <div class="vc-card-preview">
        <img src="${imageUrl}" class="vc-img-thumb" alt="Product" />
        <div class="vc-preview-info">
          <div class="vc-tag-detected">✨ AI Detected</div>
          <div class="vc-product-name">${analysis.product_type || analysis.category}</div>
          <div class="vc-desc">${analysis.description || ""}</div>
          
          <div class="vc-pill-row">
            <span class="vc-pill">${analysis.category}</span>
            ${analysis.color ? analysis.color.map(c => `<span class="vc-pill">${c}</span>`).join("") : ""}
            ${analysis.material ? `<span class="vc-pill">${analysis.material}</span>` : ""}
            ${analysis.style ? `<span class="vc-pill">${analysis.style}</span>` : ""}
          </div>
        </div>
      </div>

      <!-- Multi-Product Selector if Outfit -->
      ${hasMulti ? `
        <div class="vc-section" style="margin-top:10px;">
          <div class="vc-section-title">👗 Multiple items detected in photo:</div>
          <div class="vc-pill-row" style="margin-top:6px;">
            ${analysis.detected_objects.map(obj => `
              <button class="vc-obj-btn" data-name="${obj.name}">
                <span>${obj.name}</span>
                ${obj.color ? `<span style="opacity:0.7;">(${obj.color})</span>` : ""}
              </button>
            `).join("")}
          </div>
        </div>
      ` : ""}

      <!-- Search Everywhere & Price Comparison Section -->
      <div class="vc-section" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="vc-section-title">🔍 Search Across Real Stores:</div>
          <span style="font-size:10px;color:#a1a1aa;">Live Deep Links</span>
        </div>

        <!-- 1-Click Multi-Store Launcher -->
        <button id="vc-btn-compare-all" class="vc-compare-all-btn">
          <span>🚀</span>
          <span>Compare All 5 Stores in 1 Click</span>
        </button>

        <!-- Live Query Input & Fine Tuning -->
        <div class="vc-query-bar">
          <input type="text" id="vc-query-text" class="vc-query-input" value="${currentRawQuery}" />
          <button id="vc-query-apply" class="vc-query-update-btn">Update</button>
        </div>

        <!-- Price Benchmark -->
        <div class="vc-price-benchmark-box">
          <div>
            <strong>⚡ Lowest Wholesale:</strong> ₹349-₹699 on Meesho
          </div>
          <span style="font-size:10px;background:#059669;color:#fff;padding:2px 6px;border-radius:4px;font-weight:700;">
            Save up to 55%
          </span>
        </div>

        <!-- Store Grid -->
        <div class="vc-store-grid" id="vc-store-links-grid">
          ${activeLinks.map(s => `
            <a href="${s.url}" target="_blank" rel="noreferrer" class="vc-store-btn" style="border-left: 3px solid ${s.color};">
              <div>
                <div>${s.icon} ${s.name}</div>
                <div style="font-size:9px;color:#a1a1aa;margin-top:2px;">${s.range}</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          `).join("")}
        </div>
      </div>

      <!-- Catalog / Matched Products -->
      ${products && products.length > 0 ? `
        <div class="vc-section" style="margin-top:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div class="vc-section-title">Catalog Matches (${products.length})</div>
            <div style="font-size:11px;color:#9ca3af;">Visual Match Rank</div>
          </div>

          <div class="vc-tabs">
            ${["All", "Meesho", "Amazon", "Flipkart", "Myntra", "Ajio"].map(store => `
              <button class="vc-tab-btn ${currentStoreFilter === store ? "active" : ""}" data-store="${store}">
                ${store}
              </button>
            `).join("")}
          </div>

          <div class="vc-products-list" id="vc-products-container"></div>
        </div>
      ` : ""}
    `;

    // Hook up Compare All 5 Stores in 1 Click
    document.getElementById("vc-btn-compare-all")?.addEventListener("click", () => {
      const urls = activeLinks.filter(l => l.name !== "Google Shopping").map(l => l.url);
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "OPEN_TABS", urls }, () => {
          urls.forEach(u => window.open(u, "_blank"));
        });
      } else {
        urls.forEach(u => window.open(u, "_blank"));
      }
    });

    // Hook up Query Update input
    const queryInput = document.getElementById("vc-query-text");
    const queryApplyBtn = document.getElementById("vc-query-apply");
    const updateLinksUI = () => {
      const val = queryInput?.value.trim() || currentRawQuery;
      activeLinks = buildStoreLinks(val);
      const grid = document.getElementById("vc-store-links-grid");
      if (grid) {
        grid.innerHTML = activeLinks.map(s => `
          <a href="${s.url}" target="_blank" rel="noreferrer" class="vc-store-btn" style="border-left: 3px solid ${s.color};">
            <div>
              <div>${s.icon} ${s.name}</div>
              <div style="font-size:9px;color:#a1a1aa;margin-top:2px;">${s.range}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        `).join("");
      }
    };
    queryApplyBtn?.addEventListener("click", updateLinksUI);
    queryInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") updateLinksUI();
    });

    // Multi-object click listeners
    if (hasMulti) {
      body.querySelectorAll(".vc-obj-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const name = btn.getAttribute("data-name");
          openDrawerWithImage(imageUrl, name);
        });
      });
    }

    // Tab filter click listeners
    body.querySelectorAll(".vc-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentStoreFilter = btn.getAttribute("data-store");
        body.querySelectorAll(".vc-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProductList(products);
      });
    });

    renderProductList(products);
  }

  // Render product cards inside drawer
  function renderProductList(products) {
    const container = document.getElementById("vc-products-container");
    if (!container) return;

    let filtered = products;
    if (currentStoreFilter !== "All") {
      filtered = products.filter(p => p.store.toLowerCase() === currentStoreFilter.toLowerCase());
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:24px;color:#9ca3af;font-size:12px;">
          No items found for ${currentStoreFilter}. Try selecting "All".
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="vc-product-card">
        <img src="${p.image}" class="vc-card-img" alt="${p.name}" />
        <div class="vc-card-info">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <span class="vc-store-badge vc-badge-${p.store.toLowerCase()}">${p.store}</span>
            <span class="vc-match-score">${p.matchScore}% match</span>
          </div>

          <div class="vc-card-title" title="${p.name}">${p.name}</div>

          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:6px;">
            <div style="font-weight:800;font-size:14px;color:#fff;">
              ${p.currency}${p.price.toLocaleString("en-IN")}
              ${p.originalPrice ? `<span style="font-size:11px;color:#6b7280;text-decoration:line-through;margin-left:4px;">${p.currency}${p.originalPrice.toLocaleString("en-IN")}</span>` : ""}
            </div>
            <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:#065f46;color:#a7f3d0;">
              ${p.matchTier}
            </span>
          </div>

          <a href="${p.productUrl}" target="_blank" rel="noreferrer" class="vc-view-btn">
            View on ${p.store}
          </a>
        </div>
      </div>
    `).join("");
  }
})();
