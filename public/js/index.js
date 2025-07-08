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
});

let usingFrontCamera = true;

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

      const preview = document.getElementById("previewContainer");
      preview.innerHTML = "";
      preview.appendChild(video);

      const botones = document.getElementById("botones-container");
      botones.querySelectorAll(".camara-extra").forEach((btn) => btn.remove());

      const captureButton = document.createElement("button");
      captureButton.innerText = "📷 Capturar";
      captureButton.classList.add("camara-extra");
      captureButton.style.marginTop = "10px";
      captureButton.onclick = function () {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        window.currentCanvas = canvas;
        window.currentCtx = ctx;

        const preview = document.getElementById("previewContainer");
        preview.innerHTML = "";
        preview.appendChild(canvas);

        stream.getTracks().forEach((track) => track.stop());
      };

      const switchButton = document.createElement("button");
      switchButton.innerText = "🔄 Cambiar Cámara";
      switchButton.classList.add("camara-extra");
      switchButton.style.marginTop = "10px";
      switchButton.onclick = function () {
        usingFrontCamera = !usingFrontCamera;
        iniciarCamara();
      };

      botones.appendChild(captureButton);
      botones.appendChild(switchButton);
    })
    .catch((err) => {
      alert("No se pudo acceder a la cámara: " + err);
    });
}

async function enviarImagen() {
  const resultContainer = document.getElementById("resultContainer");
  resultContainer.innerHTML = "";

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

    resultContainer.innerHTML = "<h3>Resultado:</h3>";

    data.resultado.forEach((item) => {
      if (item.residuo !== "no_clasificado") {
        const [x1, y1, x2, y2] = item.bbox;
        const color = colorMap[item.residuo] || "gray";

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.fillStyle = color;
        ctx.font = "16px Arial";
        ctx.fillText(`${item.etiqueta} (${item.residuo})`, x1 + 5, y1 - 5);
      }

      resultContainer.innerHTML += `
        <div>
          <strong>${item.etiqueta}</strong> → ${item.residuo.toUpperCase()}<br>
          <small>Ubicación: [${item.bbox.map((n) => n.toFixed(0)).join(", ")}]</small>
        </div><hr>`;
    });
  } catch (err) {
    alert(err.message);
  } finally {
    ocultarLoader();
  }
}

function mostrarLoader() {
  document.getElementById("loaderModal").style.display = "flex";
  document.getElementById("btnClasificar").disabled = true;
  document.getElementById("btnCamara").disabled = true;

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
  document.getElementById("btnClasificar").disabled = false;
  document.getElementById("btnCamara").disabled = false;

  clearInterval(loaderInterval);
}
