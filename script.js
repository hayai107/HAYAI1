// Función para reproducir música en bucle en index.html
let audio;
function playAudio1() {
    if (!audio) {
        audio = new Audio('musica/musica1.mp3');
        audio.loop = true;
    }
    audio.play();
}

document.addEventListener("DOMContentLoaded", function() {
    const gallery = document.getElementById("gallery");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");
    const closeButton = document.querySelector(".close-button");

    // Variables para navegación de imágenes
    let currentImgIndex = null;
    let currentVidIndex = null;
    const maxImgIndex = 60; // Imágenes de img0 a img60
    const maxVidIndex = 16; // Videos de vd0 a vd16

    // Función para mostrar imagen en el modal
    function showImageInModal(index) {
        if (index < 0 || index > maxImgIndex) return;
        modalContent.innerHTML = `<img src="img/img${index}.jpg" alt="Recuerdo ${index}">`;
        modal.classList.add("show");
        currentImgIndex = index;
        currentVidIndex = null;
    }

    function showVideoInModal(index) {
        if (index < 0 || index > maxVidIndex) return;
        modalContent.innerHTML = `<video autoplay controls playsinline preload="metadata" poster="web-videos/vd${index}.jpg"><source src="web-videos/vd${index}.mp4" type="video/mp4"></video>`;
        modal.classList.add("show");
        currentVidIndex = index;
        currentImgIndex = null;
    }

    // Función para crear elementos de medios
    function addMedia(type, index) {
        const div = document.createElement("div");
        div.className = "media-item";
        if (type === "image") {
            const img = document.createElement("img");
            img.src = `img/img${index}.jpg`;
            img.alt = `Recuerdo ${index}`;
            img.onerror = () => div.remove(); // Elimina si el archivo no existe
            div.appendChild(img);
            div.addEventListener("click", () => {
                showImageInModal(index);
            });
        } else if (type === "video") {
            // Cargar solo la portada hasta que se abra el video.
            const poster = document.createElement("img");
            poster.src = `web-videos/vd${index}.jpg`;
            poster.alt = `Reproducir video ${index + 1}`;
            poster.loading = "lazy";
            div.appendChild(poster);
            const playBadge = document.createElement("span");
            playBadge.className = "video-play-badge";
            playBadge.textContent = "▶";
            playBadge.setAttribute("aria-hidden", "true");
            div.appendChild(playBadge);
            div.setAttribute("role", "button");
            div.tabIndex = 0;
            div.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    showVideoInModal(index);
                }
            });
            div.addEventListener("click", () => {
                showVideoInModal(index);
            });
        }
        gallery.appendChild(div);
    }
    
    // Cargar imágenes
    let imgIndex = 0;
    while (imgIndex <= maxImgIndex) {
        addMedia("image", imgIndex);
        imgIndex++;
    }
    
    // Cargar videos
    let vidIndex = 0;
    while (vidIndex <= maxVidIndex) {
        addMedia("video", vidIndex);
        vidIndex++;
    }

    // Cerrar modal
    closeButton.addEventListener("click", () => {
        modal.classList.remove("show");
        modalContent.innerHTML = "";
        currentImgIndex = null;
        currentVidIndex = null;
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("show");
            modalContent.innerHTML = "";
            currentImgIndex = null;
            currentVidIndex = null;
        }
    });

    // Navegación con flechas
    document.addEventListener("keydown", function(e) {
        if (modal.classList.contains("show")) {
            if (e.key === "ArrowRight") {
                if (currentImgIndex !== null) {
                    // Siguiente imagen o pasar al primer video
                    let next = currentImgIndex + 1;
                    if (next > maxImgIndex) {
                        showVideoInModal(0);
                    } else {
                        showImageInModal(next);
                    }
                } else if (currentVidIndex !== null) {
                    // Siguiente video o volver a la primera imagen
                    let next = currentVidIndex + 1;
                    if (next > maxVidIndex) {
                        showImageInModal(0);
                    } else {
                        showVideoInModal(next);
                    }
                }
            } else if (e.key === "ArrowLeft") {
                if (currentImgIndex !== null) {
                    // Imagen anterior o ir al último video
                    let prev = currentImgIndex - 1;
                    if (prev < 0) {
                        showVideoInModal(maxVidIndex);
                    } else {
                        showImageInModal(prev);
                    }
                } else if (currentVidIndex !== null) {
                    // Video anterior o ir a la última imagen
                    let prev = currentVidIndex - 1;
                    if (prev < 0) {
                        showImageInModal(maxImgIndex);
                    } else {
                        showVideoInModal(prev);
                    }
                }
            }
        }
    });

});
