// ==========================================
// FarmConnect - Farmer Dashboard
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase.js";


// ==========================================
// HTML Elements
// ==========================================

const farmerName =
    document.getElementById("farmerName");

const topFarmerName =
    document.getElementById("topFarmerName");

const productCount =
    document.getElementById("productCount");

const orderCount =
    document.getElementById("orderCount");

const salesAmount =
    document.getElementById("salesAmount");

const customerCount =
    document.getElementById("customerCount");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// CHECK LOGIN
// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        // Get user document

        const userRef =
            doc(db, "users", user.uid);

        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            console.error(
                "Farmer profile not found."
            );

            return;
        }


        const userData =
            userSnapshot.data();


        // ==================================
        // CHECK ROLE
        // ==================================

        if (userData.role !== "farmer") {

            window.location.href =
                "customer-dashboard.html";

            return;
        }


        // ==================================
        // DISPLAY FARMER INFORMATION
        // ==================================

        farmerName.textContent =
            userData.name || "Farmer";


        topFarmerName.textContent =
            userData.name || "Farmer";


        // ==================================
        // LOAD PRODUCTS
        // ==================================

        await loadFarmerProducts(user.uid);


        // ==================================
        // LOAD ORDERS
        // ==================================

        await loadFarmerOrders(user.uid);


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

});


// ==========================================
// LOAD FARMER PRODUCTS
// ==========================================

async function loadFarmerProducts(
    farmerId
) {

    try {

        const productsRef =
            collection(db, "products");


        const q =
            query(
                productsRef,
                where(
                    "farmerId",
                    "==",
                    farmerId
                )
            );


        const snapshot =
            await getDocs(q);


        productCount.textContent =
            snapshot.size;


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

    }

}


// ==========================================
// LOAD FARMER ORDERS
// ==========================================

async function loadFarmerOrders(
    farmerId
) {

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


        orderCount.textContent =
            snapshot.size;


        let totalSales = 0;

        const customers =
            new Set();


        snapshot.forEach((document) => {

            const order =
                document.data();


            if (order.totalAmount) {

                totalSales +=
                    Number(order.totalAmount);

            }


            if (order.customerId) {

                customers.add(
                    order.customerId
                );

            }

        });


        salesAmount.textContent =
            "₹" +
            totalSales.toLocaleString("en-IN");


        customerCount.textContent =
            customers.size;


    } catch (error) {

        console.error(
            "Order loading error:",
            error
        );

    }

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