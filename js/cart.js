
// ==========================================
// FarmConnect - Customer Cart
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    auth
} from "./firebase.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const cartCount =
    document.getElementById("cartCount");

const cartItems =
    document.getElementById("cartItems");

const cartContent =
    document.getElementById("cartContent");

const emptyCart =
    document.getElementById("emptyCart");

const itemSummary =
    document.getElementById("itemSummary");

const summaryItems =
    document.getElementById("summaryItems");

const subtotal =
    document.getElementById("subtotal");

const grandTotal =
    document.getElementById("grandTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const userInitial =
    document.getElementById("userInitial");


// ==========================================
// CHECK LOGIN
// ==========================================

onAuthStateChanged(
    auth,
    function (user) {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        let name = "Customer";


        if (user.displayName) {

            name =
                user.displayName;

        }

        else if (user.email) {

            name =
                user.email.split("@")[0];

        }


        userInitial.textContent =
            name.charAt(0).toUpperCase();


        loadCart();

    }
);


// ==========================================
// GET CART
// ==========================================

function getCart() {

    try {

        const savedCart =
            localStorage.getItem(
                "farmConnectCart"
            );


        if (!savedCart) {

            return [];

        }


        return JSON.parse(
            savedCart
        );

    }

    catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

        return [];

    }

}


// ==========================================
// SAVE CART
// ==========================================

function saveCart(cart) {

    localStorage.setItem(
        "farmConnectCart",
        JSON.stringify(cart)
    );

}


// ==========================================
// LOAD CART
// ==========================================

function loadCart() {

    const cart =
        getCart();


    if (cart.length === 0) {

        showEmptyCart();

        updateCartCount();

        return;

    }


    showCart();


    renderCart(cart);


    updateCartCount();

}


// ==========================================
// SHOW EMPTY CART
// ==========================================

function showEmptyCart() {

    cartContent.classList.add(
        "hidden"
    );

    emptyCart.classList.remove(
        "hidden"
    );

}


// ==========================================
// SHOW CART
// ==========================================

function showCart() {

    emptyCart.classList.add(
        "hidden"
    );

    cartContent.classList.remove(
        "hidden"
    );

}


// ==========================================
// RENDER CART
// ==========================================

function renderCart(cart) {

    cartItems.innerHTML = "";


    let totalItems = 0;

    let totalPrice = 0;


    cart.forEach(
        function (item, index) {

            const quantity =
                Number(item.quantity) || 1;


            const price =
                Number(item.price) || 0;


            const itemTotal =
                quantity * price;


            totalItems +=
                quantity;


            totalPrice +=
                itemTotal;


            const card =
                createCartItem(
                    item,
                    index
                );


            cartItems.appendChild(
                card
            );

        }
    );


    itemSummary.textContent =
        totalItems +
        (totalItems === 1
            ? " item"
            : " items");


    summaryItems.textContent =
        totalItems;


    subtotal.textContent =
        "₹" +
        totalPrice;


    grandTotal.textContent =
        "₹" +
        totalPrice;

}


// ==========================================
// CREATE CART ITEM
// ==========================================

function createCartItem(
    item,
    index
) {

    const card =
        document.createElement("div");


    card.className =
        "cart-item";


    const image =
        item.image || "";


    const name =
        item.name ||
        "Farm Product";


    const price =
        Number(item.price) || 0;


    const unit =
        item.unit || "kg";


    const quantity =
        Number(item.quantity) || 1;


    const farmer =
        item.farmerName ||
        "Local Farmer";


    const location =
        item.location ||
        "Local Farm";


    const category =
        item.category ||
        "Farm Product";


    let imageHTML;


    if (image) {

        imageHTML =
            "<img src='" +
            escapeHTML(image) +
            "' alt='" +
            escapeHTML(name) +
            "'>";

    }

    else {

        imageHTML =
            "<div class='item-placeholder'>🌱</div>";

    }


    card.innerHTML =

        "<div class='item-image'>" +

            imageHTML +

        "</div>" +


        "<div class='item-details'>" +

            "<div class='item-category'>" +
                escapeHTML(category) +
            "</div>" +

            "<h3 class='item-name'>" +
                escapeHTML(name) +
            "</h3>" +

            "<div class='item-farmer'>" +
                "👨‍🌾 " +
                escapeHTML(farmer) +
            "</div>" +

            "<div class='item-location'>" +
                "📍 " +
                escapeHTML(location) +
            "</div>" +

            "<div class='item-price'>" +
                "₹" +
                price +
                " <span>/ " +
                escapeHTML(unit) +
                "</span>" +
            "</div>" +

        "</div>" +


        "<div class='item-controls'>" +

            "<div class='quantity-control'>" +

                "<button " +
                    "class='decrease-item' " +
                    "type='button'>" +
                    "−" +
                "</button>" +

                "<span>" +
                    quantity +
                "</span>" +

                "<button " +
                    "class='increase-item' " +
                    "type='button'>" +
                    "+" +
                "</button>" +

            "</div>" +

            "<div class='item-total'>" +
                "₹" +
                itemTotal(price, quantity) +
            "</div>" +

            "<button " +
                "class='remove-btn' " +
                "type='button'>" +
                "🗑 Remove" +
            "</button>" +

        "</div>";


    // ======================================
    // DECREASE
    // ======================================

    const decreaseButton =
        card.querySelector(
            ".decrease-item"
        );


    decreaseButton.addEventListener(
        "click",
        function () {

            const cart =
                getCart();


            if (
                cart[index] &&
                cart[index].quantity > 1
            ) {

                cart[index].quantity--;

                saveCart(cart);

                loadCart();

            }

        }
    );


    // ======================================
    // INCREASE
    // ======================================

    const increaseButton =
        card.querySelector(
            ".increase-item"
        );


    increaseButton.addEventListener(
        "click",
        function () {

            const cart =
                getCart();


            if (cart[index]) {

                if (
                    cart[index].quantity < 100
                ) {

                    cart[index].quantity++;

                }

                saveCart(cart);

                loadCart();

            }

        }
    );


    // ======================================
    // REMOVE
    // ======================================

    const removeButton =
        card.querySelector(
            ".remove-btn"
        );


    removeButton.addEventListener(
        "click",
        function () {

            const cart =
                getCart();


            cart.splice(
                index,
                1
            );


            saveCart(cart);

            loadCart();

        }
    );


    return card;

}


// ==========================================
// ITEM TOTAL
// ==========================================

function itemTotal(
    price,
    quantity
) {

    return price * quantity;

}


// ==========================================
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    const cart =
        getCart();


    let total =
        0;


    cart.forEach(
        function (item) {

            total +=
                Number(item.quantity) || 0;

        }
    );


    cartCount.textContent =
        total;

}


// ==========================================
// CHECKOUT
// ==========================================

checkoutBtn.addEventListener(
    "click",
    function () {

        const cart =
            getCart();


        if (cart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;

        }


        window.location.href =
            "checkout.html";

    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
    "click",
    async function () {

        try {

            await signOut(auth);


            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                "Unable to logout. Please try again."
            );

        }

    }
);


// ==========================================
// BASIC HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

