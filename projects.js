import { animateLayout, animate } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm"

let currentOpenId = null
let layoutControls = null
let isClosing = false
let overlayControls = null
let box = null // the area the card expands inside

const transition = {
    duration: 0.5,
    ease: [0.39, 0.14, 0.26, 1],
}

// The main page calls this after projects.html has loaded
window.initProjectCards = function () {
    box = document.getElementById("project-cards")

    box.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", async () => {
            const id = card.dataset.id
            await startLayoutAnimation(() => {
                openCard(id)
            })
        })
    })
}

async function startLayoutAnimation(update, { closing = false } = {}) {
    if (layoutControls) {
        layoutControls.stop()
    }

    isClosing = closing

    const controls = await animateLayout(update, transition)
    layoutControls = controls

    controls.finished.then(() => {
        if (layoutControls !== controls) return
        layoutControls = null
        isClosing = false
    })

    return controls
}

function openCard(id) {
    if (currentOpenId) {
        closeCard()
    }

    currentOpenId = id

    const sourceCard = box.querySelector(`.card[data-id="${id}"]`)
    const theme = sourceCard.classList.contains("dark") ? "dark" : ""

    ensureOverlayVisible()

    const clonedContent = sourceCard.querySelector(".card-content").cloneNode(true)
    clonedContent.id = "modal"

    const expandedCardContainer = document.createElement("div")
    expandedCardContainer.className = `card-content-container open ${theme}`
    expandedCardContainer.appendChild(clonedContent)

    const contentContainer = expandedCardContainer.querySelector(".content-container")
    contentContainer.classList.remove("hidden")

    box.appendChild(expandedCardContainer)

    return expandedCardContainer
}

function ensureOverlayVisible() {
    let overlay = box.querySelector(".overlay")

    if (!overlay) {
        overlay = document.createElement("div")
        overlay.className = "overlay"
        overlay.style.opacity = "0"
        overlay.addEventListener("click", animateClose)
        box.appendChild(overlay)
    }

    overlay.style.pointerEvents = "auto"
    overlayControls && overlayControls.stop()
    overlayControls = animate(overlay, { opacity: 1 }, transition)

    return overlay
}

function fadeOverlayOut(overlay) {
    overlay.style.pointerEvents = "none"
    overlayControls && overlayControls.stop()
    const controls = animate(overlay, { opacity: 0 }, transition)
    overlayControls = controls
    controls.finished.then(() => {
        if (overlayControls !== controls) return
        overlay.remove()
    })
}

async function animateClose() {
    if (!currentOpenId || isClosing) return

    const overlay = box.querySelector(".overlay")
    if (overlay) {
        fadeOverlayOut(overlay)
    }

    await startLayoutAnimation(closeCard, { closing: true })
}

function closeCard() {
    if (!currentOpenId) return

    const expandedCardContainer = box.querySelector(".card-content-container.open")
    if (expandedCardContainer) expandedCardContainer.remove()

    currentOpenId = null
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && currentOpenId) {
        animateClose()
    }
})