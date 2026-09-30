// =====================================
// FarmConnect Home Page JavaScript
// =====================================

console.log("FarmConnect website loaded successfully!");


// Add shadow to navbar while scrolling

window.addEventListener("scroll", function () {

    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 50) {

        navbar.style.boxShadow =
            "0 5px 20px rgba(0,0,0,0.12)";

    } else {

        navbar.style.boxShadow =
            "0 3px 15px rgba(0,0,0,0.08)";
    }

});