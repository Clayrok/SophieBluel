const apiURL = "http://localhost:5678/api";
let token = null;

export function retrieveToken(emailValue, passwordValue) {
    return fetch(`${apiURL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: emailValue,
            password: passwordValue
        })
    })
    .then(response => {
        return response.json();
    })
    .then(parsedJson => {
        token = parsedJson.token;
        localStorage.setItem("token", parsedJson.token);
        return token;
    });
}

export function getToken() {
    if (token == null) {
        token = localStorage.getItem("token") || null;
    }
    
    return token;
}

export function resetToken() {
    localStorage.removeItem("token");
    token = null;
}

export function getCategories() {
    return fetch(`${apiURL}/categories`)
        .then(response => {
            return response.json();
        })
        .then(categories => {
            return categories;
        });
}

export function getWorks() {
    return fetch(`${apiURL}/works`)
        .then(response => {
            return response.json();
        })
        .then(works => {
            return works;
        });
}

export function addWork(image, title, categoryId) {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("category", categoryId);

    return fetch(`${apiURL}/works`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${getToken()}`
        },
        body: formData
    })
    .then(response => {
        return response.json();
    });
}

export function deleteWork(workId) {
    return fetch(`${apiURL}/works/${workId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
    });
}