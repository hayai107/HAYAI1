// Función para reproducir música en bucle en index.html
async function playAudio1() {
    const audio = document.getElementById('background-music');
    const button = document.querySelector('.music-button');
    const status = document.getElementById('music-status');
    if (!audio.paused) {
        audio.pause();
        button.textContent = '♫ Encender nuestra música';
        button.setAttribute('aria-pressed', 'false');
        status.textContent = 'Cuando quieras, seguimos escuchando juntos.';
        return;
    }
    button.disabled = true;
    status.textContent = 'Preparando nuestra canción…';
    try {
        await audio.play();
        button.textContent = '♫ Pausar nuestra música';
        button.setAttribute('aria-pressed', 'true');
        status.textContent = 'Nuestra historia suena mejor contigo. Enciende la música también en la siguiente página.';
    } catch {
        status.textContent = 'La canción todavía no pudo cargar. Toca el botón para intentarlo de nuevo.';
    } finally {
        button.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const content = document.getElementById('site-content');
    const introDuration = 15000;
    let introTimer;
    function finishWelcome() {
        clearInterval(introTimer);
        clearTimeout(window.introFallback);
        document.documentElement.classList.remove('is-loading');
        content.inert = false;
        document.getElementById('album-title').focus({ preventScroll: true });
    }
    function updateWelcome() {
        const elapsed = performance.now() - window.introStartedAt;
        document.getElementById('welcome-progress').style.width = `${Math.min(100, elapsed / introDuration * 100)}%`;
        document.getElementById('welcome-seconds').textContent = `${Math.max(0, Math.ceil((introDuration - elapsed) / 1000))} s`;
        if (elapsed >= introDuration) finishWelcome();
    }
    if (document.documentElement.classList.contains('is-loading')) {
        content.inert = true;
        document.getElementById('welcome-title').focus({ preventScroll: true });
        introTimer = setInterval(updateWelcome, 200);
        updateWelcome();
    }
    document.getElementById('welcome-skip').addEventListener('click', finishWelcome);
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
            img.src = `web-images/img${index}.jpg`;
            img.decoding = 'async';
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
            poster.decoding = "async";
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
