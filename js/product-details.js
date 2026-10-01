
// ==========================================
// FarmConnect - Product Details
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const loading =
    document.getElementById("loading");

const productSection =
    document.getElementById("productSection");

const errorSection =
    document.getElementById("errorSection");

const productImage =
    document.getElementById("productImage");

const categoryTag =
    document.getElementById("categoryTag");

const productCategory =
    document.getElementById("productCategory");

const productName =
    document.getElementById("productName");

const farmerName =
    document.getElementById("farmerName");

const productLocation =
    document.getElementById("productLocation");

const productPrice =
    document.getElementById("productPrice");

const productUnit =
    document.getElementById("productUnit");

const productDescription =
    document.getElementById("productDescription");

const quantityElement =
    document.getElementById("quantity");

const totalPrice =
    document.getElementById("totalPrice");

const increaseBtn =
    document.getElementById("increaseBtn");

const decreaseBtn =
    document.getElementById("decreaseBtn");

const addToCartBtn =
    document.getElementById("addToCartBtn");

const buyNowBtn =
    document.getElementById("buyNowBtn");

const cartCount =
    document.getElementById("cartCount");

const userInitial =
    document.getElementById("userInitial");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// VARIABLES
// ==========================================

let currentProduct = null;

let quantity = 1;


// ==========================================
// GET PRODUCT ID FROM URL
// ==========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const productId =
    urlParams.get("id");


// ==========================================
// CHECK LOGIN
// ==========================================

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        // Customer initial

        let name =
            "Customer";


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


        updateCartCount();


        if (!productId) {

            showError();

            return;

        }


        await loadProduct();

    }
);


// ==========================================
// LOAD PRODUCT
// ==========================================

async function loadProduct() {

    try {

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        const productSnapshot =
            await getDoc(productRef);


        if (!productSnapshot.exists()) {

            showError();

            return;

        }


        currentProduct =
            productSnapshot.data();


        displayProduct();


    }

    catch (error) {

        console.error(
            "Product error:",
            error
        );


        showError();

    }

}


// ==========================================
// DISPLAY PRODUCT
// ==========================================

function displayProduct() {

    const product =
        currentProduct;


    const name =
        product.name ||
        "Farm Product";


    const category =
        product.category ||
        "Farm Product";


    const farmer =
        product.farmerName ||
        "Local Farmer";


    const location =
        product.location ||
        "Local Farm";


    const price =
        Number(product.price) ||
        0;


    const unit =
        product.unit ||
        "kg";


    const description =
        product.description ||
        "Fresh farm product directly from a local farmer.";


    const image =
        product.image ||
        "";


    // Name

    productName.textContent =
        name;


    // Category

    productCategory.textContent =
        category.toUpperCase();


    categoryTag.textContent =
        category;


    // Farmer

    farmerName.textContent =
        farmer;


    // Location

    productLocation.textContent =
        location;


    // Price

    productPrice.textContent =
        "₹" + price;


    productUnit.textContent =
        "/ " + unit;


    // Description

    productDescription.textContent =
        description;


    // Product image

    if (image) {

        productImage.innerHTML =
            "<img src='" +
            image +
            "' alt='" +
            name +
            "'>";

    }

    else {

        productImage.innerHTML =
            "<div class='product-placeholder'>" +
            "🌱" +
            "</div>";

    }


    // Store price

    currentProduct.price =
        price;


    currentProduct.unit =
        unit;


    // Total

    updateTotal();


    // Hide loading

    loading.classList.add(
        "hidden"
    );


    // Show product

    productSection.classList.remove(
        "hidden"
    );

}


// ==========================================
// UPDATE TOTAL
// ==========================================

function updateTotal() {

    if (!currentProduct) {

        return;

    }


    const price =
        Number(
            currentProduct.price
        ) || 0;


    const total =
        price * quantity;


    quantityElement.textContent =
        quantity;


    totalPrice.textContent =
        "₹" + total;

}


// ==========================================
// INCREASE QUANTITY
// ==========================================

increaseBtn.addEventListener(
    "click",
    function () {

        if (quantity < 100) {

            quantity++;

            updateTotal();

        }

    }
);


// ==========================================
// DECREASE QUANTITY
// ==========================================

decreaseBtn.addEventListener(
    "click",
    function () {

        if (quantity > 1) {

            quantity--;

            updateTotal();

        }

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
            "Cart reading error:",
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
// ADD TO CART
// ==========================================

addToCartBtn.addEventListener(
    "click",
    function () {

        if (!currentProduct) {

            return;

        }


        const cart =
            getCart();


        const existingItem =
            cart.find(
                function (item) {

                    return (
                        item.id === productId
                    );

                }
            );


        if (existingItem) {

            existingItem.quantity +=
                quantity;

        }

        else {

            cart.push({

                id: productId,

                name:
                    currentProduct.name ||
                    "Farm Product",

                price:
                    Number(
                        currentProduct.price
                    ) || 0,

                unit:
                    currentProduct.unit ||
                    "kg",

                image:
                    currentProduct.image ||
                    "",

                farmerName:
                    currentProduct.farmerName ||
                    "Local Farmer",

                location:
                    currentProduct.location ||
                    "Local Farm",

                quantity:
                    quantity

            });

        }


        saveCart(cart);


        updateCartCount();


        alert(
            "🌱 Product added to your cart!"
        );

    }
);


// ==========================================
// BUY NOW
// ==========================================

buyNowBtn.addEventListener(
    "click",
    function () {

        if (!currentProduct) {

            return;

        }


        const cart =
            getCart();


        const existingItem =
            cart.find(
                function (item) {

                    return (
                        item.id === productId
                    );

                }
            );


        if (existingItem) {

            existingItem.quantity =
                quantity;

        }

        else {

            cart.push({

                id: productId,

                name:
                    currentProduct.name ||
                    "Farm Product",

                price:
                    Number(
                        currentProduct.price
                    ) || 0,

                unit:
                    currentProduct.unit ||
                    "kg",

                image:
                    currentProduct.image ||
                    "",

                farmerName:
                    currentProduct.farmerName ||
                    "Local Farmer",

                location:
                    currentProduct.location ||
                    "Local Farm",

                quantity:
                    quantity

            });

        }


        saveCart(cart);


        window.location.href =
            "cart.html";

    }
);


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
// SHOW ERROR
// ==========================================

function showError() {

    loading.classList.add(
        "hidden"
    );


    productSection.classList.add(
        "hidden"
    );


    errorSection.classList.remove(
        "hidden"
    );

}


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

