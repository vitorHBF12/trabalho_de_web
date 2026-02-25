//Overlay para telas menores (mobile/ < 768px)
const menuToggle = document.getElementById("menuToggle");
const menuClose = document.getElementById("menuClose");
const sidebar = document.querySelector(".sidebar");

const overlay = document.createElement("div");
overlay.classList.add("overlay");
document.body.appendChild(overlay);

menuToggle.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
});

const closeMenu = () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto";
};

menuClose.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);