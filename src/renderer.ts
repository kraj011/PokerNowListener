const connectButton = document.getElementById("connectButton");
const gameLinkField = document.getElementById("gameLinkField") as HTMLInputElement;
const cookieField = document.getElementById("cookieField") as HTMLInputElement;
const nameField = document.getElementById("nameField") as HTMLInputElement;

connectButton?.addEventListener("click", () => {
    const gameLink = gameLinkField.value;
    const cookie = cookieField.value;
    const name = nameField.value;
    window.electronAPI.connect(gameLink, cookie, name);
})


