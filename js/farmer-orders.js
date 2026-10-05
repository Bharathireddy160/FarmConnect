import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const ordersContainer =
    document.getElementById("ordersContainer");

const totalOrders =
    document.getElementById("totalOrders");

const pendingOrders =
    document.getElementById("pendingOrders");

const shippedOrders =
    document.getElementById("shippedOrders");

const totalRevenue =
    document.getElementById("totalRevenue");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");


let allOrders = [];


/* CHECK LOGIN */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    const userType =
        localStorage.getItem(
            "farmConnectUserType"
        );


    if (userType !== "farmer") {

        window.location.href =
            "customer-dashboard.html";

        return;
    }


    await loadOrders(user.uid);

});


/* LOAD FARMER ORDERS */

async function loadOrders(farmerId) {

    try {

        const ordersRef =
            collection(db, "orders");


        const q =
            query(
                ordersRef,
                where(
                    "farmerId",
                    "==",
                    farmerId
                )
            );


        const snapshot =
            await getDocs(q);


        allOrders = [];


        snapshot.forEach((orderDoc) => {

            allOrders.push({

                id: orderDoc.id,

                ...orderDoc.data()

            });

        });


        updateStatistics();

        displayOrders(allOrders);


    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );


        ordersContainer.innerHTML = `
            <div class="empty">
                <h3>Unable to load orders</h3>
                <p>
                    ${error.message}
                </p>
            </div>
        `;
    }

}


/* STATISTICS */

function updateStatistics() {

    const total =
        allOrders.length;


    const pending =
        allOrders.filter(
            order =>
                order.status === "Pending"
        ).length;


    const shipped =
        allOrders.filter(
            order =>
                order.status === "Out for Delivery"
        ).length;


    let revenue = 0;


    allOrders.forEach(order => {

        if (order.status === "Delivered") {

            revenue +=
                Number(order.total || 0);

        }

    });


    totalOrders.textContent =
        total;

    pendingOrders.textContent =
        pending;

    shippedOrders.textContent =
        shipped;

    totalRevenue.textContent =
        `₹${revenue}`;
}


/* DISPLAY ORDERS */

function displayOrders(orders) {

    ordersContainer.innerHTML = "";


    if (orders.length === 0) {

        ordersContainer.innerHTML = `
            <div class="empty">

                <h2>📦 No Orders Yet</h2>

                <p>
                    Customer orders will appear here.
                </p>

            </div>
        `;

        return;
    }


    orders.forEach(order => {

        const card =
            createOrderCard(order);

        ordersContainer.appendChild(card);

    });

}


/* CREATE ORDER CARD */

function createOrderCard(order) {

    const card =
        document.createElement("div");

    card.className =
        "order-card";


    const status =
        order.status || "Pending";


    const statusClass =
        getStatusClass(status);


    card.innerHTML = `

        <div class="order-header">

            <div>

                <div class="order-id">
                    Order #${order.id}
                </div>

                <div class="order-date">
                    ${formatDate(order.createdAt)}
                </div>

            </div>

            <span class="status ${statusClass}">
                ${status}
            </span>

        </div>


        <div class="order-body">

            <div class="order-section">

                <h4>👤 Customer</h4>

                <p>
                    <strong>
                        ${order.customerName || "Customer"}
                    </strong>
                </p>

                <p>
                    ${order.customerEmail || ""}
                </p>

                <p>
                    📞 ${order.phone || "Not provided"}
                </p>

            </div>


            <div class="order-section">

                <h4>🌾 Product</h4>

                <p>
                    <strong>
                        ${order.productName || "Product"}
                    </strong>
                </p>

                <p>
                    Quantity:
                    ${order.quantity || 0} kg
                </p>

                <p>
                    Price:
                    ₹${order.price || 0} / kg
                </p>

            </div>


            <div class="order-section">

                <h4>📍 Delivery</h4>

                <p>
                    ${order.address || "Address not provided"}
                </p>

                <p>
                    ${order.city || ""}
                </p>

                <p>
                    ${order.pincode || ""}
                </p>

                <p>
                    <strong>
                        Total: ₹${order.total || 0}
                    </strong>
                </p>

            </div>

        </div>


        <div class="order-actions">

            <select class="status-select">

                <option value="Pending"
                    ${status === "Pending" ? "selected" : ""}>
                    Pending
                </option>

                <option value="Accepted"
                    ${status === "Accepted" ? "selected" : ""}>
                    Accepted
                </option>

                <option value="Packed"
                    ${status === "Packed" ? "selected" : ""}>
                    Packed
                </option>

                <option value="Out for Delivery"
                    ${status === "Out for Delivery" ? "selected" : ""}>
                    Out for Delivery
                </option>

                <option value="Delivered"
                    ${status === "Delivered" ? "selected" : ""}>
                    Delivered
                </option>

                <option value="Rejected"
                    ${status === "Rejected" ? "selected" : ""}>
                    Rejected
                </option>

            </select>


            <button
                class="update-btn"
                data-id="${order.id}">
                Update Status
            </button>

        </div>
    `;


    const select =
        card.querySelector(".status-select");


    const updateButton =
        card.querySelector(".update-btn");


    updateButton.addEventListener(
        "click",
        async () => {

            await updateOrderStatus(
                order.id,
                select.value
            );

        }
    );


    return card;
}


/* UPDATE ORDER */

async function updateOrderStatus(
    orderId,
    newStatus
) {

    try {

        await updateDoc(
            doc(
                db,
                "orders",
                orderId
            ),
            {
                status: newStatus
            }
        );


        alert(
            "Order status updated successfully."
        );


        location.reload();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            "Unable to update order status."
        );
    }

}


/* STATUS CLASS */

function getStatusClass(status) {

    switch (status) {

        case "Accepted":
            return "status-accepted";

        case "Packed":
            return "status-packed";

        case "Out for Delivery":
            return "status-out";

        case "Delivered":
            return "status-delivered";

        case "Rejected":
            return "status-rejected";

        default:
            return "status-pending";
    }
}


/* DATE */

function formatDate(timestamp) {

    if (!timestamp) {

        return "Date unavailable";
    }


    try {

        const date =
            timestamp.toDate();

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    } catch {

        return "Date unavailable";
    }

}


/* SEARCH */

searchInput.addEventListener(
    "input",
    filterOrders
);


/* STATUS FILTER */

statusFilter.addEventListener(
    "change",
    filterOrders
);


/* FILTER ORDERS */

function filterOrders() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const filtered =
        allOrders.filter(order => {

            const customer =
                String(
                    order.customerName || ""
                ).toLowerCase();


            const product =
                String(
                    order.productName || ""
                ).toLowerCase();


            const matchesSearch =
                customer.includes(search) ||
                product.includes(search);


            const matchesStatus =
                selectedStatus === "all" ||
                order.status === selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    displayOrders(filtered);
}