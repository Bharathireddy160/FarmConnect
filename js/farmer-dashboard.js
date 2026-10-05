import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const farmerName = document.getElementById("sidebarFarmerName");
const farmerInitial = document.getElementById("farmerInitial");
const topInitial = document.getElementById("topInitial");
const welcomeText = document.getElementById("welcomeText");

const productCount = document.getElementById("productCount");
const orderCount = document.getElementById("orderCount");
const pendingCount = document.getElementById("pendingCount");
const revenue = document.getElementById("revenue");

const recentProducts =
    document.getElementById("recentProducts");

const logoutBtn =
    document.getElementById("logoutBtn");


/* CHECK LOGIN */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;
    }

    const savedType =
        localStorage.getItem("farmConnectUserType");

    if (savedType !== "farmer") {

        window.location.href =
            "customer-dashboard.html";

        return;
    }

    const name =
        localStorage.getItem("farmConnectUserName") ||
        user.displayName ||
        user.email.split("@")[0];

    displayFarmer(name);

    await loadProducts(user.uid);

    await loadOrders(user.uid);

});


/* DISPLAY FARMER */

function displayFarmer(name) {

    farmerName.textContent = name;

    welcomeText.textContent =
        `Welcome back, ${name}!`;

    const initial =
        name.charAt(0).toUpperCase();

    farmerInitial.textContent = initial;

    topInitial.textContent = initial;
}


/* LOAD PRODUCTS */

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

        productCount.textContent =
            snapshot.size;

        recentProducts.innerHTML = "";

        if (snapshot.empty) {

            recentProducts.innerHTML =
                `<p class="loading">
                    You have not added any products yet.
                </p>`;

            return;
        }

        let count = 0;

        snapshot.forEach((docSnap) => {

            if (count >= 3) return;

            const product =
                docSnap.data();

            const image =
                product.imageUrl ||
                "images/default-product.jpg";

            const card = document.createElement("div");

            card.className =
                "product-card";

            card.innerHTML = `
                <img src="${image}" alt="${product.name}">

                <div class="product-info">

                    <h3>${product.name}</h3>

                    <p>
                        ${product.category || "Agricultural Product"}
                    </p>

                    <p class="product-price">
                        ₹${product.price} / kg
                    </p>

                </div>
            `;

            recentProducts.appendChild(card);

            count++;

        });

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        recentProducts.innerHTML =
            `<p class="loading">
                Unable to load products.
            </p>`;
    }
}


/* LOAD ORDERS */

async function loadOrders(uid) {

    try {

        const ordersRef =
            collection(db, "orders");

        const q =
            query(
                ordersRef,
                where("farmerId", "==", uid)
            );

        const snapshot =
            await getDocs(q);

        orderCount.textContent =
            snapshot.size;

        let pending = 0;
        let totalRevenue = 0;

        snapshot.forEach((docSnap) => {

            const order =
                docSnap.data();

            if (order.status === "Pending") {

                pending++;

            }

            if (order.status === "Delivered") {

                totalRevenue +=
                    Number(order.total || 0);
            }

        });

        pendingCount.textContent =
            pending;

        revenue.textContent =
            `₹${totalRevenue}`;

    } catch (error) {

        console.log(
            "Orders not available yet:",
            error
        );

    }
}


/* LOGOUT */

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            localStorage.removeItem(
                "farmConnectLoggedIn"
            );

            localStorage.removeItem(
                "farmConnectUserId"
            );

            localStorage.removeItem(
                "farmConnectUserEmail"
            );

            localStorage.removeItem(
                "farmConnectUserName"
            );

            localStorage.removeItem(
                "farmConnectUserType"
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