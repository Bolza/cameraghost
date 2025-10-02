const cameraVideo = document.getElementById("camera");
const overlayVideo = document.getElementById("overlay");
const statusElement = document.getElementById("status");

const overlaySource = {
  src: "./scary-video.mp4",
  type: "video/mp4",
};

let cameraStream = null;
let overlayReady = false;

function setStatus(message, isError = false) {
  if (!statusElement) {
    return;
  }

  statusElement.textContent = message;
  statusElement.classList.toggle("status--error", isError);
}

async function startCamera() {
  if (!cameraVideo) {
    setStatus("Camera element not found", true);
    return;
  }

  if (cameraStream) {
    return;
  }

  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    setStatus("Camera access is not supported in this browser", true);
    return;
  }

  try {
    setStatus("Starting camera…");
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

    if (overlayReady) {
      setStatus("Camera running with overlay.");
    } else {
      setStatus("Camera running. Waiting for overlay…");
    }
  } catch (error) {
    console.error("Could not access camera", error);
    setStatus("Camera permission denied or unavailable.", true);
  }
}

function applyOverlaySource(video) {
  video.innerHTML = "";
  const source = document.createElement("source");
  source.src = overlaySource.src;
  source.type = overlaySource.type;
  video.appendChild(source);
}

async function initOverlay() {
  if (!overlayVideo) {
    setStatus("Overlay element not found", true);
    return;
  }

  overlayVideo.loop = true;
  overlayVideo.muted = true;
  overlayVideo.playsInline = true;
  overlayVideo.style.opacity = "0.5";
  overlayVideo.style.pointerEvents = "none";

  applyOverlaySource(overlayVideo);
  overlayVideo.load();

  try {
    await overlayVideo.play();
    overlayReady = true;
    if (cameraStream) {
      setStatus("Camera running with overlay.");
    }
  } catch (error) {
    console.warn("Autoplay blocked for overlay", error);
    overlayVideo.controls = true;
    overlayVideo.style.pointerEvents = "auto";
    setStatus("Tap the overlay video to play it.");
  }
}

function releaseCamera() {
  if (!cameraStream) {
    return;
  }

  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
}

window.addEventListener("load", () => {
  void startCamera();
  void initOverlay();
});

overlayVideo === null || overlayVideo === void 0 ? void 0 : overlayVideo.addEventListener("play", () => {
  overlayReady = true;
  overlayVideo.style.pointerEvents = "none";
  overlayVideo.controls = false;
  overlayVideo.style.opacity = "0.5";
  if (cameraStream) {
    setStatus("Camera running with overlay.");
  }
});

overlayVideo === null || overlayVideo === void 0 ? void 0 : overlayVideo.addEventListener("pause", () => {
  if (!overlayVideo.controls) {
    overlayVideo.controls = true;
  }
  overlayVideo.style.pointerEvents = "auto";
  setStatus("Overlay paused. Tap to resume.");
});

overlayVideo === null || overlayVideo === void 0 ? void 0 : overlayVideo.addEventListener("error", () => {
  setStatus("Failed to load the overlay video. Ensure scary-video.mp4 is accessible.", true);
});

window.addEventListener("beforeunload", () => {
  releaseCamera();
});
