/*
    ================================================================
    Zang.AI — Zoom enrichi des visuels de fiches projets

    Ce script gère l'ouverture de la fenêtre d'agrandissement,
    l'ajout de vrais contrôles de zoom, l'ouverture dans un nouvel
    onglet et un déplacement par glisser-déposer lorsque l'image
    dépasse la zone visible.
    ================================================================
*/

const imageDialog = document.querySelector("[data-image-dialog]");
const dialogImage = document.querySelector("[data-image-dialog-img]");
const closeButton = document.querySelector("[data-image-dialog-close]");
const imageButtons = document.querySelectorAll("[data-project-image]");

if (imageDialog && dialogImage && closeButton) {
    const viewport = imageDialog.querySelector(".image-dialog__viewport");
    const toolbar = imageDialog.querySelector(".image-dialog__toolbar");

    let currentZoom = 1;
    let imageSource = "";
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let startScrollLeft = 0;
    let startScrollTop = 0;

    /*
        Création dynamique des contrôles afin d'éviter toute
        modification obligatoire du HTML déjà en place.
    */
    const tools = document.createElement("div");
    tools.className = "image-dialog__tools";
    tools.innerHTML = `
        <button type="button" class="image-dialog__tool" data-image-zoom-out aria-label="Réduire le zoom">−</button>
        <button type="button" class="image-dialog__tool image-dialog__tool--reset" data-image-zoom-reset aria-label="Remettre le zoom à 100 %">100 %</button>
        <button type="button" class="image-dialog__tool" data-image-zoom-in aria-label="Augmenter le zoom">+</button>
        <button type="button" class="image-dialog__tool image-dialog__tool--link" data-image-open-source aria-label="Ouvrir l’image dans un nouvel onglet">Nouvel onglet</button>
    `;

    if (toolbar && !toolbar.querySelector(".image-dialog__tools")) {
        toolbar.insertBefore(tools, closeButton);
    }

    const zoomOutButton = tools.querySelector("[data-image-zoom-out]");
    const zoomResetButton = tools.querySelector("[data-image-zoom-reset]");
    const zoomInButton = tools.querySelector("[data-image-zoom-in]");
    const openSourceButton = tools.querySelector("[data-image-open-source]");

    function clampZoom(value) {
        return Math.min(4, Math.max(0.5, value));
    }

    function updateZoomLabel() {
        if (zoomResetButton) {
            zoomResetButton.textContent = `${Math.round(currentZoom * 100)} %`;
        }
    }

    function applyZoom(nextZoom) {
        if (!dialogImage.naturalWidth) {
            return;
        }

        currentZoom = clampZoom(nextZoom);
        dialogImage.style.width = `${Math.round(dialogImage.naturalWidth * currentZoom)}px`;
        dialogImage.style.maxWidth = "none";
        dialogImage.style.minWidth = "0";
        updateZoomLabel();
    }

    function openImage(source, altText) {
        imageSource = source;
        currentZoom = 1;

        dialogImage.src = source;
        dialogImage.alt = altText || "";
        dialogImage.style.width = "auto";

        imageDialog.showModal();
    }

    imageButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const source = button.dataset.imageSrc;
            const altText = button.dataset.imageAlt || "";

            if (!source) {
                return;
            }

            openImage(source, altText);
        });
    });

    dialogImage.addEventListener("load", () => {
        /*
            L'image s'ouvre d'abord à sa taille native afin de conserver
            la meilleure lisibilité possible. Les boutons + / − permettent
            ensuite d'aller au-delà si nécessaire.
        */
        applyZoom(1);
        if (viewport) {
            viewport.scrollLeft = 0;
            viewport.scrollTop = 0;
        }
    });

    if (zoomInButton) {
        zoomInButton.addEventListener("click", () => {
            applyZoom(currentZoom + 0.25);
        });
    }

    if (zoomOutButton) {
        zoomOutButton.addEventListener("click", () => {
            applyZoom(currentZoom - 0.25);
        });
    }

    if (zoomResetButton) {
        zoomResetButton.addEventListener("click", () => {
            applyZoom(1);
        });
    }

    if (openSourceButton) {
        openSourceButton.addEventListener("click", () => {
            if (imageSource) {
                window.open(imageSource, "_blank", "noopener,noreferrer");
            }
        });
    }

    closeButton.addEventListener("click", () => {
        imageDialog.close();
    });

    imageDialog.addEventListener("click", (event) => {
        const bounds = imageDialog.getBoundingClientRect();

        const clickedOutside =
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom;

        if (clickedOutside) {
            imageDialog.close();
        }
    });

    /*
        Le glisser-déposer facilite la navigation lorsque l'utilisateur
        a fortement zoomé sur un schéma très dense.
    */
    if (viewport) {
        viewport.addEventListener("mousedown", (event) => {
            if (currentZoom <= 1) {
                return;
            }

            isDragging = true;
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            startScrollLeft = viewport.scrollLeft;
            startScrollTop = viewport.scrollTop;
            viewport.classList.add("image-dialog__viewport--dragging");
        });

        window.addEventListener("mousemove", (event) => {
            if (!isDragging) {
                return;
            }

            const deltaX = event.clientX - dragStartX;
            const deltaY = event.clientY - dragStartY;
            viewport.scrollLeft = startScrollLeft - deltaX;
            viewport.scrollTop = startScrollTop - deltaY;
        });

        window.addEventListener("mouseup", () => {
            isDragging = false;
            viewport.classList.remove("image-dialog__viewport--dragging");
        });
    }

    imageDialog.addEventListener("close", () => {
        dialogImage.src = "";
        dialogImage.alt = "";
        dialogImage.style.width = "auto";
        currentZoom = 1;
        imageSource = "";
        updateZoomLabel();
    });

    /*
        Raccourcis clavier simples :
        + / = pour agrandir, - pour réduire, 0 pour revenir à 100 %.
    */
    imageDialog.addEventListener("keydown", (event) => {
        if (!imageDialog.open) {
            return;
        }

        if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            applyZoom(currentZoom + 0.25);
        }

        if (event.key === "-") {
            event.preventDefault();
            applyZoom(currentZoom - 0.25);
        }

        if (event.key === "0") {
            event.preventDefault();
            applyZoom(1);
        }
    });
}
