
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// ===============================
// HTML ELEMENTS
// ===============================

const customerName =
    document.getElementById("customerName");

const userInitial =
    document.getElementById("userInitial");

const productCount =
    document.getElementById("productCount");

const categoryCount =
    document.getElementById("categoryCount");

const cartItems =
    document.getElementById("cartItems");

const cartCount =
    document.getElementById("cartCount");

const productGrid =
    document.getElementById("productGrid");

const logoutBtn =
    document.getElementById("logoutBtn");


// ===============================
// CHECK LOGIN
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;
    }


    console.log("Logged in customer:", user);


    // Load customer information
    await loadCustomer(user);


    // Load products
    await loadProducts();


    // Load cart
    loadCart();
});


// ===============================
// LOAD CUSTOMER
// ===============================

async function loadCustomer(user) {

    let name = "";


    try {

        // --------------------------------
        // FIRST: FIREBASE AUTH NAME
        // --------------------------------

        if (user.displayName) {
            name = user.displayName.trim();
        }


        // --------------------------------
        // SECOND: FIRESTORE USER PROFILE
        // --------------------------------

        if (!name) {

            const userRef =
                doc(db, "users", user.uid);

            const userSnap =
                await getDoc(userRef);


            if (userSnap.exists()) {

                const data =
                    userSnap.data();

                console.log(
                    "Customer Firestore data:",
                    data
                );


                name =
                    data.name ||
                    data.fullName ||
                    data.username ||
                    "";
            }
        }


        // --------------------------------
        // THIRD: LOCAL STORAGE
        // --------------------------------

        if (!name) {

            name =
                localStorage.getItem(
                    "farmConnectUserName"
                ) || "";
        }


        // --------------------------------
        // FOURTH: EMAIL
        // --------------------------------

        if (!name && user.email) {

            name =
                user.email
                    .split("@")[0];
        }


        // --------------------------------
        // FINAL FALLBACK
        // --------------------------------

        if (!name) {
            name = "Customer";
        }


        // --------------------------------
        // DISPLAY NAME
        // --------------------------------

        customerName.textContent = name;


        // --------------------------------
        // DISPLAY INITIAL
        // --------------------------------

        userInitial.textContent =
            name.charAt(0).toUpperCase();


        console.log(
            "Customer name displayed:",
            name
        );

    } catch (error) {

        console.error(
            "Error loading customer:",
            error
        );

        customerName.textContent =
            "Customer";

        userInitial.textContent =
            "C";
    }
}


// ===============================
// LOAD PRODUCTS
// ===============================

async function loadProducts() {

    try {

        const productsRef =
            collection(db, "products");

        const q =
            query(
                productsRef,
                where("available", "==", true)
            );

        const snapshot =
            await getDocs(q);


        const products = [];

        const categories =
            new Set();


        snapshot.forEach((docSnap) => {

            const product =
                docSnap.data();

            products.push({
                id: docSnap.id,
                ...product
            });


            if (product.category) {
                categories.add(
                    product.category
                );
            }
        });


        // -------------------------------
        // STATISTICS
        // -------------------------------

        productCount.textContent =
            products.length;

        categoryCount.textContent =
            categories.size;


        // -------------------------------
        // DISPLAY PRODUCTS
        // -------------------------------

        if (products.length === 0) {

            productGrid.innerHTML = `
                <div class="loading">
                    🌱 No products available yet.
                </div>
            `;

            return;
        }


        productGrid.innerHTML =
            products
                .slice(0, 6)
                .map(createProductCard)
                .join("");


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        productGrid.innerHTML = `
            <div class="loading">
                ⚠️ Unable to load products.
            </div>
        `;
    }
}


// ===============================
// PRODUCT CARD
// ===============================

function createProductCard(product) {

    const image =
        product.image ||
        "🌾";

    const name =
        product.name ||
        "Farm Product";

    const category =
        product.category ||
        "Agriculture";

    const location =
        product.location ||
        "Local Farmer";

    const price =
        product.price ||
        0;

    const unit =
        product.unit ||
        "kg";


    return `
        <div class="product-card">

            <div class="product-image">

                ${
                    product.image
                    ? `<img src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(name)}">`
                    : image
                }

            </div>

            <div class="product-info">

                <span>
                    ${escapeHTML(category)}
                </span>

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <p>
                    📍 ${escapeHTML(location)}
                </p>

                <div class="price">
                    ₹${price} / ${escapeHTML(unit)}
                </div>

                <a
                    href="product-details.html?id=${encodeURIComponent(product.id)}"
                    class="view-product-btn"
                >
                    View Product →
                </a>

            </div>

        </div>
    `;
}


// ===============================
// CART
// ===============================

function loadCart() {

    try {

        const cart =
            JSON.parse(
                localStorage.getItem(
                    "farmConnectCart"
                )
            ) || [];


        const totalItems =
            cart.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 1),
                0
            );


        if (cartItems) {
            cartItems.textContent =
                totalItems;
        }


        if (cartCount) {
            cartCount.textContent =
                totalItems;
        }

    } catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

    }
}


// ===============================
// LOGOUT
// ===============================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                localStorage.removeItem(
                    "farmConnectUserType"
                );

                localStorage.removeItem(
                    "farmConnectUserName"
                );

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );
            }
        }
    );
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

