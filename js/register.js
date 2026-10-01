
// ==========================================
// FarmConnect - Registration
// ==========================================

import {
    createUserWithEmailAndPassword,
    updateProfile
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
// GET HTML ELEMENTS
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

const registerMessage =
    document.getElementById("registerMessage");

const typeButtons =
    document.querySelectorAll(".type-btn");


// ==========================================
// DEFAULT USER TYPE
// ==========================================

let selectedUserType = "customer";


// ==========================================
// USER TYPE SELECTION
// ==========================================

typeButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            // Remove active from all buttons

            typeButtons.forEach(
                function (btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


            // Add active to selected button

            button.classList.add(
                "active"
            );


            // Get selected type

            selectedUserType =
                button.dataset.type;


            console.log(
                "Selected user type:",
                selectedUserType
            );

        }
    );

});


// ==========================================
// REGISTER
// ==========================================

registerBtn.addEventListener(
    "click",
    async function () {

        // ----------------------------------
        // GET VALUES
        // ----------------------------------

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


        // ----------------------------------
        // CLEAR OLD MESSAGE
        // ----------------------------------

        showMessage("", "");


        // ----------------------------------
        // VALIDATE NAME
        // ----------------------------------

        if (name.length < 2) {

            showMessage(
                "Please enter your full name.",
                "error"
            );

            nameInput.focus();

            return;

        }


        // ----------------------------------
        // VALIDATE EMAIL
        // ----------------------------------

        if (!isValidEmail(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            emailInput.focus();

            return;

        }


        // ----------------------------------
        // VALIDATE PHONE
        // ----------------------------------

        if (
            !/^[0-9]{10}$/.test(phone)
        ) {

            showMessage(
                "Please enter a valid 10-digit phone number.",
                "error"
            );

            phoneInput.focus();

            return;

        }


        // ----------------------------------
        // VALIDATE LOCATION
        // ----------------------------------

        if (location.length < 2) {

            showMessage(
                "Please enter your location.",
                "error"
            );

            locationInput.focus();

            return;

        }


        // ----------------------------------
        // VALIDATE PASSWORD
        // ----------------------------------

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            passwordInput.focus();

            return;

        }


        // ----------------------------------
        // CONFIRM PASSWORD
        // ----------------------------------

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            confirmPasswordInput.focus();

            return;

        }


        // ----------------------------------
        // DISABLE BUTTON
        // ----------------------------------

        registerBtn.disabled =
            true;

        registerBtn.textContent =
            "Creating Account...";


        try {

            // --------------------------------
            // CREATE FIREBASE AUTH USER
            // --------------------------------

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            console.log(
                "Firebase user created:",
                user.uid
            );


            // --------------------------------
            // SAVE NAME IN FIREBASE AUTH
            // --------------------------------

            await updateProfile(
                user,
                {
                    displayName: name
                }
            );


            // --------------------------------
            // SAVE USER PROFILE IN FIRESTORE
            // --------------------------------

            await setDoc(
                doc(
                    db,
                    "users",
                    user.uid
                ),
                {

                    uid:
                        user.uid,

                    name:
                        name,

                    fullName:
                        name,

                    email:
                        email,

                    phone:
                        phone,

                    location:
                        location,

                    userType:
                        selectedUserType,

                    createdAt:
                        serverTimestamp()

                }
            );


            // --------------------------------
            // SUCCESS
            // --------------------------------

            showMessage(
                "Account created successfully! Redirecting...",
                "success"
            );


            // --------------------------------
            // REDIRECT
            // --------------------------------

            setTimeout(
                function () {

                    if (
                        selectedUserType ===
                        "farmer"
                    ) {

                        window.location.href =
                            "farmer-dashboard.html";

                    }

                    else {

                        window.location.href =
                            "customer-dashboard.html";

                    }

                },
                1200
            );

        }

        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            let message =
                "Unable to create account.";


            // Firebase error messages

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                message =
                    "This email is already registered.";

            }

            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Please enter a valid email address.";

            }

            else if (
                error.code ===
                "auth/weak-password"
            ) {

                message =
                    "Password is too weak. Use at least 6 characters.";

            }

            else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                message =
                    "Network error. Please check your internet connection.";

            }


            showMessage(
                message,
                "error"
            );


            registerBtn.disabled =
                false;

            registerBtn.textContent =
                "Create Account";

        }

    }
);


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(
    text,
    type
) {

    if (!registerMessage) {

        return;

    }


    registerMessage.textContent =
        text;


    registerMessage.className =
        "message";


    if (type) {

        registerMessage.classList.add(
            type
        );

    }

}


// ==========================================
// EMAIL VALIDATION
// ==========================================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}

