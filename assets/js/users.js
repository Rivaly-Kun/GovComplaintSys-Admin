import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, remove,update  } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB2-1bdDytMmVsyl9_MlkDkhEb_UE38vY4",
  authDomain: "carrentalrentswift.firebaseapp.com",
  databaseURL: "https://carrentalrentswift-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "carrentalrentswift",
  storageBucket: "carrentalrentswift.appspot.com",
  messagingSenderId: "786783178278",
  appId: "1:786783178278:web:033b557e9591d35aaf20e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Elements
const usersList = document.getElementById('archivedtbl');
const reportsList = document.getElementById('pinnedtbl');

// Load Users
onValue(ref(db, 'users'), (snapshot) => {
  usersList.innerHTML = "";
  if (snapshot.exists()) {
    const data = snapshot.val();
    Object.keys(data).forEach(userId => {
      const user = data[userId];
      usersList.insertAdjacentHTML('beforeend', `
        <li class="list-group-item border-0 d-flex p-4 mb-2 mt-3 bg-gray-100 border-radius-lg">
          <div class="d-flex flex-column">
            <h6 class="mb-3 text-sm">${user.name || 'Anonymous'}</h6>
            <span class="mb-2 text-xs">Email: <span class="text-dark font-weight-bold ms-sm-2">${user.email || 'N/A'}</span></span>
            <span class="text-xs">Role: <span class="text-dark ms-sm-2 font-weight-bold">${user.role || 'User'}</span></span>
          </div>
          <div class="ms-auto text-end">
            <a class="btn btn-link text-danger text-gradient px-3 mb-0" href="javascript:;" data-id="${userId}" data-type="user-delete">
              <i class="material-symbols-rounded text-sm me-2">delete</i>Delete
            </a>
          </div>
        </li>
      `);
    });
  } else {
    usersList.innerHTML = `
      <li class="list-group-item border-0 text-center text-muted">
        No users found.
      </li>
    `;
  }
});

// Load Reports
onValue(ref(db, 'reports'), (snapshot) => {
  reportsList.innerHTML = "";
  if (snapshot.exists()) {
    const reportsData = snapshot.val();

    Object.entries(reportsData).forEach(([uid, userReports]) => {
      Object.entries(userReports).forEach(([reportId, report]) => {
        const date = new Date(Number(report.timestamp || Date.now())).toLocaleString();

        reportsList.insertAdjacentHTML('beforeend', `
          <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
            <div class="d-flex align-items-center">
              <div class="d-flex flex-column">
                <h6 class="mb-1 text-dark text-sm">${report.user || 'Anonymous'}</h6>
                <span class="text-xs">${date}</span>
              </div>
            </div>
            <div class="d-flex flex-column text-end">
              <div>
                <a class="btn btn-link text-dark text-sm px-2 mb-0" href="javascript:;" data-uid="${uid}" data-id="${reportId}" data-type="report-view">
                  <i class="material-symbols-rounded text-sm me-1">visibility</i>View
                </a>
                <a class="btn btn-link text-danger text-gradient px-2 mb-0" href="javascript:;" data-uid="${uid}" data-id="${reportId}" data-type="report-delete">
                  <i class="material-symbols-rounded text-sm me-1">delete</i>Delete
                </a>
              </div>
            </div>
          </li>
        `);
      });
    });

  } else {
    reportsList.innerHTML = `
      <li class="list-group-item border-0 text-center text-muted">
        No reports found.
      </li>
    `;
  }
});

// Handle opening/closing report modal
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-type]");
  if (!target) return;

  const type = target.dataset.type;
  const id = target.dataset.id;
  const uid = target.dataset.uid;

  const modal = document.getElementById("reportModal");

  if (type === "modal-close") {
    modal.style.display = "none";
    return;
  }

  if (!id || !uid) return;

  const reportRef = ref(db, `reports/${uid}/${id}`);

  switch (type) {
    case "report-view":
      onValue(reportRef, (snapshot) => {
        if (snapshot.exists()) {
          const report = snapshot.val();
          document.getElementById("reportModalUser").textContent = report.user || "Anonymous";
          document.getElementById("reportModalName").textContent = report.name || "Unknown";
          document.getElementById("reportModalText").value = report.complaint || "No complaint provided.";
          document.getElementById("reportModalImage").src = report.imageUrl || "";
          document.getElementById("reportModalImage").style.display = report.imageUrl ? "block" : "none";

          // Set delete info
          document.getElementById("reportModalDelete").dataset.uid = uid;
          document.getElementById("reportModalDelete").dataset.id = id;
          document.getElementById("reportModalDelete").dataset.complaintUid = report.uid;

          modal.style.display = "flex";
        }
      }, { onlyOnce: true });
      break;

    case "report-delete":
      remove(reportRef).then(() => {
        modal.style.display = "none";
      });
      break;
  }
});

// Delete report + complaint when "Delete Post" clicked
document.getElementById("reportModalDelete").addEventListener("click", () => {
  const uid = document.getElementById("reportModalDelete").dataset.uid;
  const id = document.getElementById("reportModalDelete").dataset.id;
  const complaintUid = document.getElementById("reportModalDelete").dataset.complaintUid;

  if (uid && id && complaintUid) {
    const updates = {};
    updates[`reports/${uid}/${id}`] = null;
    updates[`complaints/${complaintUid}`] = null;

    update(ref(db), updates).then(() => {
      document.getElementById("reportModal").style.display = "none";
    });
  }
});

// Change Save button to Delete Post
document.getElementById("reportModalSave").textContent = "Delete Post";

// Delete report ONLY (not complaint)
document.getElementById("reportOnlyDelete").addEventListener("click", () => {
  const uid = document.getElementById("reportModalDelete").dataset.uid;
  const id = document.getElementById("reportModalDelete").dataset.id;

  if (uid && id) {
    remove(ref(db, `reports/${uid}/${id}`)).then(() => {
      document.getElementById("reportModal").style.display = "none";
    });
  }
});


// Logout handler
document.getElementById("LogoutBtn").addEventListener("click", function () {
  signOut(getAuth()).then(() => {
    window.location.href = "../pages/sign-in.html";
  });
});
