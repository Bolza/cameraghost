const cameraVideo = document.getElementById("camera");
const overlayVideo = document.getElementById("overlay");
const startCameraButton = document.getElementById("start-camera");
const overlayFileInput = document.getElementById("overlay-file");
const overlayUrlInput = document.getElementById("overlay-url");
const overlayOpacityInput = document.getElementById("overlay-opacity");
const loadUrlButton = document.getElementById("load-url");
const statusElement = document.getElementById("status");

let cameraStream = null;
let overlayObjectUrl = null;

function setStatus(message, isError = false) {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.classList.toggle("status--error", isError);
}

async function startCamera() {
  if (!cameraVideo || !startCameraButton) {
    setStatus("Missing video elements on the page", true);
    return;
  }

  if (cameraStream) {
    setStatus("Camera already running");
    return;
  }

  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    setStatus("Camera access is not supported in this browser", true);
    return;
  }

  try {
    setStatus("Requesting camera access…");
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
      audio: false,
    });

    cameraVideo.srcObject = cameraStream;
    await cameraVideo.play();

    startCameraButton.disabled = true;
    startCameraButton.textContent = "Camera Running";
    setStatus("Camera started. Load an overlay to see the effect.");
  } catch (error) {
    console.error("Failed to start camera", error);
    setStatus("Could not access the camera. Check permissions and try again.", true);
  }
}

function cleanupOverlayObjectUrl() {
  if (overlayObjectUrl) {
    URL.revokeObjectURL(overlayObjectUrl);
    overlayObjectUrl = null;
  }
}

async function applyOverlaySource(src, label) {
  if (!overlayVideo) {
    setStatus("Overlay video element is missing", true);
    return;
  }

  cleanupOverlayObjectUrl();

  overlayVideo.src = src;
  overlayVideo.loop = true;
  overlayVideo.muted = true;
  overlayVideo.playsInline = true;
  overlayVideo.currentTime = 0;

  try {
    await overlayVideo.play();
    setStatus(`Overlay loaded from ${label}.`);
  } catch (error) {
    console.error("Failed to play overlay video", error);
    setStatus("Overlay is loaded but autoplay is blocked. Press play on the overlay controls.");
  }
}

function handleOverlayFileSelection(event) {
  const input = event.currentTarget;
  const file = input && input.files ? input.files[0] : undefined;

  if (!file) {
    return;
  }

  if (!file.type.startsWith("video/")) {
    setStatus("Please choose a video file for the overlay.", true);
    return;
  }

  overlayObjectUrl = URL.createObjectURL(file);
  void applyOverlaySource(overlayObjectUrl, `file "${file.name}"`);
}

function handleOverlayUrl() {
  if (!overlayUrlInput) {
    return;
  }

  const url = overlayUrlInput.value.trim();
  if (!url) {
    setStatus("Enter a URL before loading the overlay.", true);
    return;
  }

  try {
    const validatedUrl = new URL(url);
    void applyOverlaySource(validatedUrl.toString(), "URL");
  } catch (error) {
    console.error("Invalid overlay URL", error);
    setStatus("That does not look like a valid URL.", true);
  }
}

function handleOpacityChange(event) {
  if (!overlayVideo) {
    return;
  }

  const input = event.currentTarget;
  const value = Number.parseFloat(input.value);

  if (Number.isNaN(value)) {
    return;
  }

  overlayVideo.style.opacity = value.toString();
}

function releaseCamera() {
  if (!cameraStream) {
    return;
  }

  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
}

if (startCameraButton) {
  startCameraButton.addEventListener("click", () => {
    void startCamera();
  });
}

if (overlayFileInput) {
  overlayFileInput.addEventListener("change", handleOverlayFileSelection);
}

if (loadUrlButton) {
  loadUrlButton.addEventListener("click", handleOverlayUrl);
}

if (overlayUrlInput) {
  overlayUrlInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleOverlayUrl();
    }
  });
}

if (overlayOpacityInput) {
  overlayOpacityInput.addEventListener("input", handleOpacityChange);
}

if (overlayVideo) {
  overlayVideo.addEventListener("error", () => {
    setStatus("Failed to load the overlay video. Check the file or URL and try again.", true);
  });
}

window.addEventListener("beforeunload", () => {
  releaseCamera();
  cleanupOverlayObjectUrl();
});

setStatus("Click \"Start Camera\" to begin.");
