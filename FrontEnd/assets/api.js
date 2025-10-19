const url = "http://localhost:5678/api";
let token = null;

export function retrieveToken(emailValue, passwordValue) {
    return fetch(`${url}/users/login`, {
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
    return fetch(`${url}/categories`)
        .then(response => {
            return response.json();
        })
        .then(categories => {
            return categories;
        });
}

export function getWorks() {
    return fetch(`${url}/works`)
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

    return fetch(`${url}/works`, {
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
    return fetch(`${url}/works/${workId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
        }
    });
}