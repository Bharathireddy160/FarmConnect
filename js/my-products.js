// ==========================================
// FarmConnect - My Products
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase.js";


// ==========================================
// ELEMENTS
// ==========================================

const productsGrid =
    document.getElementById("productsGrid");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const totalProducts =
    document.getElementById("totalProducts");

const availableProducts =
    document.getElementById("availableProducts");

const unavailableProducts =
    document.getElementById("unavailableProducts");

const resultText =
    document.getElementById("resultText");

const logoutBtn =
    document.getElementById("logoutBtn");


// Delete modal

const deleteModal =
    document.getElementById("deleteModal");

const cancelDelete =
    document.getElementById("cancelDelete");

const confirmDelete =
    document.getElementById("confirmDelete");


// ==========================================
// VARIABLES
// ==========================================

let farmerProducts = [];

let productToDelete = null;


// ==========================================
// CHECK LOGIN
// ==========================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        try {

            await loadProducts(
                user.uid
            );

        } catch (error) {

            console.error(
                "Loading products failed:",
                error
            );

            showError();

        }

    }
);


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts(
    farmerId
) {

    const productsRef =
        collection(
            db,
            "products"
        );


    const productsQuery =
        query(
            productsRef,
            where(
                "farmerId",
                "==",
                farmerId
            )
        );


    const snapshot =
        await getDocs(
            productsQuery
        );


    farmerProducts = [];


    snapshot.forEach(
        (documentSnapshot) => {

            farmerProducts.push({

                id:
                    documentSnapshot.id,

                ...documentSnapshot.data()

            });

        }
    );


    // Newest products first

    farmerProducts.sort(
        (a, b) => {

            const timeA =
                a.createdAt?.seconds || 0;

            const timeB =
                b.createdAt?.seconds || 0;

            return timeB - timeA;

        }
    );


    updateStatistics();

    displayProducts(
        farmerProducts
    );

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    const total =
        farmerProducts.length;


    const available =
        farmerProducts.filter(
            product =>
                product.available !== false
        ).length;


    const unavailable =
        total - available;


    totalProducts.textContent =
        total;


    availableProducts.textContent =
        available;


    unavailableProducts.textContent =
        unavailable;

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(
    products
) {

    productsGrid.innerHTML = "";


    if (products.length === 0) {

        productsGrid.style.display =
            "none";

        emptyState.style.display =
            "block";

        resultText.textContent =
            "0 products";

        return;

    }


    productsGrid.style.display =
        "grid";

    emptyState.style.display =
        "none";


    resultText.textContent =
        `${products.length} product${products.length !== 1 ? "s" : ""}`;


    products.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );


            productsGrid.appendChild(
                card
            );

        }
    );

}


// ==========================================
// CREATE PRODUCT CARD
// ==========================================

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    const isAvailable =
        product.available !== false;


    const imageHTML =
        product.image

            ? `
                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    loading="lazy">
              `

            : `
                <div class="no-image">
                    ${getCategoryEmoji(
                        product.category
                    )}
                </div>
              `;


    card.innerHTML = `

        <div class="product-image">

            ${imageHTML}

            <span
                class="product-status
                ${isAvailable ? "" : "unavailable"}">

                ${isAvailable
                    ? "● Available"
                    : "● Unavailable"}

            </span>

        </div>


        <div class="product-body">

            <span class="product-category">

                ${escapeHTML(
                    product.category ||
                    "Product"
                )}

            </span>


            <h3>

                ${escapeHTML(
                    product.name ||
                    "Unnamed Product"
                )}

            </h3>


            <div class="product-location">

                📍
                ${escapeHTML(
                    product.location ||
                    "Location not specified"
                )}

            </div>


            <div class="product-price-row">

                <div class="product-price">

                    ₹${Number(
                        product.price || 0
                    ).toLocaleString("en-IN")}

                    <small>
                        / ${escapeHTML(
                            product.unit || "kg"
                        )}
                    </small>

                </div>


                <div class="product-quantity">

                    ${Number(
                        product.quantity || 0
                    )}

                    ${escapeHTML(
                        product.unit || "kg"
                    )}

                </div>

            </div>

        </div>


        <div class="product-actions">

            <button
                class="product-action edit"
                data-id="${product.id}">

                ✏️ Edit

            </button>


            <button
                class="product-action delete"
                data-id="${product.id}">

                🗑️ Delete

            </button>

        </div>

    `;


    // Edit

    const editButton =
        card.querySelector(
            ".edit"
        );


    editButton.addEventListener(
        "click",
        () => {

            editProduct(
                product.id
            );

        }
    );


    // Delete

    const deleteButton =
        card.querySelector(
            ".delete"
        );


    deleteButton.addEventListener(
        "click",
        () => {

            openDeleteModal(
                product.id
            );

        }
    );


    return card;

}


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    filterProducts
);


// ==========================================
// CATEGORY FILTER
// ==========================================

categoryFilter.addEventListener(
    "change",
    filterProducts
);


// ==========================================
// FILTER PRODUCTS
// ==========================================

function filterProducts() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const category =
        categoryFilter.value;


    const filtered =
        farmerProducts.filter(
            product => {

                const name =
                    (
                        product.name ||
                        ""
                    ).toLowerCase();


                const productCategory =
                    product.category ||
                    "";


                const matchesSearch =
                    name.includes(
                        search
                    );


                const matchesCategory =
                    category === "all" ||
                    productCategory ===
                    category;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    if (filtered.length === 0) {

        productsGrid.style.display =
            "none";

        emptyState.style.display =
            "block";

        resultText.textContent =
            "No matching products";

        return;

    }


    productsGrid.style.display =
        "grid";

    emptyState.style.display =
        "none";


    resultText.textContent =
        `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;


    productsGrid.innerHTML = "";


    filtered.forEach(
        product => {

            productsGrid.appendChild(
                createProductCard(
                    product
                )
            );

        }
    );

}


// ==========================================
// DELETE MODAL
// ==========================================

function openDeleteModal(
    productId
) {

    productToDelete =
        productId;


    deleteModal.classList.add(
        "show"
    );

}


cancelDelete.addEventListener(
    "click",
    () => {

        closeDeleteModal();

    }
);


deleteModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            deleteModal
        ) {

            closeDeleteModal();

        }

    }
);


function closeDeleteModal() {

    deleteModal.classList.remove(
        "show"
    );

    productToDelete =
        null;

}


// ==========================================
// CONFIRM DELETE
// ==========================================

confirmDelete.addEventListener(
    "click",
    async () => {

        if (!productToDelete) {

            return;

        }


        try {

            confirmDelete.disabled =
                true;

            confirmDelete.textContent =
                "Deleting...";


            await deleteDoc(
                doc(
                    db,
                    "products",
                    productToDelete
                )
            );


            farmerProducts =
                farmerProducts.filter(
                    product =>
                        product.id !==
                        productToDelete
                );


            updateStatistics();

            filterProducts();

            closeDeleteModal();


        } catch (error) {

            console.error(
                "Delete failed:",
                error
            );

            alert(
                "Could not delete the product."
            );

        } finally {

            confirmDelete.disabled =
                false;

            confirmDelete.textContent =
                "Delete";

        }

    }
);


// ==========================================
// EDIT PRODUCT
// ==========================================

function editProduct(
    productId
) {

    /*
       We will build the complete
       edit-product.html page next.

       For now, send the selected
       product ID to that page.
    */

    window.location.href =
        `edit-product.html?id=${encodeURIComponent(productId)}`;

}


// ==========================================
// CATEGORY EMOJI
// ==========================================

function getCategoryEmoji(
    category
) {

    const emojis = {

        Vegetables: "🥕",

        Fruits: "🥭",

        Grains: "🌾",

        Pulses: "🫘",

        Spices: "🌶️",

        Dairy: "🥛",

        Other: "🌱"

    };


    return (
        emojis[category] ||
        "🌱"
    );

}


// ==========================================
// SECURITY
// ==========================================

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ==========================================
// ERROR
// ==========================================

function showError() {

    productsGrid.innerHTML = `

        <div class="loading-state">

            <div class="loading-icon">
                ⚠️
            </div>

            <h3>
                Could not load products
            </h3>

            <p>
                Please check your Firebase
                connection and try again.
            </p>

        </div>

    `;

}


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

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