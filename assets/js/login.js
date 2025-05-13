import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB2-1bdDytMmVsyl9_MlkDkhEb_UE38vY4",
  authDomain: "carrentalrentswift.firebaseapp.com",
  databaseURL: "https://carrentalrentswift-default-rtdb.asia-southeast1.firebasedatabase.app/", 
  projectId: "carrentalrentswift",
  storageBucket: "carrentalrentswift.appspot.com",
  messagingSenderId: "786783178278",
  appId: "1:786783178278:web:033b557e9591d35aaf20e7",
  measurementId: "G-KPZCMLPFQY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Login button event
document.querySelector("button").addEventListener("click", async () => {
  const inputEmail = document.querySelector('input[type="email"]').value.trim();
  const inputPass = document.querySelector('input[type="password"]').value.trim();

  try {
    const snapshot = await get(child(ref(db), 'admin'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const dbEmail = data.email;
      const dbPass = data.pass;

      if (inputEmail === dbEmail && inputPass === dbPass) {
        alert("Login successful!");
        // Redirect or perform login success logic here
        window.location.href = "../pages/dashboard.html";

      } else {
        alert("Invalid email or password.");
      }
    } else {
      alert("Admin data not found.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Something went wrong.");
  }
});
