// ==========================================
// FarmConnect Authentication
// ==========================================

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase.js";


// ==========================================
// Elements
// ==========================================

const loginBtn =
    document.getElementById("loginBtn");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const message =
    document.getElementById("message");

const typeButtons =
    document.querySelectorAll(".type-btn");


// Default user type

let selectedUserType = "customer";


// ==========================================
// Select Farmer / Customer
// ==========================================

typeButtons.forEach(button => {

    button.addEventListener("click", function () {

        typeButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        this.classList.add("active");


        selectedUserType =
            this.dataset.type;

    });

});


// ==========================================
// Login
// ==========================================

loginBtn.addEventListener("click", async function () {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    // Validation

    if (!email || !password) {

        showMessage(
            "Please enter email and password.",
            "error"
        );

        return;
    }


    try {

        loginBtn.disabled = true;

        loginBtn.textContent = "Logging in...";


        // Firebase login

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // Get user information

        const userRef =
            doc(db, "users", user.uid);


        const userSnapshot =
            await getDoc(userRef);


        if (!userSnapshot.exists()) {

            showMessage(
                "User profile not found.",
                "error"
            );

            return;
        }


        const userData =
            userSnapshot.data();


        // Check selected role

        if (
            userData.role !==
            selectedUserType
        ) {

            showMessage(
                `This account is registered as ${userData.role}. Please select the correct option.`,
                "error"
            );

            return;
        }


        showMessage(
            "Login successful! Redirecting...",
            "success"
        );


        // Redirect

        setTimeout(() => {

            if (userData.role === "farmer") {

                window.location.href =
                    "farmer-dashboard.html";

            } else {

                window.location.href =
                    "customer-dashboard.html";

            }

        }, 1000);


    } catch (error) {

        console.error(error);


        let errorMessage =
            "Login failed. Please try again.";


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            errorMessage =
                "Incorrect email or password.";

        }


        if (
            error.code ===
            "auth/user-not-found"
        ) {

            errorMessage =
                "No account found with this email.";

        }


        if (
            error.code ===
            "auth/wrong-password"
        ) {

            errorMessage =
                "Incorrect password.";

        }


        showMessage(
            errorMessage,
            "error"
        );

    } finally {

        loginBtn.disabled = false;

        loginBtn.textContent = "Login";

    }

});


// ==========================================
// Show Message
// ==========================================

function showMessage(text, type) {

    message.textContent = text;


    if (type === "success") {

        message.style.color = "#2f8a3a";

    } else {

        message.style.color = "#d43d3d";

    }

}