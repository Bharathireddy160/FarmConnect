import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


const profileForm =
    document.getElementById("profileForm");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const phoneInput =
    document.getElementById("phone");

const farmNameInput =
    document.getElementById("farmName");

const locationInput =
    document.getElementById("location");

const cityInput =
    document.getElementById("city");

const addressInput =
    document.getElementById("address");

const aboutInput =
    document.getElementById("about");

const displayName =
    document.getElementById("displayName");

const displayEmail =
    document.getElementById("displayEmail");

const profileInitial =
    document.getElementById("profileInitial");

const saveBtn =
    document.getElementById("saveBtn");

const message =
    document.getElementById("message");


let currentUser = null;


/* CHECK LOGIN */

onAuthStateChanged(
    auth,
    async (user) => {

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


        currentUser = user;

        await loadProfile(user.uid);

    }
);


/* LOAD PROFILE */

async function loadProfile(uid) {

    try {

        const userRef =
            doc(
                db,
                "users",
                uid
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


        const data =
            userSnapshot.data();


        const farmerName =
            data.name ||
            data.fullName ||
            data.username ||
            localStorage.getItem(
                "farmConnectUserName"
            ) ||
            currentUser.email.split("@")[0];


        nameInput.value =
            farmerName;


        emailInput.value =
            data.email ||
            currentUser.email;


        phoneInput.value =
            data.phone ||
            "";


        farmNameInput.value =
            data.farmName ||
            "";


        locationInput.value =
            data.location ||
            data.farmLocation ||
            "";


        cityInput.value =
            data.city ||
            "";


        addressInput.value =
            data.address ||
            "";


        aboutInput.value =
            data.about ||
            data.description ||
            "";


        displayName.textContent =
            farmerName;


        displayEmail.textContent =
            data.email ||
            currentUser.email;


        profileInitial.textContent =
            farmerName
                .charAt(0)
                .toUpperCase();


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        showMessage(
            "Unable to load profile.",
            "error"
        );

    }

}


/* SAVE PROFILE */

profileForm.addEventListener(
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
            nameInput.value.trim();

        const phone =
            phoneInput.value.trim();

        const farmName =
            farmNameInput.value.trim();

        const location =
            locationInput.value.trim();

        const city =
            cityInput.value.trim();

        const address =
            addressInput.value.trim();

        const about =
            aboutInput.value.trim();


        if (!name) {

            showMessage(
                "Please enter your name.",
                "error"
            );

            nameInput.focus();

            return;
        }


        saveBtn.disabled = true;

        saveBtn.textContent =
            "Saving...";


        try {

            const userRef =
                doc(
                    db,
                    "users",
                    currentUser.uid
                );


            await updateDoc(
                userRef,
                {

                    name: name,

                    phone: phone,

                    farmName: farmName,

                    location: location,

                    city: city,

                    address: address,

                    about: about

                }
            );


            /*
             * Update localStorage too,
             * because dashboard uses it.
             */

            localStorage.setItem(
                "farmConnectUserName",
                name
            );


            displayName.textContent =
                name;


            displayEmail.textContent =
                emailInput.value;


            profileInitial.textContent =
                name
                    .charAt(0)
                    .toUpperCase();


            showMessage(
                "Profile updated successfully! ✅",
                "success"
            );


        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to update profile.",
                "error"
            );

        } finally {

            saveBtn.disabled = false;

            saveBtn.textContent =
                "Save Changes";

        }

    }
);


/* MESSAGE */

function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        `message ${type}`;

}