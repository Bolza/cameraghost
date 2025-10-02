const cameraVideo = document.getElementById("camera");
const overlayVideo = document.getElementById("overlay");

const overlaySource = {
  src: "./scary-video.mp4",
  type: "video/mp4",
};

let cameraStream = null;
let overlayReady = false;

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
        width: { ideal: 1920 },
        height: { ideal: 1080 },
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

function applyOverlaySource(video) {
  video.innerHTML = "";
  const source = document.createElement("source");
  source.src = overlaySource.src;
  source.type = overlaySource.type;
  video.appendChild(source);
}

async function initOverlay() {
  if (!overlayVideo) {
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

window.addEventListener("load", () => {
  void startCamera();
  void initOverlay();
});

overlayVideo === null || overlayVideo === void 0 ? void 0 : overlayVideo.addEventListener("play", () => {
  overlayReady = true;
  overlayVideo.style.pointerEvents = "none";
  overlayVideo.controls = false;
  overlayVideo.style.opacity = "0.5";
});

overlayVideo === null || overlayVideo === void 0 ? void 0 : overlayVideo.addEventListener("pause", () => {
  if (!overlayReady) {
    return;
  }
  overlayVideo.controls = true;
  overlayVideo.style.pointerEvents = "auto";
});

overlayVideo === null || overlayVideo === void 0 ? void 0 : overlayVideo.addEventListener("error", () => {
  console.error("Failed to load scary-video.mp4");
});

window.addEventListener("beforeunload", () => {
  releaseCamera();
});
