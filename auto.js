const cameraVideo = document.getElementById("camera");
const overlayVideo = document.getElementById("overlay");

const overlaySource = {
  src: "./video_the_door.mp4",
  type: "video/mp4",
};

let cameraStream = null;
let overlayReady = false;
let overlayObjectUrl = null;
const isIOSWebKit =
  typeof navigator !== "undefined" &&
  /AppleWebKit\//.test(navigator.userAgent) &&
  /(iPad|iPhone|iPod)/.test(navigator.userAgent);

async function startCamera() {
  if (!cameraVideo || cameraStream) {
    return;
  }

  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: isIOSWebKit ? 1280 : 1920 },
        height: { ideal: isIOSWebKit ? 720 : 1080 },
      },
      audio: false,
    });

    cameraStream = stream;
    cameraVideo.srcObject = stream;
    await cameraVideo.play();
  } catch (error) {
    console.error("Could not access camera", error);
  }
}

function revokeOverlayObjectUrl() {
  if (!overlayObjectUrl) {
    return;
  }

  URL.revokeObjectURL(overlayObjectUrl);
  overlayObjectUrl = null;
}

async function preloadOverlaySource(video) {
  try {
    const response = await fetch(overlaySource.src, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    revokeOverlayObjectUrl();
    overlayObjectUrl = URL.createObjectURL(blob);
    video.src = overlayObjectUrl;
  } catch (error) {
    console.warn("Falling back to streaming overlay", error);
    video.innerHTML = "";
    const source = document.createElement("source");
    source.src = overlaySource.src;
    source.type = overlaySource.type;
    video.appendChild(source);
  }
}

async function initOverlay() {
  if (!overlayVideo) {
    return;
  }

  overlayVideo.loop = true;
  overlayVideo.muted = true;
  overlayVideo.playsInline = true;
  overlayVideo.preload = "auto";
  overlayVideo.style.opacity = "0.5";
  overlayVideo.style.pointerEvents = "none";

  await preloadOverlaySource(overlayVideo);
  overlayVideo.load();

  try {
    await overlayVideo.play();
    overlayReady = true;
  } catch (error) {
    console.warn("Autoplay blocked for overlay", error);
    overlayVideo.controls = true;
    overlayVideo.style.pointerEvents = "auto";
  }
}

function releaseCamera() {
  if (!cameraStream) {
    return;
  }

  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
}

function releaseOverlay() {
  revokeOverlayObjectUrl();
}

window.addEventListener("load", () => {
  void startCamera();
  void initOverlay();
});

overlayVideo === null || overlayVideo === void 0
  ? void 0
  : overlayVideo.addEventListener("play", () => {
      overlayReady = true;
      overlayVideo.style.pointerEvents = "none";
      overlayVideo.controls = false;
      overlayVideo.style.opacity = "0.5";
    });

overlayVideo === null || overlayVideo === void 0
  ? void 0
  : overlayVideo.addEventListener("pause", () => {
      if (!overlayReady) {
        return;
      }
      overlayVideo.controls = true;
      overlayVideo.style.pointerEvents = "auto";
    });

overlayVideo === null || overlayVideo === void 0
  ? void 0
  : overlayVideo.addEventListener("error", () => {
      console.error("Failed to load scary-video.mp4");
    });

window.addEventListener("beforeunload", () => {
  releaseCamera();
  releaseOverlay();
});
