// Time-aware greeting
(function () {
  const hour = new Date().getHours();
  let text = "Good morning";
  let emoji = "☀️"; // sun

  if (hour >= 12 && hour < 17) {
    text = "Good afternoon";
    emoji = "🌤️"; // sun behind small cloud
  } else if (hour >= 17 || hour < 5) {
    text = "Good evening";
    emoji = "🌙"; // crescent moon
  }

  document.getElementById("greeting-text").textContent = text;
  document.getElementById("greeting-emoji").textContent = emoji;
})();

const promptInput = document.getElementById("prompt");
const composerForm = document.getElementById("composer-form");

// ============================================================
// Suggestion chips fill the composer
// ============================================================
document.querySelectorAll(".chip[data-prompt]").forEach((chip) => {
  chip.addEventListener("click", () => {
    promptInput.value = chip.dataset.prompt;
    promptInput.focus();
    promptInput.setSelectionRange(promptInput.value.length, promptInput.value.length);
  });
});

// ============================================================
// Voice input — browser speech recognition
// ============================================================
const voiceBtn = document.getElementById("btn-voice");
const voiceLabel = document.getElementById("voice-label");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let listening = false;
let textBeforeDictation = "";

function stopDictation() {
  if (recognition) recognition.stop();
}

function resetVoiceUI() {
  listening = false;
  voiceBtn.classList.remove("tool-btn--recording");
  voiceLabel.textContent = "Voice";
}

voiceBtn.addEventListener("click", () => {
  if (!SpeechRecognition) {
    alert(
      "Voice input isn't supported in this browser.\n" +
      "Try Chrome, Edge, or Safari."
    );
    return;
  }

  if (listening) {
    stopDictation();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = document.documentElement.lang === "ar" ? "ar-IQ" : "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  textBeforeDictation = promptInput.value.trim();

  recognition.onstart = () => {
    listening = true;
    voiceBtn.classList.add("tool-btn--recording");
    voiceLabel.textContent = "Listening… tap to stop";
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (const result of event.results) {
      transcript += result[0].transcript;
    }
    promptInput.value = textBeforeDictation
      ? textBeforeDictation + " " + transcript.trim()
      : transcript.trim();
  };

  recognition.onerror = (event) => {
    resetVoiceUI();
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      alert("Microphone access was blocked. Allow it in your browser settings to use voice input.");
    }
  };

  recognition.onend = resetVoiceUI;

  recognition.start();
});

// ============================================================
// PDF attachments — real file picker + chips on the composer
// ============================================================
const pdfBtn = document.getElementById("btn-pdf");
const pdfInput = document.getElementById("pdf-input");
const attachmentsEl = document.getElementById("attachments");
const attachedFiles = [];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function renderAttachments() {
  attachmentsEl.innerHTML = "";
  attachmentsEl.hidden = attachedFiles.length === 0;

  attachedFiles.forEach((file, index) => {
    const chip = document.createElement("span");
    chip.className = "attachment";

    const name = document.createElement("span");
    name.className = "attachment__name";
    name.textContent = file.name;

    const size = document.createElement("span");
    size.className = "attachment__size";
    size.textContent = formatSize(file.size);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "attachment__remove";
    remove.setAttribute("aria-label", "Remove " + file.name);
    remove.textContent = "✕";
    remove.addEventListener("click", () => {
      attachedFiles.splice(index, 1);
      renderAttachments();
    });

    chip.append(name, size, remove);
    attachmentsEl.append(chip);
  });
}

pdfBtn.addEventListener("click", () => pdfInput.click());

pdfInput.addEventListener("change", () => {
  for (const file of pdfInput.files) {
    const isPdf =
      file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isDuplicate = attachedFiles.some(
      (f) => f.name === file.name && f.size === file.size
    );
    if (isPdf && !isDuplicate) attachedFiles.push(file);
  }
  pdfInput.value = "";
  renderAttachments();
});

// ============================================================
// Barcode scanning — camera + BarcodeDetector
// ============================================================
const scanBtn = document.getElementById("btn-scan");
const scannerEl = document.getElementById("scanner");
const scannerVideo = document.getElementById("scanner-video");
const scannerStatus = document.getElementById("scanner-status");
const scannerCancel = document.getElementById("scanner-cancel");

let scannerStream = null;
let scanTimer = null;

function closeScanner() {
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
  if (scannerStream) {
    scannerStream.getTracks().forEach((track) => track.stop());
    scannerStream = null;
  }
  scannerVideo.srcObject = null;
  scannerEl.hidden = true;
}

async function openScanner() {
  scannerEl.hidden = false;
  scannerStatus.textContent = "Starting camera…";

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    scannerStatus.textContent =
      "Camera access isn't available here. Note: it requires a secure (https) connection.";
    return;
  }

  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
  } catch (err) {
    scannerStatus.textContent =
      err && (err.name === "NotAllowedError" || err.name === "SecurityError")
        ? "Camera access was blocked. Allow it in your browser settings and try again."
        : "Couldn't start the camera on this device.";
    return;
  }

  scannerVideo.srcObject = scannerStream;
  await scannerVideo.play();

  if (!("BarcodeDetector" in window)) {
    scannerStatus.textContent =
      "Live barcode detection isn't supported in this browser yet — try Chrome or Edge (Android/desktop).";
    return;
  }

  const detector = new BarcodeDetector({
    formats: [
      "ean_13", "ean_8", "upc_a", "upc_e",
      "code_128", "code_39", "itf", "qr_code", "data_matrix",
    ],
  });

  scannerStatus.textContent = "Point the camera at a barcode…";

  scanTimer = setInterval(async () => {
    if (scannerVideo.readyState < 2) return;
    try {
      const barcodes = await detector.detect(scannerVideo);
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue;
        closeScanner();
        promptInput.value = "Find medicine with barcode " + code;
        promptInput.focus();
      }
    } catch (err) {
      // Detection can fail transiently on some frames; keep scanning.
    }
  }, 250);
}

scanBtn.addEventListener("click", openScanner);
scannerCancel.addEventListener("click", closeScanner);
scannerEl.addEventListener("click", (event) => {
  if (event.target === scannerEl) closeScanner();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !scannerEl.hidden) closeScanner();
});

// ============================================================
// Composer submit — placeholder until the backend exists
// ============================================================
composerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = promptInput.value.trim();
  if (!query && attachedFiles.length === 0) {
    promptInput.focus();
    return;
  }
  if (listening) stopDictation();

  let message = "Sela is coming soon!";
  if (query) message += "\n\nYou asked:\n" + query;
  if (attachedFiles.length > 0) {
    message +=
      "\n\nAttached: " + attachedFiles.map((f) => f.name).join(", ");
  }
  alert(message);
});

// Enter sends, Shift+Enter adds a newline
promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composerForm.requestSubmit();
  }
});
