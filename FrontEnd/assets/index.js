let categories = [];

document.addEventListener("DOMContentLoaded", function (e) {
    init();
});

function init() {
    loadWorks();
    initEditMode();
}

 function loadWorks() {
    fetch("http://localhost:5678/api/works").then((response) => {
        if (response) {
            response.json().then((works) => {
                const gallery = document.querySelector(".gallery");
                gallery.innerHTML = '';

                resetCategories();

                works.forEach(work => {
                    const newWork = document.createElement("figure");
                    newWork.classList.add("work");
                    newWork.dataset.categoryId = work.category.id;

                    const img = document.createElement("img");
                    img.src = work.imageUrl;
                    img.alt = work.title;
                    newWork.appendChild(img);

                    const caption = document.createElement("figcaption");
                    caption.innerText = work.title;
                    newWork.appendChild(caption);

                    gallery.appendChild(newWork);

                    addCategory(work.category);
                });
            });
        }
    });
}

function resetCategories() {
    const filters = document.querySelector("#filters");

    categories = [];
    filters.innerHTML = "";

    addCategory({ id: 0, name: "Tous" }, true);
}

function addCategory(category, active = false) {
    const filters = document.querySelector("#filters");

    if (!categories.some(el => el.id === category.id && el.name === category.name)) {
        categories.push(category);

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
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") ?? null;

    if (token != null) {
        document.querySelector("#edition-banner").setAttribute("style", "display: flex");
        document.querySelector("body").setAttribute("style", "padding-top: 60px")

        document.querySelector("#login-btn").setAttribute("style", "display: none");
        document.querySelector("#logout-btn").setAttribute("style", "display: flex");
    }
}