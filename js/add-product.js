import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const form =
    document.getElementById("productForm");

const productName =
    document.getElementById("productName");

const category =
    document.getElementById("category");

const price =
    document.getElementById("price");

const quantity =
    document.getElementById("quantity");

const locationInput =
    document.getElementById("location");

const description =
    document.getElementById("description");

const productImage =
    document.getElementById("productImage");

const addProductBtn =
    document.getElementById("addProductBtn");

const message =
    document.getElementById("message");


let currentUser = null;


/* CHECK LOGIN */

onAuthStateChanged(auth, (user) => {

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

    currentUser = user;

});


/* ADD PRODUCT */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        if (!currentUser) {

            showMessage(
                "Please login again.",
                "error"
            );

            return;
        }


        const name =
            productName.value.trim();

        const selectedCategory =
            category.value;

        const productPrice =
            Number(price.value);

        const productQuantity =
            Number(quantity.value);

        const farmLocation =
            locationInput.value.trim();

        const productDescription =
            description.value.trim();


        if (!name ||
            !selectedCategory ||
            productPrice <= 0 ||
            productQuantity <= 0 ||
            !farmLocation ||
            !productDescription) {

            showMessage(
                "Please fill all fields correctly.",
                "error"
            );

            return;
        }


        addProductBtn.disabled = true;

        addProductBtn.textContent =
            "Adding Product...";


        try {

            const farmerName =
                localStorage.getItem(
                    "farmConnectUserName"
                ) ||
                currentUser.email
                    .split("@")[0];


            /*
             * For now we use a placeholder image.
             *
             * Firebase Storage image upload
             * will be added in the next improvement.
             */

            const imageUrl =
                "images/default-product.jpg";


            await addDoc(
                collection(db, "products"),
                {

                    name: name,

                    category:
                        selectedCategory,

                    price:
                        productPrice,

                    quantity:
                        productQuantity,

                    location:
                        farmLocation,

                    description:
                        productDescription,

                    imageUrl:
                        imageUrl,

                    farmerId:
                        currentUser.uid,

                    farmerName:
                        farmerName,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }
            );


            showMessage(
                "Product added successfully! 🌾",
                "success"
            );


            form.reset();


            setTimeout(() => {

                window.location.href =
                    "my-products.html";

            }, 1200);


        } catch (error) {

            console.error(
                "Add product error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to add product.",
                "error"
            );

        } finally {

            addProductBtn.disabled = false;

            addProductBtn.textContent =
                "Add Product";

        }

    }
);


function showMessage(text, type) {

    message.textContent = text;

    message.className = type;
}