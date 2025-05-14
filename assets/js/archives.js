import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, onValue, remove, update } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
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

const archivedList = document.getElementById('archivedtbl');
const pinnedList = document.getElementById('pinnedtbl');

// Load Archived
onValue(ref(db, 'archive'), (snapshot) => {
  archivedList.innerHTML = "";
  if (snapshot.exists()) {
    const data = snapshot.val();
    Object.keys(data).forEach(id => {
      const item = data[id];
      const date = new Date(Number(item.timestamp)).toLocaleString();
      archivedList.insertAdjacentHTML('beforeend', `
        <li class="list-group-item border-0 d-flex p-4 mb-2 mt-3 bg-gray-100 border-radius-lg">
          <div class="d-flex flex-column">
            <h6 class="mb-3 text-sm">${item.name}</h6>
            <span class="mb-2 text-xs">Complaint: <span class="text-dark font-weight-bold ms-sm-2">${item.complaint}</span></span>
            <span class="text-xs">Date: <span class="text-dark ms-sm-2 font-weight-bold">${date}</span></span>
          </div>
          <div class="ms-auto text-end">
            <a class="btn btn-link text-danger text-gradient px-3 mb-0" href="javascript:;" data-id="${id}" data-type="archive-delete">
              <i class="material-symbols-rounded text-sm me-2">delete</i>Delete
            </a>
            <a class="btn btn-link text-dark px-3 mb-0" href="javascript:;" data-id="${id}" data-type="archive-unarchive">
              <i class="material-symbols-rounded text-sm me-2">unarchive</i>Unarchive
            </a>
          </div>
        </li>
      `);
    });
  } else {
    archivedList.innerHTML = `
      <li class="list-group-item border-0 text-center text-muted">
        No archived complaints available.
      </li>
    `;
  }
});

// Load Pinned
onValue(ref(db, 'pin'), (snapshot) => {
  pinnedList.innerHTML = "";
  if (snapshot.exists()) {
    const data = snapshot.val();
    let hasPins = false;
    Object.keys(data).forEach(id => {
      const item = data[id];
      if (item.pin === true) {
        hasPins = true;
        const date = new Date(Number(item.timestamp)).toLocaleString();
        pinnedList.insertAdjacentHTML('beforeend', `
          <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
            <div class="d-flex align-items-center">
              <button class="btn btn-icon-only btn-rounded btn-outline-success mb-0 me-3 p-3 btn-sm d-flex align-items-center justify-content-center" data-id="${id}" data-type="unpin">
                <i class="material-symbols-rounded text-lg">expand_less</i>
              </button>
              <div class="d-flex flex-column">
                <h6 class="mb-1 text-dark text-sm">${item.name}</h6>
                <span class="text-xs">${date}</span>
              </div>
            </div>
            <div class="d-flex flex-column text-end">
              <span class="text-success text-gradient text-sm font-weight-bold mb-1">${item.complaint}</span>
              <div>
                <a class="btn btn-link text-danger text-gradient px-2 mb-0" href="javascript:;" data-id="${id}" data-type="pin-delete">
                  <i class="material-symbols-rounded text-sm me-1">delete</i>Delete
                </a>
                <a class="btn btn-link text-dark px-2 mb-0" href="javascript:;" data-id="${id}" data-type="pin-edit">
                  <i class="material-symbols-rounded text-sm me-1">edit</i>Edit
                </a>
              </div>
            </div>
          </li>
        `);
      }
    });
    if (!hasPins) {
      pinnedList.innerHTML = `
        <li class="list-group-item border-0 text-center text-muted">
          No pinned complaints available.
        </li>
      `;
    }
  } else {
    pinnedList.innerHTML = `
      <li class="list-group-item border-0 text-center text-muted">
        No pinned complaints available.
      </li>
    `;
  }
});

// Action Handlers
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-type]');
  if (!target) return;

  const type = target.dataset.type;
  const id = target.dataset.id;

  if (!id) return;

  const pinRef = ref(db, `pin/${id}`);
  const archiveRef = ref(db, `archive/${id}`);

  switch (type) {
    case 'pin-delete':
      remove(pinRef).then(() => {
        remove(ref(db, `complaints/${id}`)); // optional: if you store complaint separately
      });
      break;

    case 'unpin':
      update(pinRef, { pin: false });
      break;

    case 'archive-delete':
      remove(archiveRef);
      break;

    case 'archive-unarchive':
      // Move data back from archive to complaints or pin (depending on your app logic)
      onValue(archiveRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
     update(ref(db, `complaints/${id}`), data).then(() => {
  remove(archiveRef);
});

          remove(archiveRef);
        }
      }, { onlyOnce: true });
      break;

    case 'archive-edit':
    case 'pin-edit':
      alert(`Edit functionality not implemented yet for ID: ${id}`);
      break;
  }
});

    document.getElementById("LogoutBtn").addEventListener("click", function () {

    window.location.href = "../pages/sign-in.html"; 
  });