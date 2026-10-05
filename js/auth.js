
// ======================================================
// FARMCONNECT LOGIN
// ======================================================


// ======================================================
// FIREBASE IMPORTS
// ======================================================

import {

    signInWithEmailAndPassword,

    signOut

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {

    doc,

    getDoc

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


import {

    auth,

    db

} from "./firebase.js";



// ======================================================
// GET HTML ELEMENTS
// ======================================================

const loginBtn =
    document.getElementById("loginBtn");


const emailInput =
    document.getElementById("email");


const passwordInput =
    document.getElementById("password");


const message =
    document.getElementById("message");


const togglePassword =
    document.getElementById("togglePassword");


const typeButtons =
    document.querySelectorAll(".type-btn");



// ======================================================
// DEFAULT ACCOUNT TYPE
// ======================================================

let selectedAccountType = "customer";



// ======================================================
// ACCOUNT TYPE SELECTION
// ======================================================

typeButtons.forEach(button => {

    button.addEventListener("click", () => {


        // Remove active from all buttons

        typeButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        // Add active to selected button

        button.classList.add("active");


        // Get selected account type

        selectedAccountType =
            button.dataset.type;


        console.log(
            "Selected account type:",
            selectedAccountType
        );


        // Clear old error

        clearMessage();

    });

});



// ======================================================
// PASSWORD SHOW / HIDE
// ======================================================

if (
    togglePassword &&
    passwordInput
) {

    togglePassword.addEventListener(
        "click",
        () => {


            if (
                passwordInput.type ===
                "password"
            ) {


                // Show password

                passwordInput.type =
                    "text";


                togglePassword.textContent =
                    "🙈";


                togglePassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            }

            else {


                // Hide password

                passwordInput.type =
                    "password";


                togglePassword.textContent =
                    "👁️";


                togglePassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}



// ======================================================
// LOGIN FUNCTION
// ======================================================

async function loginUser() {


    // ==================================================
    // GET VALUES
    // ==================================================

    const email =
        emailInput.value.trim();


    const password =
        passwordInput.value;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!email) {

        showMessage(
            "Please enter your email address.",
            "error"
        );

        emailInput.focus();

        return;
    }


    if (!isValidEmail(email)) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return;
    }


    if (!password) {

        showMessage(
            "Please enter your password.",
            "error"
        );

        passwordInput.focus();

        return;
    }


    if (!selectedAccountType) {

        showMessage(
            "Please select Customer or Farmer.",
            "error"
        );

        return;
    }



    // ==================================================
    // START LOADING
    // ==================================================

    setLoading(true);


    try {


        console.log(
            "================================="
        );

        console.log(
            "FarmConnect Login Started"
        );

        console.log(
            "Email:",
            email
        );

        console.log(
            "Selected type:",
            selectedAccountType
        );



        // ==================================================
        // FIREBASE AUTHENTICATION
        // ==================================================

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        console.log(
            "Firebase Authentication Successful"
        );


        console.log(
            "User UID:",
            user.uid
        );



        // ==================================================
        // GET FIRESTORE USER PROFILE
        // ==================================================

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(userRef);



        // ==================================================
        // CHECK USER PROFILE
        // ==================================================

        if (!userSnapshot.exists()) {


            console.error(
                "Firestore user profile does not exist."
            );


            await signOut(auth);


            showMessage(
                "Your login account exists, but your FarmConnect profile was not found. Please register again.",
                "error"
            );


            return;
        }



        // ==================================================
        // USER DATA
        // ==================================================

        const userData =
            userSnapshot.data();


        console.log(
            "Firestore User Data:",
            userData
        );



        // ==================================================
        // GET REGISTERED USER TYPE
        // ==================================================
        //
        // Supports:
        //
        // userType: "farmer"
        //
        // OR
        //
        // role: "farmer"
        //
        // ==================================================

        let registeredType =
            userData.userType ||
            userData.role ||
            userData.accountType ||
            "";


        registeredType =
            String(registeredType)
                .trim()
                .toLowerCase();



        // ==================================================
        // VALIDATE REGISTERED TYPE
        // ==================================================

        if (
            registeredType !== "farmer" &&
            registeredType !== "customer"
        ) {


            console.error(
                "Invalid user type:",
                registeredType
            );


            await signOut(auth);


            showMessage(
                "Your account does not have a valid Farmer or Customer role. Please update your profile.",
                "error"
            );


            return;
        }



        // ==================================================
        // CHECK SELECTED TYPE AGAINST REGISTERED TYPE
        // ==================================================

        if (
            selectedAccountType !==
            registeredType
        ) {


            console.log(
                "Account type mismatch"
            );


            await signOut(auth);


            const displayType =
                registeredType
                    .charAt(0)
                    .toUpperCase() +
                registeredType.slice(1);


            showMessage(
                `This account is registered as ${displayType}. Please select ${displayType} to login.`,
                "error"
            );


            return;
        }



        // ==================================================
        // GET USER NAME
        // ==================================================

        const userName =
            userData.name ||
            userData.fullName ||
            userData.username ||
            user.displayName ||
            email.split("@")[0];



        // ==================================================
        // SAVE LOGIN DATA
        // ==================================================

        localStorage.setItem(
            "farmConnectUserId",
            user.uid
        );


        localStorage.setItem(
            "farmConnectUserEmail",
            user.email
        );


        localStorage.setItem(
            "farmConnectUserName",
            userName
        );


        localStorage.setItem(
            "farmConnectUserType",
            registeredType
        );


        // Useful for dashboards

        localStorage.setItem(
            "farmConnectLoggedIn",
            "true"
        );



        console.log(
            "Login information saved."
        );



        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        showMessage(
            `Login successful! Welcome ${userName}.`,
            "success"
        );



        // ==================================================
        // REDIRECT
        // ==================================================

        setTimeout(() => {


            if (
                registeredType ===
                "farmer"
            ) {


                console.log(
                    "Opening Farmer Dashboard..."
                );


                window.location.replace(
                    "farmer-dashboard.html"
                );

            }


            else if (
                registeredType ===
                "customer"
            ) {


                console.log(
                    "Opening Customer Dashboard..."
                );


                window.location.replace(
                    "customer-dashboard.html"
                );

            }

        }, 700);


    }


    // ==================================================
    // FIREBASE ERROR
    // ==================================================

    catch (error) {


        console.error(
            "Firebase Login Error:",
            error
        );


        let errorMessage =
            "Login failed. Please try again.";



        // ==================================================
        // FIREBASE ERROR CODES
        // ==================================================

        switch (error.code) {


            case "auth/invalid-credential":

                errorMessage =
                    "Invalid email or password.";

                break;


            case "auth/invalid-login-credentials":

                errorMessage =
                    "Invalid email or password.";

                break;


            case "auth/user-not-found":

                errorMessage =
                    "No account found with this email.";

                break;


            case "auth/wrong-password":

                errorMessage =
                    "Incorrect password.";

                break;


            case "auth/invalid-email":

                errorMessage =
                    "Please enter a valid email address.";

                break;


            case "auth/user-disabled":

                errorMessage =
                    "This account has been disabled.";

                break;


            case "auth/too-many-requests":

                errorMessage =
                    "Too many login attempts. Please try again later.";

                break;


            case "auth/network-request-failed":

                errorMessage =
                    "Network error. Please check your internet connection.";

                break;


            case "permission-denied":

                errorMessage =
                    "You do not have permission to access your profile.";

                break;


            case "failed-precondition":

                errorMessage =
                    "Firestore is not configured correctly.";

                break;


            default:

                if (
                    error.message
                ) {

                    errorMessage =
                        error.message;

                }

                break;

        }



        // ==================================================
        // SHOW ERROR
        // ==================================================

        showMessage(
            errorMessage,
            "error"
        );

    }


    finally {


        // ==================================================
        // STOP LOADING
        // ==================================================

        setLoading(false);

    }

}



// ======================================================
// LOGIN BUTTON
// ======================================================

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        loginUser
    );

}



// ======================================================
// ENTER KEY LOGIN
// ======================================================

if (emailInput) {

    emailInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                loginUser();

            }

        }
    );

}


if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                loginUser();

            }

        }
    );

}



// ======================================================
// EMAIL VALIDATION
// ======================================================

function isValidEmail(email) {


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return emailPattern.test(email);

}



// ======================================================
// SHOW MESSAGE
// ======================================================

function showMessage(
    text,
    type
) {


    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.className =
        `message ${type}`;

}



// ======================================================
// CLEAR MESSAGE
// ======================================================

function clearMessage() {


    if (!message) {
        return;
    }


    message.textContent =
        "";


    message.className =
        "message";

}



// ======================================================
// LOADING STATE
// ======================================================

function setLoading(
    loading
) {


    if (!loginBtn) {
        return;
    }


    loginBtn.disabled =
        loading;


    if (loading) {

        loginBtn.textContent =
            "Logging in...";

    }

    else {

        loginBtn.textContent =
            "Login";

    }

}

