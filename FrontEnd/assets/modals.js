import { loadWorks } from "./index.js"
import { loadTemplate } from "./template.js"
import { getCategories, getWorks, addWork, deleteWork } from "./api.js";
import { addTrackedEvent, removeTrackedEvent } from "./eventTracking.js";

// Modals base class
export class Modal {
    static openedModals = new Set();
    static templatePathBase = "./assets/templates/modals/";
    static closeOverlayTimeout = null;

    templateFileName = "";

    backTargetModal = null;
    element = null;

    title = "Titre";
    validateBtnText = "Valider";

    validateBtnFunction = this.onValidateButtonClicked;
    
    init() {
        const thisModal = this;

        const backBtn = this.element.querySelector(".back-btn");
        if (this.backTargetModal != null) {
            backBtn.classList.remove("hidden");
            backBtn.addEventListener("click", function (e) {
                Modal.openModal(thisModal.backTargetModal.constructor).then(() => {
                    Modal.closeModal(thisModal);
                });
            });
        }
        else {
            backBtn.classList.add("hidden");
        }

        const closeBtn = this.element.querySelector(".close-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", function (e) {
                Modal.closeModal(thisModal);
            });
        }

        if (thisModal.validateBtnFunction != null) {
            const validateBtn = this.element.querySelector(".modal-btn");
            validateBtn.addEventListener("click", function (e) {
                thisModal.validateBtnFunction();
            });
        }
    }

    onOpen() {}
    onClose() {}
    onValidateButtonClicked() {}

    // Instantiates a modal object, a clickable overlay if it doesn't exist and calls its onOpen() function
    static openModal(modalClass, fromModal = null) {
        clearTimeout(Modal.closeOverlayTimeout);
        Modal.closeOverlayTimeout = null;

        const newModal = new modalClass();
        if (fromModal) newModal.backTargetModal = fromModal;

        return loadTemplate(`${Modal.templatePathBase}modal.html`).then(baseModalHtml => {
            loadTemplate(`${Modal.templatePathBase}${newModal.templateFileName}.html`).then(loadedModalHtml => {
                const modalContainer = document.querySelector("#modal-container");
                modalContainer.innerHTML = baseModalHtml;
                modalContainer.querySelector("#modal-container .content").innerHTML = loadedModalHtml;

                modalContainer.querySelector("#modal-container .modal h1").innerText = newModal.title;
                modalContainer.querySelector("#modal-container .modal .modal-btn").innerText = newModal.validateBtnText;

                newModal.element = modalContainer.querySelector("#modal-container .modal");

                let overlay = document.querySelector("#modal-container #modal-overlay");
                if (overlay == null) {
                    overlay = document.createElement("div");
                    overlay.id = "modal-overlay";
                    overlay.classList.add("flexbox", "fullw", "fullh");
                    overlay.addEventListener("click", function (e) {
                        Modal.closeAllModals();
                    });
                    modalContainer.prepend(overlay);
                }

                newModal.init(fromModal);

                Modal.openedModals.add(newModal);
                newModal.onOpen();

                const body = document.querySelector("body");
                body?.classList.add("noscroll");

                modalContainer.classList.remove("hidden");
            });
        });
    }

    // Calls the modal onClose() function and removes the overlay if no other modal is opened
    static closeModal(modal) {
        const body = document.querySelector("body");
        const modalContainer = document.querySelector("#modal-container");

        Modal.openedModals.delete(modal);

        clearTimeout(Modal.closeOverlayTimeout);
        Modal.closeOverlayTimeout = setTimeout(() => {
            modal.element.remove();
            modal.onClose();

            if (Modal.openedModals.size === 0) {
                const overlay = document.querySelector("#modal-container #modal-overlay");
                overlay?.remove();

                modalContainer?.classList.add("hidden");
                body?.classList.remove("noscroll");
            }
        }, 50);
    }

    // Calls closeModal() for each opened modal
    static closeAllModals() {
        const openModalIdsCopy = new Set(Modal.openedModals);
        openModalIdsCopy.forEach(id => {
            Modal.closeModal(id);
        });
    }
}

export class GalleryModal extends Modal {
    id = "gallery";
    templateFileName = "gallery-modal";

    title = "Galerie photo";
    validateBtnText = "Ajouter une photo";

    init() {
        super.init();
        this.#loadWorks();
    }

    #loadWorks() {
        getWorks().then(works => {
            const modal = this.element;
            const gallery = modal.querySelector(".gallery");
            if (gallery) gallery.innerHTML = "";
            works.forEach(work => {
                const workThumbnail = document.createElement("div");
                workThumbnail.classList.add("work");
                workThumbnail.dataset.workId = work.id;

                const workImg = document.createElement("img");
                workImg.classList.add("fullw", "fullh");
                workImg.src = work.imageUrl;
                workImg.dataset.workId = work.id;
                workThumbnail.appendChild(workImg);

                const deleteBtn = document.createElement("button");
                deleteBtn.innerHTML = "<i class='fa-solid fa-trash-can'></i>";
                deleteBtn.classList.add("work-del", "pointer", "flexbox");
                workThumbnail.appendChild(deleteBtn);

                deleteBtn?.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    deleteWork(work.id).then(() => {
                        const portfolioGalleryWork = document.querySelector(`#portfolio .gallery .work[data-work-id="${work.id}"]`);
                        const editGalleryWork = modal.querySelector(`.gallery .work[data-work-id="${work.id}"]`);
                        portfolioGalleryWork?.remove();
                        editGalleryWork?.remove();
                    });
                });

                gallery?.appendChild(workThumbnail);
            });
        });
    }

    onValidateButtonClicked() {
        Modal.closeModal(this);
        Modal.openModal(UploadModal, this);
    }
}

export class UploadModal extends Modal {
    id = "upload";
    templateFileName = "upload-modal";

    title = "Ajout photo";
    validateBtnText = "Valider";

    onOpen() {
        const filePicker = this.element.querySelector(`#upload-container`);
        const fileInput = this.element.querySelector(`input[type='file']`);
        const filePickerContent = this.element.querySelector(`#filepicker-content`);
        const titleInput = this.element.querySelector(`.input #title`);
        const categorySelect = this.element.querySelector(`.input #category`);
        const validateBtn = this.element.querySelector(`.modal-btn`);

        categorySelect.innerHTML = "";
        getCategories().then(categories => {
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.innerText = category.name;

                categorySelect.appendChild(option);
            });
        });

        if (filePicker) {
            removeTrackedEvent(filePicker, "click");
            addTrackedEvent(filePicker, "click", onFilePickerClicked);    
        }

        if (fileInput) {
            removeTrackedEvent(filePicker, "change");
            addTrackedEvent(filePicker, "change", onFileInputChanged);
        }

        if (titleInput) {
            removeTrackedEvent(titleInput, "input");
            addTrackedEvent(titleInput, "input", updateValidateButton);
        }

        if (validateBtn) {
            updateValidateButton();
        }

        function updateValidateButton() {
            if (fileInput.files[0] && titleInput?.value.length > 0) {
                validateBtn?.classList.remove("disabled")
            }
            else {
                validateBtn?.classList.add("disabled");
            }
        }

        function onFilePickerClicked(event) {
            if (event.target != filePicker) return;
            event.stopImmediatePropagation();
            fileInput?.click();
        }

        function onFileInputChanged(event) {
            event.stopImmediatePropagation();

            const file = event.target.files[0];
            if (filePicker && file) {
                filePicker.style["background-image"] = `url("${URL.createObjectURL(file)}")`;
                filePickerContent?.classList.add("hidden");
                updateValidateButton();
            }
        }
    }

    onClose() {
        const uploadContainer = document.querySelector(".modal#upload #upload-container");
        if (uploadContainer) uploadContainer.style["background-image"] = "none";

        const filePickerContent = document.querySelector(".modal#upload #filepicker-content");
        if (filePickerContent) filePickerContent.classList.remove("hidden");

        const inputTitle = document.querySelector(".modal#upload .input #title");
        if (inputTitle) inputTitle.value = "";

        const categorySelect = document.querySelector(".modal#upload .input select#category");
        if (categorySelect) categorySelect.selectedIndex = 0;
    }

    onValidateButtonClicked() {
        const fileInput = this.element.querySelector(`input[type='file']`);
        const titleInput = this.element.querySelector(`.input #title`);
        const categorySelect = this.element.querySelector(`.input #category`);

        const img = fileInput.files[0];
        const inputTitle = titleInput.value;
        const category = categorySelect.value;
        if (img && inputTitle && category) {
            addWork(img, inputTitle, category).then(() => {
                const backButton = document.querySelector(".modal .back-btn");
                backButton?.click();
                loadWorks();
            });
        }
    }
}