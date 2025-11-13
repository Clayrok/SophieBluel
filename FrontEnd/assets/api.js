const apiURL = "http://localhost:5678/api";
let token = null;

// Retrieves the token from the API and stores it
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

// Get the stored token
export function getStoredToken() {
    if (token == null) {
        token = localStorage.getItem("token") || null;
    }
    
    return token;
}

// Wipes the stored token
export function resetToken() {
    localStorage.removeItem("token");
    token = null;
}

// Retrieves the categories from the API
export function getCategories() {
    return fetch(`${apiURL}/categories`)
        .then(response => {
            return response.json();
        })
        .then(categories => {
            return categories;
        });
}

// Retrieves the works from the API
export function getWorks() {
    return fetch(`${apiURL}/works`)
        .then(response => {
            return response.json();
        })
        .then(works => {
            return works;
        });
}

// Calls the API to add a new work
export function addWork(image, title, categoryId) {
    if (getStoredToken() == null) return;

    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("category", categoryId);

    return fetch(`${apiURL}/works`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${getStoredToken()}`
        },
        body: formData
    })
    .then(response => {
        return response.json();
    });
}

// Calls the API to remove a work
export function deleteWork(workId) {
    if (getStoredToken() == null) return;

    return fetch(`${apiURL}/works/${workId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${getStoredToken()}`,
            'Content-Type': 'application/json'
        }
    });
}