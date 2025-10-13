document.addEventListener("DOMContentLoaded", function (e) {
    loadWorks();
});

async function loadWorks() {
    fetch("http://localhost:5678/api/works").then(async (response) => {
        if (response) {
            response.json().then(async (works) => {
                const gallery = document.querySelector(".gallery");
                gallery.innerHTML = '';

                works.forEach(work => {
                    const newWork = document.createElement("figure");

                    const img = document.createElement("img");
                    img.src = work.imageUrl;
                    img.alt = work.title;
                    newWork.appendChild(img);

                    const caption = document.createElement("figcaption");
                    caption.innerText = work.title;
                    newWork.appendChild(caption);

                    gallery.appendChild(newWork);
                });
            });
        }
    });
}