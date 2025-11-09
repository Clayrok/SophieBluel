import { retrieveToken } from "./api.js";

document.addEventListener("DOMContentLoaded", function (e) {
    init();
});

function init() {
    const email = document.querySelector("#login-form > input[type='email']");
    const password = document.querySelector("#login-form > input[type='password']");
    const connectBtn = document.querySelector("#login-form > input[type='submit']");

    connectBtn?.addEventListener("click", async function (e) {
        e.preventDefault();

        const emailValue = email?.value.trim() || "";
        const passwordValue = password?.value.trim() || "";

        if (emailValue.length > 0 && passwordValue.length > 0) {
            if (isEmailValid(emailValue)) {
                updateError(false);
                
                retrieveToken(emailValue, passwordValue).then(token => {
                    if (token) {
                        window.location = "index.html";
                    }
                    else {
                        updateError(true, "Email ou Mot de passe incorrect.");
                    }
                });
            }
            else {
                updateError(true, "Adresse email invalide.");
            }
        }
        else {
            updateError(true, "Veuillez entrer une adresse email et un mot de passe.");
        }
    });
}

function isEmailValid(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function updateError(isVisible, message = "Une erreur s'est produite.") {
    const credentialsError = document.querySelector("#login-form #credentials-error");
    if (credentialsError) {
        if (isVisible) {
            credentialsError.textContent = message;
            credentialsError.classList.remove("hidden");
        }
        else {
            credentialsError.classList.add("hidden");
        }
    }
}