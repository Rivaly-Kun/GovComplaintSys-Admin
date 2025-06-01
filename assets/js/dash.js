
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
  import {getDatabase,ref,remove,set,onValue,get
  } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
 import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
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
  const dashboardTable = document.getElementById('dashboardTable');

  // Realtime listener
const complaintsRef = ref(db, 'complaints');
onValue(complaintsRef, (snapshot) => {
  dashboardTable.innerHTML = ""; // Clear table before re-rendering

  if (snapshot.exists()) {
    const data = snapshot.val();

    Object.keys(data).forEach(uid => {
      const item = data[uid];
      const { name, complaint, timestamp, pin, imageUrl } = item;
      const date = new Date(Number(timestamp));
      const formattedDate = date.toLocaleString();

      const rowHTML = `
        <tr class="${pin ? 'border border-danger border-2 rounded' : ''}">
          <td>
            <div class="d-flex px-2 py-1">
              <div>
                <img src="../assets/img/small-logos/logo-xd.svg" class="avatar avatar-sm me-3" alt="xd">
              </div>
              <div class="d-flex flex-column justify-content-center">
                <h6 class="mb-0 text-sm">${name}</h6>
                <p class="text-xs text-secondary mb-0">Complaint ID: ${uid}</p>
              </div>
            </div>
          </td>
          <td class="text-sm">${complaint}</td>
          <td class="align-middle text-center text-sm">
            <span class="text-xs font-weight-bold">${formattedDate}</span>
          </td>
          <td class="align-middle">
            <div class="d-flex flex-wrap justify-content-around gap-1">
              <button class="btn btn-sm btn-outline-secondary archive-btn" data-id="${uid}">Archive</button>
              <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${uid}">Delete</button>
              <button class="btn btn-sm ${pin ? 'btn-outline-warning' : 'btn-outline-primary'} pin-btn" data-id="${uid}">
                ${pin ? 'Unpin' : 'Pin'}
              </button>
              ${imageUrl ? `
              <button class="btn btn-sm btn-outline-warning view-image-btn" data-img="${imageUrl}">
                View Image
              </button>` : ''}
            </div>
          </td>
        </tr>
      `;

      dashboardTable.insertAdjacentHTML('beforeend', rowHTML);
    });
  } else {
    dashboardTable.innerHTML = `<tr><td colspan="4" class="text-center">No complaints found.</td></tr>`;
  }
}, {
  onlyOnce: false
});


document.addEventListener("click", async (e) => {
  // Handle View Image button
  if (e.target.matches(".view-image-btn")) {
    const imgUrl = e.target.getAttribute("data-img");
    const imgElement = document.getElementById("complaintImage");
    imgElement.src = imgUrl;

    console.log("View Image button clicked");

    const modalElement = document.getElementById("imageModal");
    if (!modalElement) {
      console.error("Modal element not found!");
      return;
    }

    if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
      console.error("Bootstrap modal is not available. Make sure bootstrap.bundle.js is loaded.");
      return;
    }

    const imageModal = new bootstrap.Modal(modalElement);
    imageModal.show();
    return; // Prevent further action
  }

  // For other actions, check if data-id exists
  const key = e.target.getAttribute("data-id");
  if (!key) return;

  const complaintRef = ref(db, `complaints/${key}`);
  const archiveRef = ref(db, `archive/${key}`);
  const pinRef = ref(db, `pin/${key}`);

  // Handle Archive
  if (e.target.classList.contains("archive-btn")) {
    try {
      const snapshot = await get(complaintRef);
      if (snapshot.exists()) {
        await set(archiveRef, snapshot.val());
        await remove(complaintRef);
        alert("Complaint archived successfully.");
      }
    } catch (err) {
      console.error("Archive failed:", err);
    }
  }

  // Handle Delete
  else if (e.target.classList.contains("delete-btn")) {
    try {
      await remove(complaintRef);
      alert("Complaint deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  // Handle Pin/Unpin
  else if (e.target.classList.contains("pin-btn")) {
    try {
      const snapshot = await get(complaintRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const isPinned = data.pin === true;

        data.pin = !isPinned;

        await set(complaintRef, data);
        await set(pinRef, data);

        alert(isPinned ? "Complaint unpinned." : "Complaint pinned.");
      }
    } catch (err) {
      console.error("Pin/Unpin failed:", err);
    }
  }
});


    document.getElementById("LogoutBtn").addEventListener("click", function () {

    window.location.href = "../pages/sign-in.html"; 
  });