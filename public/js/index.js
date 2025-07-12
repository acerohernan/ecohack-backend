// Old file variables
let selectedFile = null;
let stream = null;
let loaderInterval = null;

const colorMap = {
  verde: "green",
  marrón: "brown",
  rojo: "red",
  negro: "black",
  no_clasificado: "gray",
};

let usingFrontCamera = true;
let buttonsAdded = false;
// Application State
let currentScreen = "home";
let detectionStep = "scanning";
let activeTab = "home";

// DOM Elements
const screens = document.querySelectorAll(".screen");
const navItems = document.querySelectorAll(".nav-item");
const bottomNav = document.getElementById("bottom-nav");
const appContainer = document.querySelector(".app-container");

// Camera elements
const cameraStates = document.querySelectorAll(".camera-state");
const detectionModal = document.getElementById("detection-modal");
const segregationModal = document.getElementById("segregation-modal");

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  initializeNavigation();
  showScreen("home");
});

// Navigation Functions
function initializeNavigation() {
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      const screen = this.getAttribute("data-screen");
      navigateToScreen(screen);
    });
  });
}

function navigateToScreen(screenName) {
  if (screenName === currentScreen) return;

  currentScreen = screenName;
  activeTab = screenName;

  showScreen(screenName);
  updateActiveTab(screenName);

  // Show/hide bottom navigation
  if (screenName === "camera") {
    appContainer.classList.add("camera-active");
  } else {
    appContainer.classList.remove("camera-active");
  }
}

function showScreen(screenName) {
  screens.forEach((screen) => {
    screen.classList.remove("active");
  });

  const targetScreen = document.getElementById(`${screenName}-screen`);
  if (targetScreen) {
    targetScreen.classList.add("active");
  }
}

function updateActiveTab(screenName) {
  navItems.forEach((item) => {
    item.classList.remove("active");
  });

  const activeNavItem = document.querySelector(`[data-screen="${screenName}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }
}

// Camera Navigation
function navigateToCamera() {
  navigateToScreen("camera");
  resetCameraState();
  iniciarCamara();
}

function navigateToHome() {
  navigateToScreen("home");
  resetCameraState();
  const scanningContent = document.querySelector(".scanning-content");
  scanningContent.style.display = "block";
  const previewContainer = document.getElementById("previewContainer");
  previewContainer.innerHTML = ""; // Clear previous preview
}

// Camera Detection Functions
function resetCameraState() {
  detectionStep = "scanning";

  // Hide all camera states
  cameraStates.forEach((state) => {
    state.classList.remove("active");
  });

  // Show scanning state
  document.getElementById("scanning-state").classList.add("active");

  // Hide modals
  detectionModal.classList.remove("active");
  segregationModal.classList.remove("active");
}

function confirmDetection() {
  detectionStep = "confirmed";

  // Hide detection modal
  detectionModal.classList.remove("active");

  // Hide identified state
  document.getElementById("identified-state").classList.remove("active");

  // Show confirmed state
  document.getElementById("confirmed-state").classList.add("active");

  // Show segregation modal
  setTimeout(() => {
    segregationModal.classList.add("active");
  }, 500);

  // Auto return to home after success
  setTimeout(() => {
    navigateToHome();
    updatePoints();
  }, 3000);
}

// Points and Progress Functions
function updatePoints() {
  // Simulate points update
  const currentPointsElement = document.querySelector(
    ".progress-text span:first-child"
  );
  const progressFill = document.querySelector(".progress-fill");
  const remainingPoints = document.querySelector(".remaining-points");

  if (currentPointsElement && progressFill && remainingPoints) {
    // Add 100 points
    const newPoints = 8412;
    const newPercentage = (newPoints / 10000) * 100;
    const newRemaining = 10000 - newPoints;

    // Update display with animation
    setTimeout(() => {
      currentPointsElement.textContent = `${newPoints.toLocaleString()} puntos alcanzados`;
      progressFill.style.width = `${newPercentage}%`;
      remainingPoints.textContent = newRemaining.toLocaleString();
    }, 500);
  }
}

// Utility Functions
function animateElement(element, animation) {
  element.style.animation = animation;
  element.addEventListener(
    "animationend",
    function () {
      element.style.animation = "";
    },
    { once: true }
  );
}

// Touch and Gesture Support
let touchStartY = 0;
let touchEndY = 0;

function handleSwipe() {
  const swipeThreshold = 50;
  const swipeDistance = touchStartY - touchEndY;

  // Swipe up to close modals
  if (swipeDistance > swipeThreshold) {
    if (detectionModal.classList.contains("active")) {
      detectionModal.classList.remove("active");
    }
    if (segregationModal.classList.contains("active")) {
      segregationModal.classList.remove("active");
    }
  }
}

// Keyboard Navigation
document.addEventListener("keydown", function (e) {
  switch (e.key) {
    case "Escape":
      if (currentScreen === "camera") {
        navigateToHome();
      }
      break;
    case "Enter":
      if (currentScreen === "camera" && detectionStep === "scanning") {
        startDetection();
      } else if (detectionModal.classList.contains("active")) {
        confirmDetection();
      }
      break;
    case "1":
      navigateToScreen("home");
      break;
    case "2":
      navigateToScreen("retos");
      break;
    case "3":
      navigateToScreen("ajustes");
      break;
    case "4":
      navigateToScreen("tiendas");
      break;
  }
});

// Performance Optimizations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized resize handler
const handleResize = debounce(function () {
  // Adjust layout for different screen sizes
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}, 250);

window.addEventListener("resize", handleResize);
handleResize(); // Call once on load

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll(".action-item, .motivational-card").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observer.observe(el);
});

// Service Worker Registration (for PWA capabilities)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/sw.js")
      .then(function (registration) {
        console.log("SW registered: ", registration);
      })
      .catch(function (registrationError) {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Export functions for global access
window.navigateToCamera = navigateToCamera;
window.navigateToHome = navigateToHome;
window.startDetection = startDetection;
window.confirmDetection = confirmDetection;

/* OLD FILE */
/* 
document.getElementById("fileInput").addEventListener("change", function (e) {
  selectedFile = e.target.files[0];

  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);
        const preview = document.getElementById("previewContainer");
        preview.innerHTML = "";
        preview.appendChild(canvas);

        window.currentCanvas = canvas;
        window.currentCtx = ctx;
      };
    };
    reader.readAsDataURL(selectedFile);
  }
}); */

function iniciarCamara() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  const constraints = {
    video: {
      facingMode: usingFrontCamera ? "user" : { exact: "environment" },
    },
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((mediaStream) => {
      stream = mediaStream;

      const video = document.createElement("video");
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = mediaStream;
      video.classList.add("video-preview");

      const preview = document.getElementById("previewContainer");
      preview.innerHTML = "";
      preview.appendChild(video);

      const botones = document.getElementById("camera-buttons");
      botones
        .querySelectorAll(".start-detection-btn")
        .forEach((btn) => btn.remove());

      const captureButton = document.createElement("button");
      captureButton.innerText = "Iniciar detección";
      captureButton.classList.add("start-detection-btn");
      captureButton.onclick = function () {
        const scanningContent = document.querySelector(".scanning-content");
        scanningContent.style.display = "none";

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.classList.add("capture-preview-canvas");
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        window.currentCanvas = canvas;
        window.currentCtx = ctx;

        const preview = document.getElementById("previewContainer");
        preview.innerHTML = "";
        preview.appendChild(canvas);

        stream.getTracks().forEach((track) => track.stop());

        // ahora lo enviamos al backend y ponemos el modal de carga
        enviarImagen();
      };
      botones.appendChild(captureButton);

      const switchButton = document.createElement("button");
      switchButton.innerText = "Cambiar Cámara";
      switchButton.classList.add("start-detection-btn");
      switchButton.style.marginTop = "10px";
      switchButton.onclick = function () {
        usingFrontCamera = !usingFrontCamera;
        iniciarCamara();
      };

      botones.appendChild(switchButton);
      buttonsAdded = true;
    })
    .catch((err) => {
      alert("No se pudo acceder a la cámara: " + err);
    });
}

async function enviarImagen() {
  if (!window.currentCanvas) {
    alert("Primero selecciona o captura una imagen");
    return;
  }

  mostrarLoader();

  const blob = await new Promise((resolve) =>
    window.currentCanvas.toBlob(resolve, "image/jpeg")
  );

  const formData = new FormData();
  formData.append("file", blob, "captura.jpg");

  try {
    const response = await fetch("/clasificar/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Error al clasificar la imagen");

    const data = await response.json();
    const ctx = window.currentCtx;
    const preview = document.getElementById("previewContainer");
    preview.innerHTML = "";
    preview.appendChild(window.currentCanvas);

    // resultContainer.innerHTML = "<h3>Resultado:</h3>";

    data.resultado.forEach((item) => {
      if (item.residuo === "verde") {
      const [x1, y1, x2, y2] = item.bbox;
      const color = colorMap[item.residuo] || "gray";

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      ctx.fillStyle = color;
      ctx.font = "16px Arial";
      ctx.fillText(`${item.etiqueta} (${item.residuo})`, x1 + 5, y1 - 5);
      }

      segregationModal.classList.add("active");
    });
  } catch (err) {
    alert(err.message);
  } finally {
    ocultarLoader();
  }
}

function mostrarLoader() {
  document.getElementById("loaderModal").style.display = "flex";

  let segundos = 0;
  const contador = document.getElementById("loaderCounter");
  contador.innerText = segundos;
  loaderInterval = setInterval(() => {
    segundos += 1;
    contador.innerText = segundos;
  }, 1000);
}

function ocultarLoader() {
  document.getElementById("loaderModal").style.display = "none";

  clearInterval(loaderInterval);
}
