// ==========================================
// FarmConnect Registration
// ==========================================

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase.js";


// ==========================================
// HTML Elements
// ==========================================

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const locationInput =
    document.getElementById("location");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const registerBtn =
    document.getElementById("registerBtn");

const message =
    document.getElementById("registerMessage");

const typeButtons =
    document.querySelectorAll(".type-btn");


// ==========================================
// Default Role
// ==========================================

let selectedUserType = "customer";


// ==========================================
// Farmer / Customer Selection
// ==========================================

typeButtons.forEach(button => {

    button.addEventListener("click", function () {

        // Remove active from all buttons

        typeButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        // Activate selected button

        this.classList.add("active");


        // Get selected role

        selectedUserType =
            this.dataset.type;

    });

});


// ==========================================
// Registration
// ==========================================

registerBtn.addEventListener(
    "click",
    async function () {

        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const phone =
            phoneInput.value.trim();

        const location =
            locationInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !name ||
            !email ||
            !phone ||
            !location ||
            !password ||
            !confirmPassword
        ) {

            showMessage(
                "Please fill all fields.",
                "error"
            );

            return;
        }


        // Phone validation

        if (!/^[0-9]{10}$/.test(phone)) {

            showMessage(
                "Please enter a valid 10-digit phone number.",
                "error"
            );

            return;
        }


        // Password validation

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        // Password confirmation

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        try {

            // Disable button

            registerBtn.disabled = true;

            registerBtn.textContent =
                "Creating Account...";


            // ==================================
            // CREATE FIREBASE AUTH ACCOUNT
            // ==================================

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            // ==================================
            // CREATE FIRESTORE USER DOCUMENT
            // ==================================

            await setDoc(
                doc(db, "users", user.uid),
                {

                    uid: user.uid,

                    name: name,

                    email: email,

                    phone: phone,

                    location: location,

                    role: selectedUserType,

                    profileImage: "",

                    createdAt:
                        serverTimestamp()

                }
            );


            // ==================================
            // SUCCESS
            // ==================================

            showMessage(
                "Account created successfully!",
                "success"
            );


            // Redirect based on role

            setTimeout(() => {

                if (
                    selectedUserType ===
                    "farmer"
                ) {

                    window.location.href =
                        "farmer-dashboard.html";

                } else {

                    window.location.href =
                        "customer-dashboard.html";

                }

            }, 1500);


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            let errorMessage =
                "Registration failed. Please try again.";


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                errorMessage =
                    "This email is already registered.";

            }


            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                errorMessage =
                    "Please enter a valid email address.";

            }


            else if (
                error.code ===
                "auth/weak-password"
            ) {

                errorMessage =
                    "Password is too weak.";

            }


            else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                errorMessage =
                    "Network error. Check your internet connection.";

            }


            showMessage(
                errorMessage,
                "error"
            );


        } finally {

            registerBtn.disabled = false;

            registerBtn.textContent =
                "Create Account";

        }

    }
);


// ==========================================
// Display Message
// ==========================================

function showMessage(text, type) {

    message.textContent = text;


    if (type === "success") {

        message.style.color =
            "#2e8b3c";

    } else {

        message.style.color =
            "#d43d3d";

    }

}