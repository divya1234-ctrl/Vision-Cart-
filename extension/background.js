/**
 * VisionCart Chrome Extension - Background Service Worker (Manifest V3)
 */

const DEFAULT_SERVER_URL = "https://ais-dev-mnvb6kxv24dde4idulhzlu-66361582803.asia-east1.run.app";

chrome.runtime.onInstalled.addListener(() => {
  // Set default server URL if not already configured
  chrome.storage.sync.get(["visionCartServerUrl"], (res) => {
    if (!res.visionCartServerUrl) {
      chrome.storage.sync.set({ visionCartServerUrl: DEFAULT_SERVER_URL });
    }
  });

  // Create right-click context menu for any image on any shopping website
  chrome.contextMenus.create({
    id: "visioncart_search_image",
    title: "Find product with VisionCart",
    contexts: ["image"]
  });

  console.log("VisionCart extension installed successfully.");
});

// Context menu click listener
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "visioncart_search_image" && info.srcUrl && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: "SEARCH_IMAGE_URL",
      imageUrl: info.srcUrl,
      pageUrl: tab.url,
      pageTitle: tab.title
    }).catch((err) => {
      console.warn("Could not send message to tab, injecting script:", err);
      // Fallback: inject content script if page was loaded before extension
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      }).then(() => {
        chrome.tabs.sendMessage(tab.id, {
          action: "SEARCH_IMAGE_URL",
          imageUrl: info.srcUrl,
          pageUrl: tab.url,
          pageTitle: tab.title
        });
      });
    });
  }
});

// Keyboard shortcut listener (Alt+V)
if (chrome.commands) {
  chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "open_visioncart" && tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "TRIGGER_PAGE_SEARCH"
      }).catch(() => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        }).then(() => {
          chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_PAGE_SEARCH" });
        });
      });
    }
  });
}

// Background message router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 1. Open multiple store tabs seamlessly
  if (message.action === "OPEN_TABS" && Array.isArray(message.urls)) {
    message.urls.forEach((url) => {
      chrome.tabs.create({ url, active: false });
    });
    sendResponse({ success: true });
    return true;
  }

  // 2. Fetch image as Base64 with host_permissions (bypasses any e-commerce CORS / canvas taint)
  if (message.action === "FETCH_IMAGE_BASE64" && message.imageUrl) {
    fetch(message.imageUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          sendResponse({ success: true, base64: reader.result });
        };
        reader.onerror = () => sendResponse({ success: false, error: "FileReader failed" });
        reader.readAsDataURL(blob);
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // Keep channel open for async response
  }

  // 3. Perform Visual Search (tries configured Server URL first, falls back to direct Gemini API if key is saved)
  if (message.action === "PERFORM_SEARCH") {
    const { imageBase64, focusObjectName } = message;

    chrome.storage.sync.get(["visionCartServerUrl", "geminiApiKey"], async (storage) => {
      const serverUrl = storage.visionCartServerUrl || DEFAULT_SERVER_URL;
      const apiKey = storage.geminiApiKey;

      // Strategy A: Call Deployed VisionCart Backend (Server-side Gemini)
      try {
        const endpoint = `${serverUrl.replace(/\/$/, "")}/api/visual-search`;
        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageBase64, focusObjectName }),
        });

        if (resp.ok) {
          const data = await resp.json();
          sendResponse({ success: true, analysis: data.analysis, products: data.products || [] });
          return;
        }
      } catch (serverErr) {
        console.warn("Server search failed, checking if direct Gemini API Key is available:", serverErr);
      }

      // Strategy B: Direct Gemini 2.5 Flash API Call if user entered API key in popup
      if (apiKey) {
        try {
          const rawBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
          const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

          const geminiResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Analyze this shopping product image for an e-commerce price comparison extension (Meesho, Amazon, Flipkart, Myntra, Ajio). Output ONLY valid JSON:
{
  "category": "Fashion | Footwear | Electronics | Home | Accessories",
  "product_type": "Specific item name (e.g. Cotton Embroidered Anarkali Kurta, High-Top Canvas Sneakers)",
  "color": ["primary color", "secondary color"],
  "pattern": "floral, solid, printed, etc",
  "material": "cotton, silk, leather, etc",
  "style": "ethnic, casual, formal, streetwear",
  "gender": "women, men, unisex",
  "description": "Short concise summary",
  "detected_objects": [{"id": "obj_1", "name": "Kurta", "category": "Fashion"}]
}`
                      },
                      {
                        inline_data: {
                          mime_type: mimeType,
                          data: rawBase64
                        }
                      }
                    ]
                  }
                ],
                generationConfig: {
                  response_mime_type: "application/json",
                  temperature: 0.2
                }
              })
            }
          );

          if (geminiResp.ok) {
            const geminiData = await geminiResp.json();
            const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              sendResponse({ success: true, analysis: parsed, products: [] });
              return;
            }
          }
        } catch (directErr) {
          console.warn("Direct Gemini call failed:", directErr);
        }
      }

      // If both failed, notify caller to trigger smart on-page fallback
      sendResponse({ success: false, error: "Server unreachable and no direct API key configured" });
    });

    return true; // Keep channel open for async response
  }
});
