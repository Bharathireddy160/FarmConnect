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

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const productGrid =
    document.getElementById("productGrid");


onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    const type =
        localStorage.getItem(
            "farmConnectUserType"
        );


    if (type !== "farmer") {

        window.location.href =
            "customer-dashboard.html";

        return;
    }


    await loadProducts(user.uid);

});


/* LOAD FARMER PRODUCTS */

async function loadProducts(uid) {

    try {

        const productsRef =
            collection(db, "products");


        const q =
            query(
                productsRef,
                where("farmerId", "==", uid)
            );


        const snapshot =
            await getDocs(q);


        productGrid.innerHTML = "";


        if (snapshot.empty) {

            productGrid.innerHTML = `
                <div class="empty">

                    <h2>No Products Yet 🌾</h2>

                    <p>
                        Start by adding your first product.
                    </p>

                </div>
            `;

            return;
        }


        snapshot.forEach((docSnap) => {

            const product =
                docSnap.data();

            createProductCard(
                docSnap.id,
                product
            );

        });


    } catch (error) {

        console.error(
            "Loading products error:",
            error
        );

        productGrid.innerHTML = `
            <p class="empty">
                Unable to load products.
            </p>
        `;

    }

}


/* CREATE PRODUCT CARD */

function createProductCard(
    productId,
    product
) {

    const card =
        document.createElement("div");

    card.className =
        "product-card";


    const image =
        product.imageUrl ||
        "images/default-product.jpg";


    card.innerHTML = `

        <img
            src="${image}"
            alt="${product.name}"
        >

        <div class="product-content">

            <h2>
                ${product.name}
            </h2>

            <p class="category">
                ${product.category}
            </p>

            <p class="price">
                ₹${product.price} / kg
            </p>

            <p class="quantity">
                Available:
                ${product.quantity} kg
            </p>

            <p class="location">
                📍 ${product.location}
            </p>

            <div class="actions">

                <button
                    class="delete-btn"
                    data-id="${productId}">
                    Delete
                </button>

            </div>

        </div>
    `;


    const deleteBtn =
        card.querySelector(".delete-btn");


    deleteBtn.addEventListener(
        "click",
        () => deleteProduct(productId)
    );


    productGrid.appendChild(card);
}


/* DELETE PRODUCT */

async function deleteProduct(productId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmDelete) {

        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                productId
            )
        );


        alert(
            "Product deleted successfully."
        );


        location.reload();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Unable to delete product."
        );

    }

}