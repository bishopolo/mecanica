// @ts-nocheck
const BTN = document.getElementById("btn");
const MODAL = document.getElementById("formModal");
const BTNPREVIEW = document.querySelectorAll(".btnPreview");
const INPUTFILE = document.querySelectorAll(".inputFile");
const imagenesTemporales = [];
const message = document.getElementById("message");

let experimentos = [];

const VIEWER = document.querySelector(".viewer");
const IMG_VIEW = document.querySelector(".imgView");

BTN.addEventListener("click", () => {
  MODAL.showModal();
});

MODAL.addEventListener("click", (e) => {
  // console.log(e.target);
  if (e.target.matches(".btnCancel")) {
    let userDecision = confirm("¿Desea cancelar la creación?");
    if (userDecision) {
      resetDialog();
    }
    MODAL.close();
  }
});

BTNPREVIEW.forEach((btn) => {
  btn.classList.add("hidden");
});

INPUTFILE.forEach((input, index) => {
  input.addEventListener("change", (e) => {
    const archivo = e.target.files[0];

    if (archivo) {
      const url = URL.createObjectURL(archivo);

      imagenesTemporales[index] = {
        url: url,
        file: archivo,
        nombre: archivo.name,
      };

      // console.table(imagenesTemporales);
      const preview = document.querySelector(`#img${index + 1}`);
      const figure = document.querySelector(`#figure${index + 1}`);
      if (preview) {
        figure.style.display = "block";
        preview.src = url;
        BTNPREVIEW[index].classList.remove("hidden");
      }
    }
  });
});

function limpiarImagen(index) {
  if (imagenesTemporales[index]) {
    URL.revokeObjectURL(imagenesTemporales[index].url);
    imagenesTemporales[index] = null;
  }
}

BTNPREVIEW.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let userDecision = confirm("¿Desea eliminar la imagen seleccionada?");
    if (userDecision) {
      cleanData(e, btn);
    }
  });
});

function cleanData(event, element, option = null) {
  const index = Array.from(BTNPREVIEW).indexOf(event.currentTarget);
  const preview = document.querySelector(`#img${index + 1}`);
  const figure = document.querySelector(`#figure${index + 1}`);

  limpiarImagen(index);

  const cleanInputFile = Array.from(INPUTFILE)[index];
  if (cleanInputFile) {
    cleanInputFile.value = "";
  }

  if (preview) {
    preview.src = "";
    figure.style.display = "none";
    element.classList.add("hidden");
  }
}

function resetDialog() {
  INPUTFILE.forEach((input, index) => {
    limpiarImagen(index);
    input.value = "";

    const preview = document.querySelector(`#img${index + 1}`);
    const figure = document.querySelector(`#figure${index + 1}`);
    const btnPreview = BTNPREVIEW[index];

    if (preview) preview.src = "";
    if (figure) figure.style.display = "none";
    if (btnPreview) btnPreview.classList.add("hidden");
  });

  document.getElementById("titleExperiment").value = "";
  document.getElementById("descriptionExperiment").value = "";
  imagenesTemporales.length = 0;
}

MODAL.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titleExperiment").value.trim();
  const descripcion = document
    .getElementById("descriptionExperiment")
    .value.trim();

  if (!titulo) {
    alert("Por favor ingresa un título para el experimento");
    return;
  }

  if (imagenesTemporales.length === 0) {
    alert("Por favor selecciona al menos una imagen para el experimento");
    return;
  }

  try {
    const imagenesBase64 = await convertirImagenesABase64();

    const nuevoExperimento = {
      id: Date.now(),
      titulo: titulo,
      descripcion: descripcion,
      imagenes: imagenesBase64,
      fechaCreacion: new Date().toLocaleString(),
    };

    experimentos.push(nuevoExperimento);

    console.table(experimentos);

    resetDialog();
    MODAL.close();

    mostrarExperimentos();
    console.table(experimentos);
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    alert("Error al guardar el experimento. Inténtalo de nuevo.");
  }
});

async function convertirImagenesABase64() {
  const imagenes = [];

  for (let i = 0; i < imagenesTemporales.length; i++) {
    const imagen = imagenesTemporales[i];

    if (imagen && imagen.file) {
      try {
        const base64 = await convertirArchivoABase64(imagen.file);
        imagenes.push({
          nombre: imagen.nombre,
          base64: base64,
          indice: i,
        });
      } catch (error) {
        console.error(`Error convirtiendo imagen ${i}:`, error);
      }
    }
  }

  return imagenes;
}

function convertirArchivoABase64(archivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = (e) => {
      reject(e);
    };

    reader.readAsDataURL(archivo);
  });
}

function mostrarExperimentos() {
  const wrapperExperiments = document.getElementById("wrapperExperiments");

  if (!wrapperExperiments) {
    console.error("No se encontró el elemento #wrapperExperiments");
    return;
  }

  if (experimentos.length === 0) {
    message.innerHTML = "No hay experimentos guardados. 😕😕😕";
    return;
  } else {
    message.innerHTML = "";
  }

  wrapperExperiments.innerHTML = "";
  experimentos.forEach((experimento, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = experimento.id;

    const imagenPrincipal =
      experimento.imagenes.length > 0
        ? experimento.imagenes[0].base64
        : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%23f0f0f0"/><text x="150" y="100" text-anchor="middle" fill="%23999" font-family="Arial" font-size="14">Sin imagen</text></svg>';

    let imagenesSmallHTML = "";
    const maxImagenes = Math.min(6, experimento.imagenes.length);

    for (let i = 1; i < maxImagenes; i++) {
      imagenesSmallHTML += `<img class="imgCardSmall" alt="Imagen ${
        i + 1
      }" src="${experimento.imagenes[i].base64}" />`;
    }

    for (let i = maxImagenes; i < 4; i++) {
      imagenesSmallHTML += `<img class="imgCardSmall placeholder" alt="Sin imagen" src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><rect width='60' height='60' fill='%23e0e0e0'/><text x='30' y='35' text-anchor='middle' fill='%23999' font-family='Arial' font-size='10'>+</text></svg>" />`;
    }

    card.innerHTML = `
      <button class="btnDelete" title="Eliminar experimento">
        &#x2716;
      </button>
      <figure class="figureCard">
        <img class="imgCard" alt="${
          experimento.titulo
        }" src="${imagenPrincipal}" />
      </figure>
      <div class="contentCard">
        <h3 class="titleCard">${experimento.titulo}</h3>
        <p class="descriptionCard">${
          experimento.descripcion || "Sin descripción"
        }</p>
        <p class="dateCard">📆${experimento.fechaCreacion}</p>
      </div>
      <div class="images">
        <figure class="imagesCard">
          ${imagenesSmallHTML}
        </figure>
      </div>
    `;

    const imgCard = card.querySelector(".imgCard");
    const imgSmalls = card.querySelectorAll(".imgCardSmall:not(.placeholder)");
    const btnDelete = card.querySelector(".btnDelete");

    btnDelete?.addEventListener("click", (e) => {
      e.stopPropagation();
      eliminarExperimento(experimento.id, experimento.titulo);
    });

    imgCard?.addEventListener("click", (e) => {
      e.stopPropagation();
      abrirViewer(imagenPrincipal, `${experimento.titulo} - Imagen principal`);
    });

    imgSmalls.forEach((img, imgIndex) => {
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        const realIndex = imgIndex + 1;
        if (experimento.imagenes[realIndex]) {
          abrirViewer(
            experimento.imagenes[realIndex].base64,
            `${experimento.titulo} - Imagen ${realIndex + 1}`
          );
        }
      });
    });

    wrapperExperiments.appendChild(card);
  });
}

function abrirViewer(imageSrc, altText = "") {
  if (!VIEWER || !IMG_VIEW) {
    return;
  }

  IMG_VIEW.src = imageSrc;
  IMG_VIEW.alt = altText;
  VIEWER.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function cerrarViewer() {
  if (!VIEWER) return;

  VIEWER.style.display = "none";
  document.body.style.overflow = "auto";
  IMG_VIEW.src = "";
}

VIEWER?.addEventListener("click", (e) => {
  if (e.target === VIEWER) {
    cerrarViewer();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && VIEWER?.style.display === "flex") {
    cerrarViewer();
  }
});

function eliminarExperimento(experimentoId, titulo) {
  const confirmacion = confirm(
    `¿Estás seguro de que quieres eliminar el experimento "${titulo}"?\n\nEsta acción no se puede deshacer.`
  );

  if (!confirmacion) {
    return;
  }

  console.log(`🗑️ Eliminando experimento: ${titulo} (ID: ${experimentoId})`);

  const indiceExperimento = experimentos.findIndex(
    (exp) => exp.id === experimentoId
  );

  if (indiceExperimento === -1) {
    console.error("❌ Experimento no encontrado");
    alert("Error: No se pudo encontrar el experimento");
    return;
  }

  const experimento = experimentos[indiceExperimento];
  if (experimento.imagenes) {
    experimento.imagenes.forEach((img) => {
      if (img.url) {
        URL.revokeObjectURL(img.url);
      }
    });
  }

  experimentos.splice(indiceExperimento, 1);

  console.log(`✅ Experimento "${titulo}" eliminado correctamente`);
  console.log(`📊 Experimentos restantes: ${experimentos.length}`);

  mostrarExperimentos();

  setTimeout(() => {
    alert(`Experimento "${titulo}" eliminado correctamente`);
  }, 100);
}

mostrarExperimentos();
