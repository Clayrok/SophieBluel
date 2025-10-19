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
            retrieveToken(emailValue, passwordValue).then(token => {
                if (token) {
                    window.location = "index.html";
                }
                else {
                    const credentialsError = document.querySelector("#login-form #credentials-error");
                    if (credentialsError) credentialsError.classList.remove("hidden");
                }
            });
        }
    });
}