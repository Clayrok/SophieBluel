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
            fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: emailValue,
                    password: passwordValue
                })
            }).then((response) => {
                if (response.ok) {
                    response.json().then((parsedJson) => {
                        sessionStorage.setItem("token", parsedJson.token);
                        window.location = "index.html";
                    });
                }
            });
        }
    });
}