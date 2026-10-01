
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


const ordersContainer =
    document.getElementById("ordersContainer");

const emptyOrders =
    document.getElementById("emptyOrders");

const logoutBtn =
    document.getElementById("logoutBtn");

const userInitial =
    document.getElementById("userInitial");

const cartCount =
    document.getElementById("cartCount");

const filterButtons =
    document.querySelectorAll(".filter-btn");


let allOrders = [];
let selectedStatus = "all";


/* =========================================================
   AUTHENTICATION
   ========================================================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    userInitial.textContent =
        getInitial(user.displayName || user.email);

    updateCartCount();

    await loadOrders(user.uid);
});


/* =========================================================
   LOAD ORDERS
   ========================================================= */

async function loadOrders(uid) {

    try {

        ordersContainer.innerHTML = `
            <div class="loading">
                🌱 Loading your orders...
            </div>
        `;

        const ordersQuery = query(
            collection(db, "orders"),
            where("customerId", "==", uid)
        );

        const snapshot =
            await getDocs(ordersQuery);

        allOrders = [];

        snapshot.forEach((orderDoc) => {

            allOrders.push({
                id: orderDoc.id,
                ...orderDoc.data()
            });

        });


        /* Newest orders first */

        allOrders.sort((a, b) => {

            const dateA =
                a.createdAt?.toMillis?.() || 0;

            const dateB =
                b.createdAt?.toMillis?.() || 0;

            return dateB - dateA;

        });


        displayOrders();

    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );

        ordersContainer.innerHTML = `
            <div class="loading">
                ❌ Unable to load your orders.
                Please try again.
            </div>
        `;
    }
}


/* =========================================================
   DISPLAY ORDERS
   ========================================================= */

function displayOrders() {

    let orders = allOrders;

    if (selectedStatus !== "all") {

        orders = allOrders.filter(order =>
            String(order.status || "pending").toLowerCase()
            === selectedStatus
        );
    }


    if (orders.length === 0) {

        ordersContainer.innerHTML = "";

        emptyOrders.style.display = "block";

        return;
    }


    emptyOrders.style.display = "none";


    ordersContainer.innerHTML =
        orders.map(createOrderCard).join("");
}


/* =========================================================
   ORDER CARD
   ========================================================= */

function createOrderCard(order) {

    const status =
        String(order.status || "pending")
        .toLowerCase();

    const statusClass =
        `status-${status}`;

    const orderDate =
        formatDate(order.createdAt);

    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    const itemsHTML =
        items.map(item => {

            const name =
                escapeHTML(
                    item.name || "Product"
                );

            const quantity =
                Number(item.quantity || 1);

            const price =
                Number(item.price || 0);

            return `
                <div class="order-item">

                    <div>
                        <div class="item-name">
                            ${name}
                        </div>

                        <div class="item-quantity">
                            Quantity: ${quantity}
                        </div>
                    </div>

                    <div class="item-price">
                        ₹${(price * quantity).toFixed(2)}
                    </div>

                </div>
            `;

        }).join("");


    const total =
        Number(
            order.total ||
            order.totalAmount ||
            calculateTotal(items)
        );


    return `
        <article class="order-card">

            <div class="order-top">

                <div>

                    <div class="order-id">
                        Order #${escapeHTML(
                            order.id.slice(-8).toUpperCase()
                        )}
                    </div>

                    <div class="order-date">
                        ${orderDate}
                    </div>

                </div>


                <span class="order-status ${statusClass}">
                    ${escapeHTML(status)}
                </span>

            </div>


            <div class="order-items">

                ${itemsHTML || `
                    <div class="order-item">
                        <span class="item-name">
                            Order details unavailable
                        </span>
                    </div>
                `}

            </div>


            <div class="order-bottom">

                <span class="order-total-label">
                    Total Amount
                </span>

                <span class="order-total">
                    ₹${total.toFixed(2)}
                </span>

            </div>

        </article>
    `;
}


/* =========================================================
   FILTER BUTTONS
   ========================================================= */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        selectedStatus =
            button.dataset.status;

        displayOrders();

    });

});


/* =========================================================
   CART COUNT
   ========================================================= */

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem("farmConnectCart")
        ) || [];

    const count =
        cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 1),
            0
        );

    cartCount.textContent = count;
}


/* =========================================================
   LOGOUT
   ========================================================= */

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

});


/* =========================================================
   HELPERS
   ========================================================= */

function calculateTotal(items) {

    return items.reduce(
        (total, item) =>
            total +
            Number(item.price || 0) *
            Number(item.quantity || 1),
        0
    );
}


function formatDate(timestamp) {

    if (!timestamp) {
        return "Date unavailable";
    }

    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch {
        return "Date unavailable";
    }
}


function getInitial(name) {

    return name
        ? name.charAt(0).toUpperCase()
        : "C";
}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

