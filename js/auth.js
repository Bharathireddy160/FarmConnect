
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


// ===============================
// ELEMENTS
// ===============================

const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");


// ===============================
// LOGIN
// ===============================

loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const accountType = document.querySelector(
        'input[name="accountType"]:checked'
    )?.value;


    // -------------------------------
    // VALIDATION
    // -------------------------------

    if (!email || !password) {
        showMessage("Please enter email and password.", "error");
        return;
    }

    if (!accountType) {
        showMessage("Please select Customer or Farmer.", "error");
        return;
    }


    // Disable button
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";


    try {

        // -------------------------------
        // FIREBASE LOGIN
        // -------------------------------

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;


        // -------------------------------
        // GET USER DATA FROM FIRESTORE
        // -------------------------------

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const userSnap = await getDoc(userRef);


        if (!userSnap.exists()) {

            await auth.signOut();

            showMessage(
                "User profile not found. Please register again.",
                "error"
            );

            return;
        }


        const userData = userSnap.data();


        // -------------------------------
        // GET USER TYPE
        // -------------------------------

        const registeredType =
            String(userData.userType || "")
                .trim()
                .toLowerCase();

        const selectedType =
            String(accountType)
                .trim()
                .toLowerCase();


        console.log("Selected account type:", selectedType);
        console.log("Registered account type:", registeredType);
        console.log("User data:", userData);


        // -------------------------------
        // CHECK ACCOUNT TYPE
        // -------------------------------

        if (registeredType !== selectedType) {

            await auth.signOut();

            showMessage(
                `This account is registered as ${registeredType || "another account"}. Please select the correct account type.`,
                "error"
            );

            return;
        }


        // -------------------------------
        // SAVE USER TYPE LOCALLY
        // -------------------------------

        localStorage.setItem(
            "farmConnectUserType",
            registeredType
        );


        localStorage.setItem(
            "farmConnectUserName",
            userData.name ||
            userData.fullName ||
            userData.username ||
            user.email?.split("@")[0] ||
            "User"
        );


        // -------------------------------
        // REDIRECT
        // -------------------------------

        if (registeredType === "farmer") {

            console.log("Redirecting to Farmer Dashboard...");

            window.location.href =
                "farmer-dashboard.html";

        } else if (registeredType === "customer") {

            console.log("Redirecting to Customer Dashboard...");

            window.location.href =
                "customer-dashboard.html";

        } else {

            await auth.signOut();

            showMessage(
                "Invalid account type. Please contact support.",
                "error"
            );
        }


    } catch (error) {

        console.error("Login Error:", error);


        let errorMessage =
            "Something went wrong. Please try again.";


        if (error.code === "auth/invalid-credential") {
            errorMessage =
                "Invalid email or password.";
        }

        else if (error.code === "auth/user-not-found") {
            errorMessage =
                "No account found with this email.";
        }

        else if (error.code === "auth/wrong-password") {
            errorMessage =
                "Incorrect password.";
        }

        else if (error.code === "auth/invalid-email") {
            errorMessage =
                "Please enter a valid email address.";
        }

        else if (error.code === "auth/too-many-requests") {
            errorMessage =
                "Too many attempts. Please try again later.";
        }

        else if (error.code === "permission-denied") {
            errorMessage =
                "Permission denied while reading your profile.";
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


// ===============================
// MESSAGE
// ===============================

function showMessage(text, type) {

    if (!message) return;

    message.textContent = text;

    message.className =
        `message ${type}`;
}


// ===============================
// SHOW / HIDE PASSWORD
// ===============================

const togglePassword =
    document.getElementById("togglePassword");

const passwordInput =
    document.getElementById("password");


if (togglePassword && passwordInput) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                togglePassword.textContent = "🙈";

            } else {

                passwordInput.type = "password";

                togglePassword.textContent = "👁️";
            }

        }
    );
}

