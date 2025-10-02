const cameraVideo = document.getElementById("camera");
const overlayVideo = document.getElementById("overlay");
const statusElement = document.getElementById("status");

const overlaySources = [
  {
    src: "https://storage.googleapis.com/chromium-videos/alpha/alpha.webm",
    type: "video/webm",
  },
  {
    src: "https://storage.googleapis.com/chromium-videos/alpha/alpha.mp4",
    type: "video/mp4",
  },
];

let cameraStream = null;

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
    setStatus("Camera running with overlay.");
  } catch (error) {
    console.error("Could not access camera", error);
    setStatus("Camera permission denied or unavailable.", true);
  }
}

function attachOverlaySources(video) {
  video.innerHTML = "";
  overlaySources.forEach(({ src, type }) => {
    const source = document.createElement("source");
    source.src = src;
    source.type = type;
    video.appendChild(source);
  });
}

async function initOverlay() {
  if (!overlayVideo) {
    setStatus("Overlay element not found", true);
    return;
  }

  attachOverlaySources(overlayVideo);
  overlayVideo.loop = true;
  overlayVideo.muted = true;
  overlayVideo.playsInline = true;
  overlayVideo.style.opacity = "1";

  try {
    await overlayVideo.play();
  } catch (error) {
    console.warn("Autoplay blocked for overlay", error);
    setStatus("Tap the overlay video to play it if it is paused.");
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

overlayVideo === null || overlayVideo === void 0 ? void 0 : overlayVideo.addEventListener("error", () => {
  setStatus("Failed to load the overlay video. Replace the source with your own.", true);
});

window.addEventListener("beforeunload", () => {
  releaseCamera();
});
