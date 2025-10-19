import { getToken, resetToken, getCategories, getWorks } from "./api.js"
import { GalleryModal, UploadModal, openModal, closeModal, closeAllModals } from "./modals.js";

document.addEventListener("DOMContentLoaded", async function (e) {
    await getToken();
    loadCategories();
    loadWorks();
    initEditMode();
    initEvents();
});

async function loadCategories() {
    resetCategoryFilters();
    getCategories().then(categories => {
        categories.unshift({ id: 0, name: "Tous" });
        categories.forEach((category, index) => {
            addCategoryFilter(category, index === 0);
        });
    });
}

export function loadWorks() {
    getWorks().then(works => {
        const gallery = document.querySelector("#portfolio .gallery");
        gallery.innerHTML = '';

        works.forEach(work => {
            addPortfolioWork(gallery, work);
        });
    });
}

function addPortfolioWork(gallery, work) {
    const newWork = document.createElement("figure");
    newWork.classList.add("work");
    newWork.dataset.workId = work.id;
    newWork.dataset.categoryId = work.category.id;

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    newWork.appendChild(img);

    const caption = document.createElement("figcaption");
    caption.innerText = work.title;
    newWork.appendChild(caption);

    gallery.appendChild(newWork);
}

function addCategoryFilter(category, active = false) {
    const filters = document.querySelector("#filters");

    const newBtn = document.createElement("button");
    newBtn.innerText = category.name;
    newBtn.classList.add("filter-button");
    if (active) newBtn.classList.add("active");
    newBtn.dataset.filterId = category.id;

    newBtn.addEventListener("click", function (e) {
        setFilter(this.dataset.filterId);
    });

    filters.appendChild(newBtn);
}

function resetCategoryFilters() {
    const filters = document.querySelector("#filters");
    filters.innerHTML = "";
}

function setFilter(filterId) {
    const filterButtons = document.querySelectorAll(".filter-button");
    filterButtons.forEach(button => {
        button.classList.remove("active");
    });

    document.querySelector(`.filter-button[data-filter-id="${filterId}"]`).classList.add("active");

    const workTiles = document.querySelectorAll(".work");
    workTiles.forEach(tile => {
        if (filterId == 0) {
            tile.classList.remove("hidden");
        }
        else {
            if (tile.dataset.categoryId == filterId) {
                tile.classList.remove("hidden");
            }
            else {
                tile.classList.add("hidden");
            }
        }
    });
}

function initEditMode() {
    if (getToken() != null) {
        const shown = ["#edition-banner", "#logout-btn", "#portfolio-modify"];
        const hidden = ["#login-btn"];
        
        const body = document.querySelector("body");
        if (body) body.style["padding-top"] = "60px";

        shown.forEach(element => {
            document.querySelector(element)?.classList.remove("hidden");
        });

        hidden.forEach(element => {
            document.querySelector(element)?.classList.add("hidden");
        });
    }
}

function initEvents() {
    const logoutBtn = document.querySelector("#logout-btn");
    logoutBtn?.addEventListener("click", function (e) {
        localStorage.removeItem("token");
        resetToken();
        window.location = "index.html";
    });

    const worksEditOpenBtn = document.querySelector("#portfolio-modify");
    worksEditOpenBtn?.addEventListener("click", function (e) {
        openModal(GalleryModal);
    });
}