
// ==========================================
// FarmConnect - Customer Checkout
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const checkoutItems =
    document.getElementById("checkoutItems");

const summaryItems =
    document.getElementById("summaryItems");

const subtotal =
    document.getElementById("subtotal");

const grandTotal =
    document.getElementById("grandTotal");

const cartCount =
    document.getElementById("cartCount");

const checkoutForm =
    document.getElementById("checkoutForm");

const placeOrderBtn =
    document.getElementById("placeOrderBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const userInitial =
    document.getElementById("userInitial");

const customerName =
    document.getElementById("customerName");

const phone =
    document.getElementById("phone");

const address =
    document.getElementById("address");

const city =
    document.getElementById("city");

const pincode =
    document.getElementById("pincode");


// ==========================================
// VARIABLES
// ==========================================

let currentUser = null;

let cart = [];

let orderTotal = 0;


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


        currentUser = user;


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


        customerName.value =
            user.displayName || "";


        loadCheckout();

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
            "Cart error:",
            error
        );

        return [];

    }

}


// ==========================================
// LOAD CHECKOUT
// ==========================================

function loadCheckout() {

    cart =
        getCart();


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );


        window.location.href =
            "browse-products.html";


        return;

    }


    renderCheckoutItems();


    updateSummary();


    updateCartCount();

}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderCheckoutItems() {

    checkoutItems.innerHTML = "";


    cart.forEach(
        function (item) {

            const quantity =
                Number(item.quantity) || 1;


            const price =
                Number(item.price) || 0;


            const total =
                price * quantity;


            const div =
                document.createElement("div");


            div.className =
                "checkout-item";


            let imageHTML;


            if (item.image) {

                imageHTML =
                    "<img src='" +
                    escapeHTML(item.image) +
                    "' alt='" +
                    escapeHTML(item.name) +
                    "'>";

            }

            else {

                imageHTML =
                    "<div class='checkout-placeholder'>🌱</div>";

            }


            div.innerHTML =

                "<div class='checkout-item-image'>" +

                    imageHTML +

                "</div>" +


                "<div class='checkout-item-info'>" +

                    "<strong>" +
                        escapeHTML(
                            item.name ||
                            "Farm Product"
                        ) +
                    "</strong>" +

                    "<span>" +
                        "Qty: " +
                        quantity +
                        " × ₹" +
                        price +
                    "</span>" +

                "</div>" +


                "<div class='checkout-item-price'>" +

                    "₹" +
                    total +

                "</div>";


            checkoutItems.appendChild(
                div
            );

        }
    );

}


// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {

    let totalItems = 0;

    orderTotal = 0;


    cart.forEach(
        function (item) {

            const quantity =
                Number(item.quantity) || 1;


            const price =
                Number(item.price) || 0;


            totalItems +=
                quantity;


            orderTotal +=
                quantity * price;

        }
    );


    summaryItems.textContent =
        totalItems;


    subtotal.textContent =
        "₹" +
        orderTotal;


    grandTotal.textContent =
        "₹" +
        orderTotal;

}


// ==========================================
// CART COUNT
// ==========================================

function updateCartCount() {

    let total = 0;


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
// PAYMENT METHOD
// ==========================================

function getPaymentMethod() {

    const selected =
        document.querySelector(
            "input[name='payment']:checked"
        );


    if (!selected) {

        return "COD";

    }


    return selected.value;

}


// ==========================================
// PLACE ORDER
// ==========================================

placeOrderBtn.addEventListener(
    "click",
    async function () {

        // Validate form

        if (
            !checkoutForm.checkValidity()
        ) {

            checkoutForm.reportValidity();

            return;

        }


        // Validate phone

        const phoneNumber =
            phone.value.trim();


        if (
            !/^[0-9]{10}$/.test(
                phoneNumber
            )
        ) {

            alert(
                "Please enter a valid 10 digit mobile number."
            );

            phone.focus();

            return;

        }


        // Validate pincode

        const pin =
            pincode.value.trim();


        if (
            !/^[0-9]{6}$/.test(pin)
        ) {

            alert(
                "Please enter a valid 6 digit pincode."
            );

            pincode.focus();

            return;

        }


        if (cart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;

        }


        // Disable button

        placeOrderBtn.disabled =
            true;


        placeOrderBtn.textContent =
            "⏳ Placing Order...";


        try {

            const paymentMethod =
                getPaymentMethod();


            // Create order object

            const orderData = {

                customerId:
                    currentUser.uid,

                customerName:
                    customerName.value.trim(),

                customerEmail:
                    currentUser.email || "",

                phone:
                    phoneNumber,

                deliveryAddress: {

                    address:
                        address.value.trim(),

                    city:
                        city.value.trim(),

                    pincode:
                        pin

                },


                items:
                    cart.map(
                        function (item) {

                            return {

                                productId:
                                    item.id || "",

                                name:
                                    item.name ||
                                    "Farm Product",

                                category:
                                    item.category ||
                                    "Farm Product",

                                price:
                                    Number(
                                        item.price
                                    ) || 0,

                                unit:
                                    item.unit ||
                                    "kg",

                                quantity:
                                    Number(
                                        item.quantity
                                    ) || 1,

                                farmerName:
                                    item.farmerName ||
                                    "Local Farmer",

                                location:
                                    item.location ||
                                    "Local Farm",

                                image:
                                    item.image ||
                                    ""

                            };

                        }
                    ),


                totalItems:
                    cart.reduce(
                        function (total, item) {

                            return (
                                total +
                                (
                                    Number(
                                        item.quantity
                                    ) || 0
                                )
                            );

                        },
                        0
                    ),


                subtotal:
                    orderTotal,


                deliveryCharge:
                    0,


                totalAmount:
                    orderTotal,


                paymentMethod:
                    paymentMethod,


                paymentStatus:
                    paymentMethod === "COD"
                        ? "Pending"
                        : "Pending",


                orderStatus:
                    "Placed",


                createdAt:
                    serverTimestamp()

            };


            // Save to Firestore

            const orderRef =
                await addDoc(
                    collection(
                        db,
                        "orders"
                    ),
                    orderData
                );


            // Clear cart

            localStorage.removeItem(
                "farmConnectCart"
            );


            // Store order ID for confirmation page

            localStorage.setItem(
                "lastFarmConnectOrder",
                orderRef.id
            );


            // Go to confirmation

            window.location.href =
                "order-success.html";

        }

        catch (error) {

            console.error(
                "Order placement error:",
                error
            );


            alert(
                "Unable to place the order.\n\n" +
                "Please check your Firebase Firestore " +
                "configuration and try again."
            );


            placeOrderBtn.disabled =
                false;


            placeOrderBtn.textContent =
                "🌱 Place Order";

        }

    }
);


// ==========================================
// PAYMENT UI
// ==========================================

const paymentOptions =
    document.querySelectorAll(
        ".payment-option"
    );


paymentOptions.forEach(
    function (option) {

        option.addEventListener(
            "click",
            function () {

                paymentOptions.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                option.classList.add(
                    "active"
                );

            }
        );

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
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

