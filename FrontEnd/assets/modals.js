import { loadWorks } from "./index.js"
import { getCategories, getWorks, addWork, deleteWork } from "./api.js";
import { addTrackedEvent, removeTrackedEvent } from "./eventTracking.js";

export class Modal {
    static openedModals = new Set();
    opener = null;

    init(opener = null) {
        this.opener = opener;

        if (this.opener) {
            Modal.createBackButton(this, opener);
        }
        
        Modal.createCloseButton(this);
    }
    
    onOpen() {}
    onClose() {}

    static openModal(modalClass, fromModal = null) {
        const newModal = new modalClass();
        newModal.init(fromModal);
        if (fromModal) newModal.opener = fromModal;

        const body = document.querySelector("body");
        const modalContainer = document.querySelector("#modal-container");
        const modalElement = document.querySelector(`#modal-container .modal#${newModal.id}`);

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

        Modal.openedModals.add(newModal);
        newModal.onOpen();

        modalContainer?.classList.remove("hidden");
        modalElement?.classList.remove("hidden");
        body?.classList.add("noscroll");
    }

    static closeModal(modal) {
        const body = document.querySelector("body");
        const modalContainer = document.querySelector("#modal-container");
        const modalElement = document.querySelector(`.modal#${modal.id}`);
        modalElement?.classList.add("hidden");

        Modal.openedModals.delete(modal);
        modal.onClose();

        if (Modal.openedModals.size === 0) {
            const overlay = document.querySelector("#modal-container #modal-overlay");
            overlay?.remove();

            modalContainer?.classList.add("hidden");
            body?.classList.remove("noscroll");
        }
    }

    static closeAllModals() {
        const openModalIdsCopy = new Set(Modal.openedModals);
        openModalIdsCopy.forEach(id => {
            Modal.closeModal(id);
        });
    }

    static createBackButton(currentModal, targetModal) {
        const existingBackButton = document.querySelector("#modal-container .back-btn");
        existingBackButton?.remove();

        const modalContainer = document.querySelector(`.modal#${currentModal.id}`);
        if (modalContainer) {
            const backButton = document.createElement("i");
            backButton.classList.add("fa-solid", "fa-arrow-left", "back-btn", "pointer");

            modalContainer.prepend(backButton);

            backButton?.addEventListener("click", function () {
                Modal.closeModal(currentModal);
                Modal.openModal(targetModal);
            });
        }
    }

    static createCloseButton(modal) {
        const modalElement = document.querySelector(`#modal-container #${modal.id}`);

        const existingCloseButton = document.querySelector("#modal-container .close-btn");
        existingCloseButton?.remove();

        if (modalElement) {
            const closeButton = document.createElement("i");
            closeButton.classList.add("fa-solid", "fa-xmark", "close-btn", "pointer");
            modalElement.prepend(closeButton);

            closeButton.addEventListener("click", () => {
                Modal.closeModal(modal);
            });
        }
    }
}

export class GalleryModal extends Modal {
    id = "gallery";

    init() {
        super.init();

        const currentModal = this;
        const addButton = document.querySelector(".modal#gallery #add-work-btn");

        removeTrackedEvent(addButton, "click");
        addTrackedEvent(addButton, "click", () => {
            Modal.closeModal(currentModal);
            Modal.openModal(UploadModal, currentModal.constructor);
        });

        this.#loadWorks();
    }

    onClose() {

    }

    #loadWorks() {
        getWorks().then(works => {
            const gallery = document.querySelector(".modal#gallery .gallery");
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
                        const editGalleryWork = document.querySelector(`.modal#gallery .gallery .work[data-work-id="${work.id}"]`);
                        portfolioGalleryWork?.remove();
                        editGalleryWork?.remove();
                    });
                });

                gallery?.appendChild(workThumbnail);
            });
        });
    }
}

export class UploadModal extends Modal {
    id = "upload";

    onOpen() {
        const filePicker = document.querySelector(`.modal#upload #upload-container`);
        const filePickerContent = document.querySelector(`.modal#upload #filepicker-content`);
        const fileInput = document.querySelector(`.modal#upload input[type='file']`);
        const titleInput = document.querySelector(`.modal#upload .input #title`);
        const categorySelect = document.querySelector(`.modal#upload .input #category`);
        const validateBtn = document.querySelector(`.modal#upload #upload-work-btn`);

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
            removeTrackedEvent(validateBtn, "click");
            addTrackedEvent(validateBtn, "click", onValidateButtonClicked);
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

        function onValidateButtonClicked() {
            const img = fileInput.files[0];
            const inputTitle = titleInput.value;
            const category = categorySelect.value;
            if (img && inputTitle && category) {
                addWork(img, inputTitle, category).then(() => {
                    const backButton = document.querySelector(".modal#upload .back-btn");
                    backButton?.click();
                    loadWorks();
                });
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
}