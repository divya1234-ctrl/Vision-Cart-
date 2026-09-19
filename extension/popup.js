/**
 * VisionCart Extension Popup Script
 */

document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("popup-dropzone");
  const fileInput = document.getElementById("popup-file-input");
  const serverInput = document.getElementById("server-url-input");
  const keyInput = document.getElementById("gemini-key-input");
  const saveServerBtn = document.getElementById("btn-save-server");
  const searchTabBtn = document.getElementById("btn-search-tab");
  const feedback = document.getElementById("settings-feedback");

  // Load saved settings
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(["visionCartServerUrl", "geminiApiKey"], (res) => {
      if (res.visionCartServerUrl) {
        serverInput.value = res.visionCartServerUrl;
      } else {
        serverInput.value = "https://ais-dev-mnvb6kxv24dde4idulhzlu-66361582803.asia-east1.run.app";
      }
      if (res.geminiApiKey) {
        keyInput.value = res.geminiApiKey;
      }
    });
  }

  saveServerBtn.addEventListener("click", () => {
    const serverVal = serverInput.value.trim();
    const keyVal = keyInput.value.trim();
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set(
        {
          visionCartServerUrl: serverVal,
          geminiApiKey: keyVal
        },
        () => {
          if (feedback) {
            feedback.style.display = "block";
            feedback.textContent = "✓ Settings saved! Active across all shopping tabs.";
            setTimeout(() => { feedback.style.display = "none"; }, 2500);
          }
          saveServerBtn.textContent = "Saved!";
          setTimeout(() => { saveServerBtn.textContent = "💾 Save Extension Settings"; }, 1500);
        }
      );
    }
  });

  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "#f59e0b";
  });

  dropzone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "#3f3f46";
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "#3f3f46";
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "SEARCH_IMAGE_URL",
            imageUrl: dataUrl
          });
          window.close();
        }
      });
    };
    reader.readAsDataURL(file);
  }

  searchTabBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Find largest image in active tab
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const imgs = Array.from(document.querySelectorAll("img")).filter(
              (i) => i.offsetWidth > 150 && i.offsetHeight > 150
            );
            if (imgs.length > 0) {
              imgs.sort((a, b) => (b.offsetWidth * b.offsetHeight) - (a.offsetWidth * a.offsetHeight));
              return imgs[0].src || imgs[0].currentSrc;
            }
            return null;
          }
        }, (results) => {
          if (results && results[0] && results[0].result) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "SEARCH_IMAGE_URL",
              imageUrl: results[0].result
            });
            window.close();
          } else {
            alert("No clear product image detected on this page. Try hovering over an image directly.");
          }
        });
      }
    });
  });
});
