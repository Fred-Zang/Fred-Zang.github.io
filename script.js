/*
==========================================================================
ZANG.AI — BRIQUE 05
Gestion accessible du menu mobile
==========================================================================

Ce fichier gère uniquement :
- l'ouverture et la fermeture du menu ;
- le voile sombre ;
- la touche Échap ;
- le retour du focus ;
- le maintien du focus dans le panneau.
*/

const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");
const mobileMenu = document.querySelector(".mobile-menu");
const menuOverlay = document.querySelector("[data-menu-overlay]");
const menuLinks = document.querySelectorAll("[data-menu-link]");

/*
 * Cette variable mémorise l'élément sélectionné
 * avant l'ouverture du menu.
 */
let elementFocusedBeforeOpening = null;

/*
 * Renvoie les éléments interactifs du menu.
 * Ils servent à créer un cycle de focus avec la touche Tab.
 */
function getFocusableElements() {
    return mobileMenu.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), ' +
        'select:not([disabled]), textarea:not([disabled]), ' +
        '[tabindex]:not([tabindex="-1"])'
    );
}

function openMenu() {
    elementFocusedBeforeOpening = document.activeElement;

    /*
     * Les attributs ARIA décrivent l'état du menu
     * pour les technologies d'assistance.
     */
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fermer le menu principal");
    mobileMenu.setAttribute("aria-hidden", "false");

    /*
     * Les classes déclenchent les styles d'ouverture.
     */
    mobileMenu.classList.add("is-open");
    document.body.classList.add("menu-is-open");

    /*
     * hidden = false réintroduit le voile dans la page.
     */
    menuOverlay.hidden = false;

    /*
     * requestAnimationFrame attend le prochain cycle d'affichage.
     * Cela permet de voir la transition d'opacité.
     */
    window.requestAnimationFrame(() => {
        menuOverlay.classList.add("is-visible");
    });

    /*
     * Le focus passe dans le panneau ouvert.
     */
    mobileMenu.focus();
}

function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Ouvrir le menu principal");
    mobileMenu.setAttribute("aria-hidden", "true");

    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("menu-is-open");
    menuOverlay.classList.remove("is-visible");

    /*
     * 240 ms correspond à la durée d'animation définie en CSS.
     */
    window.setTimeout(() => {
        menuOverlay.hidden = true;
    }, 240);

    /*
     * Le focus revient au bouton qui avait ouvert le menu.
     */
    if (elementFocusedBeforeOpening) {
        elementFocusedBeforeOpening.focus();
    }
}

function trapFocus(event) {
    if (event.key !== "Tab" || !mobileMenu.classList.contains("is-open")) {
        return;
    }

    const focusableElements = getFocusableElements();

    if (focusableElements.length === 0) {
        return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    /*
     * Maj + Tab depuis le premier élément revient au dernier.
     */
    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
    }

    /*
     * Tab depuis le dernier élément revient au premier.
     */
    if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}

/*
 * Le bouton principal ouvre ou ferme selon son état actuel.
 */
menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    if (isOpen) {
        closeMenu();
    } else {
        openMenu();
    }
});

menuClose.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

/*
 * L'activation d'un lien ferme le panneau,
 * puis le navigateur rejoint la section ciblée.
 */
menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        closeMenu();
    }

    trapFocus(event);
});

/*
 * Si la fenêtre passe au format desktop pendant que le menu est ouvert,
 * nous remettons proprement la page dans son état normal.
 */
const desktopMediaQuery = window.matchMedia("(min-width: 64rem)");

function handleDesktopChange(event) {
    if (event.matches && mobileMenu.classList.contains("is-open")) {
        closeMenu();
    }
}

desktopMediaQuery.addEventListener("change", handleDesktopChange);
