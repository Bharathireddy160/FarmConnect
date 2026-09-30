// ==========================================
// FarmConnect - Add Product
// ==========================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";


import {
    auth,
    db,
    storage
} from "./firebase.js";


// ==========================================
// HTML ELEMENTS
// ==========================================

const productForm =
    document.getElementById("productForm");

const productImage =
    document.getElementById("productImage");

const imagePreview =
    document.getElementById("imagePreview");

const productName =
    document.getElementById("productName");

const category =
    document.getElementById("category");

const price =
    document.getElementById("price");

const quantity =
    document.getElementById("quantity");

const unit =
    document.getElementById("unit");

const productLocation =
    document.getElementById("productLocation");

const description =
    document.getElementById("description");

const saveProductBtn =
    document.getElementById("saveProductBtn");

const productMessage =
    document.getElementById("productMessage");

const logoutBtn =
    document.getElementById("logoutBtn");


// ==========================================
// FARMER DATA
// ==========================================

let currentFarmer = null;


// ==========================================
// CHECK AUTHENTICATION
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

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnapshot =
                await getDoc(userRef);


            if (!userSnapshot.exists()) {

                showMessage(
                    "Farmer profile not found.",
                    "error"
                );

                return;
            }


            const userData =
                userSnapshot.data();


            // Check farmer role

            if (
                userData.role !==
                "farmer"
            ) {

                window.location.href =
                    "customer-dashboard.html";

                return;
            }


            currentFarmer = {

                uid: user.uid,

                name:
                    userData.name || "Farmer",

                location:
                    userData.location || ""

            };


            // Automatically fill location

            if (currentFarmer.location) {

                productLocation.value =
                    currentFarmer.location;

            }


        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );

        }

    }
);


// ==========================================
// IMAGE PREVIEW
// ==========================================

productImage.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {

            return;
        }


        // Check file size

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            showMessage(
                "Image must be less than 5 MB.",
                "error"
            );

            this.value = "";

            imagePreview.style.display =
                "none";

            return;
        }


        // Show preview

        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                imagePreview.src =
                    event.target.result;

                imagePreview.style.display =
                    "block";

            };


        reader.readAsDataURL(file);

    }
);


// ==========================================
// SAVE PRODUCT
// ==========================================

productForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // Check farmer

        if (!currentFarmer) {

            showMessage(
                "Please login as a farmer.",
                "error"
            );

            return;
        }


        // Get values

        const name =
            productName.value.trim();

        const selectedCategory =
            category.value;

        const productPrice =
            Number(price.value);

        const productQuantity =
            Number(quantity.value);

        const selectedUnit =
            unit.value;

        const location =
            productLocation.value.trim();

        const productDescription =
            description.value.trim();


        // ======================================
        // VALIDATION
        // ======================================

        if (!name) {

            showMessage(
                "Please enter product name.",
                "error"
            );

            return;
        }


        if (!selectedCategory) {

            showMessage(
                "Please select a category.",
                "error"
            );

            return;
        }


        if (
            !productPrice ||
            productPrice <= 0
        ) {

            showMessage(
                "Please enter a valid price.",
                "error"
            );

            return;
        }


        if (
            !productQuantity ||
            productQuantity <= 0
        ) {

            showMessage(
                "Please enter a valid quantity.",
                "error"
            );

            return;
        }


        if (!location) {

            showMessage(
                "Please enter product location.",
                "error"
            );

            return;
        }


        // ======================================
        // START SAVING
        // ======================================

        try {

            saveProductBtn.disabled =
                true;

            saveProductBtn.textContent =
                "Publishing...";


            let imageURL = "";


            // ==================================
            // UPLOAD IMAGE
            // ==================================

            const imageFile =
                productImage.files[0];


            if (imageFile) {

                const imageName =
                    Date.now() +
                    "_" +
                    imageFile.name
                        .replace(/\s+/g, "_");


                const imageRef =
                    ref(
                        storage,
                        `products/${currentFarmer.uid}/${imageName}`
                    );


                await uploadBytes(
                    imageRef,
                    imageFile
                );


                imageURL =
                    await getDownloadURL(
                        imageRef
                    );

            }


            // ==================================
            // SAVE TO FIRESTORE
            // ==================================

            const productData = {

                farmerId:
                    currentFarmer.uid,

                farmerName:
                    currentFarmer.name,

                name: name,

                category:
                    selectedCategory,

                price:
                    productPrice,

                quantity:
                    productQuantity,

                unit:
                    selectedUnit,

                location:
                    location,

                description:
                    productDescription,

                image:
                    imageURL,

                available:
                    true,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            };


            await addDoc(
                collection(
                    db,
                    "products"
                ),
                productData
            );


            // ==================================
            // SUCCESS
            // ==================================

            showMessage(
                "🌾 Product published successfully!",
                "success"
            );


            // Reset form

            productForm.reset();

            imagePreview.src = "";

            imagePreview.style.display =
                "none";


            // Restore farmer location

            if (
                currentFarmer.location
            ) {

                productLocation.value =
                    currentFarmer.location;

            }


            // Redirect

            setTimeout(
                () => {

                    window.location.href =
                        "my-products.html";

                },
                1500
            );


        } catch (error) {

            console.error(
                "Product upload error:",
                error
            );


            let errorMessage =
                "Could not publish product.";


            if (
                error.code ===
                "storage/unauthorized"
            ) {

                errorMessage =
                    "Storage permission denied. Check Firebase Storage rules.";

            }


            if (
                error.code ===
                "permission-denied"
            ) {

                errorMessage =
                    "Firestore permission denied. Check Firestore rules.";

            }


            showMessage(
                errorMessage,
                "error"
            );


        } finally {

            saveProductBtn.disabled =
                false;

            saveProductBtn.textContent =
                "🌾 Publish Product";

        }

    }
);


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


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    productMessage.textContent =
        text;


    if (type === "success") {

        productMessage.style.color =
            "#2e8b3c";

    } else {

        productMessage.style.color =
            "#d33d3d";

    }

}