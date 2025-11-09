export function loadTemplate(fileUrl) {
    return fetch(fileUrl).then(response => {
        return response.text();
    });
}