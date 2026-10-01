```javascript
// ==========================================
// FarmConnect - Browse Products
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const productGrid =
    document.getElementById("productGrid");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const sortFilter =
    document.getElementById("sortFilter");

const resultCount =
    document.getElementById("resultCount");

const cartCount =
    document.getElementById("cartCount");

const userInitial =
    document.getElementById("userInitial");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// VARIABLES
// ==========================================

let allProducts = [];


// ==========================================
// CHECK LOGIN
// ==========================================

onAuthStateChanged(auth, async function (user) {

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    // User initial

    let name = "Customer";


    if (user.displayName) {

        name =
            user.displayName;

    }

    else if (user.email) {

        name =
            user.email.split("@")[0];

    }


    if (userInitial) {

        userInitial.textContent =
            name.charAt(0).toUpperCase();

    }


    // Load products

    await loadProducts();


    // Load cart

    updateCartCount();

});


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    try {

        productGrid.innerHTML =
            "<div class='loading'>" +
            "🌱 Loading fresh products..." +
            "</div>";


        const productsRef =
            collection(db, "products");


        const productQuery =
            query(
                productsRef,
                where("available", "==", true)
            );


        const snapshot =
            await getDocs(productQuery);


        allProducts = [];


        snapshot.forEach(function (doc) {

            const product =
                doc.data();


            product.id =
                doc.id;


            allProducts.push(product);

        });


        createCategories();


        displayProducts(allProducts);

    }

    catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        productGrid.innerHTML =
            "<div class='empty-state'>" +
            "<div class='icon'>⚠️</div>" +
            "<h3>Unable to Load Products</h3>" +
            "<p>" +
            "Please check your Firebase Firestore configuration." +
            "</p>" +
            "</div>";

    }

}


// ==========================================
// CREATE CATEGORY OPTIONS
// ==========================================

function createCategories() {

    const categories =
        new Set();


    allProducts.forEach(function (product) {

        if (product.category) {

            categories.add(
                product.category
            );

        }

    });


    categories.forEach(function (category) {

        const option =
            document.createElement("option");


        option.value =
            category;


        option.textContent =
            category;


        categoryFilter.appendChild(
            option
        );

    });

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(products) {

    productGrid.innerHTML = "";


    if (resultCount) {

        resultCount.textContent =
            products.length;

    }


    if (products.length === 0) {

        productGrid.innerHTML =
            "<div class='empty-state'>" +
            "<div class='icon'>🌱</div>" +
            "<h3>No Products Found</h3>" +
            "<p>Try another search or category.</p>" +
            "</div>";

        return;

    }


    products.forEach(function (product) {

        createProductCard(product);

    });

}


// ==========================================
// CREATE PRODUCT CARD
// ==========================================

function createProductCard(product) {

    const card =
        document.createElement("div");


    card.className =
        "product-card";


    const name =
        product.name || "Farm Product";


    const category =
        product.category || "Farm Product";


    const farmerName =
        product.farmerName || "Local Farmer";


    const location =
        product.location || "Local Farm";


    const price =
        product.price || 0;


    const unit =
        product.unit || "kg";


    const image =
        product.image || "";


    // Image section

    let imageHTML;


    if (image) {

        imageHTML =
            "<img src='" +
            image +
            "' alt='" +
            name +
            "'>";

    }

    else {

        imageHTML =
            "<div class='product-placeholder'>" +
            "🌱" +
            "</div>";

    }


    card.innerHTML =
        "<div class='product-image'>" +

        imageHTML +

        "<span class='category-tag'>" +
        category +
        "</span>" +

        "</div>" +

        "<div class='product-info'>" +

        "<h3>" +
        name +
        "</h3>" +

        "<p class='farmer-name'>" +
        "👨‍🌾 " +
        farmerName +
        "</p>" +

        "<p class='location'>" +
        "📍 " +
        location +
        "</p>" +

        "<div class='product-bottom'>" +

        "<div class='price'>" +

        "<strong>₹" +
        price +
        "</strong>" +

        "<span> / " +
        unit +
        "</span>" +

        "</div>" +

        "<button class='view-btn'>" +
        "View Details" +
        "</button>" +

        "</div>" +

        "</div>";


    productGrid.appendChild(card);


    const viewButton =
        card.querySelector(".view-btn");


    viewButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "product-details.html?id=" +
                product.id;

        }
    );

}


// ==========================================
// SEARCH
// ==========================================

function filterProducts() {

    const searchText =
        searchInput.value
        .toLowerCase()
        .trim();


    const category =
        categoryFilter.value;


    let filtered =
        allProducts.filter(
            function (product) {

                const name =
                    (product.name || "")
                    .toLowerCase();


                const productCategory =
                    (product.category || "")
                    .toLowerCase();


                const location =
                    (product.location || "")
                    .toLowerCase();


                const matchesSearch =
                    name.includes(searchText) ||
                    productCategory.includes(searchText) ||
                    location.includes(searchText);


                const matchesCategory =
                    category === "all" ||
                    product.category === category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    // Sorting

    const sort =
        sortFilter.value;


    if (sort === "low") {

        filtered.sort(
            function (a, b) {

                return (
                    Number(a.price || 0) -
                    Number(b.price || 0)
                );

            }
        );

    }


    else if (sort === "high") {

        filtered.sort(
            function (a, b) {

                return (
                    Number(b.price || 0) -
                    Number(a.price || 0)
                );

            }
        );

    }


    else if (sort === "name") {

        filtered.sort(
            function (a, b) {

                return (
                    (a.name || "")
                    .localeCompare(
                        b.name || ""
                    )
                );

            }
        );

    }


    displayProducts(filtered);

}


// ==========================================
// SEARCH EVENTS
// ==========================================

searchInput.addEventListener(
    "input",
    filterProducts
);


categoryFilter.addEventListener(
    "change",
    filterProducts
);


sortFilter.addEventListener(
    "change",
    filterProducts
);


// ==========================================
// CART COUNT
// ==========================================

function updateCartCount() {

    try {

        const savedCart =
            localStorage.getItem(
                "farmConnectCart"
            );


        const cart =
            savedCart
            ? JSON.parse(savedCart)
            : [];


        let total =
            0;


        cart.forEach(function (item) {

            total +=
                Number(item.quantity) || 0;

        });


        if (cartCount) {

            cartCount.textContent =
                total;

        }

    }

    catch (error) {

        console.error(
            "Cart count error:",
            error
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

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
                    "Unable to logout."
                );

            }

        }
    );

}
```
