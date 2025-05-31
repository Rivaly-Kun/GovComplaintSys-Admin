import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getDatabase, ref, set, get, remove, onValue, push
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

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
const dashboardTable = document.getElementById('dashboardTable');

// Store current complaint ID for modal
let currentComplaintId = null;

// Real-time listener for complaints
const complaintsRef = ref(db, 'complaints');
onValue(complaintsRef, (snapshot) => {
  dashboardTable.innerHTML = "";

  if (snapshot.exists()) {
    const data = snapshot.val();

    Object.entries(data).forEach(([uid, item]) => {
      if (!item.addToThread) return;

      const { name, complaint, timestamp, pin } = item;
      const date = new Date(Number(timestamp)).toLocaleString();

      dashboardTable.insertAdjacentHTML('beforeend', `
        <tr class="${pin ? 'border border-danger border-2 rounded' : ''}">
          <td>
            <div class="d-flex px-2 py-1">
              <img src="../assets/img/small-logos/logo-xd.svg" class="avatar avatar-sm me-3" alt="xd">
              <div class="d-flex flex-column justify-content-center">
                <h6 class="mb-0 text-sm">${name}</h6>
                <p class="text-xs text-secondary mb-0">ID: ${uid}</p>
              </div>
            </div>
          </td>
          <td class="text-sm">${complaint}</td>
          <td class="align-middle text-center text-sm">
            <span class="text-xs font-weight-bold">${date}</span>
          </td>
          <td class="align-middle">
            <button class="btn btn-sm btn-outline-info view-comments-btn" data-id="${uid}">View Comments</button>
          </td>
        </tr>
      `);
    });
  } else {
    dashboardTable.innerHTML = `<tr><td colspan="4" class="text-center">No threaded complaints found.</td></tr>`;
  }
});

// Add admin comment
async function addAdminComment(complaintId, message) {
  const commentId = Date.now();
  const commentRef = ref(db, `complaints/${complaintId}/comments/${commentId}`);
  const data = {
    text: message,
    timestamp: commentId,
    user: "admin",
    type: "admin",
    likes: { admin: true }
  };
  await set(commentRef, data);
}

// Add reply to a comment
async function addReply(complaintId, commentId, message) {
  const replyId = Date.now();
  const replyRef = ref(db, `complaints/${complaintId}/comments/${commentId}/replies/${replyId}`);
  const data = {
    text: message,
    timestamp: replyId,
    user: "admin",
    type: "admin",
    likes: { admin: true }
  };
  await set(replyRef, data);
}

// Toggle like/unlike
async function toggleLike(refPath, userId = "admin") {
  const likeRef = ref(db, `${refPath}/likes/${userId}`);
  const snapshot = await get(likeRef);
  if (snapshot.exists()) {
    await remove(likeRef);
  } else {
    await set(likeRef, true);
  }
}

// Watch real-time comments
function watchComments(complaintId) {
  const modalBody = document.getElementById("commentsModalBody");
  const commentsRef = ref(db, `complaints/${complaintId}/comments`);
  onValue(commentsRef, (snapshot) => {
    let html = '';
    
    if (snapshot.exists()) {
      const comments = snapshot.val();
      html = Object.entries(comments).map(([cid, comment]) => {
        const replies = comment.replies || {};
        const replyHTML = Object.entries(replies).map(([rid, r]) => `
          <div class="ms-4 mt-1 border-start ps-2">
            <strong>${r.user}</strong>: ${r.text}
            <div>
              <small class="text-muted">${new Date(Number(r.timestamp)).toLocaleString()}</small>
              <button class="btn btn-sm btn-outline-primary like-btn" data-ref="complaints/${complaintId}/comments/${cid}/replies/${rid}">
                👍 (${r.likes ? Object.keys(r.likes).length : 0})
              </button>
            </div>
          </div>
        `).join("");

        return `
          <div class="card mb-2">
            <div class="card-body p-2">
              <p><strong>${comment.user}</strong>: ${comment.text}</p>
              <small class="text-muted">${new Date(Number(comment.timestamp)).toLocaleString()}</small>
              <div class="d-flex gap-2 mt-2">
                <button class="btn btn-sm btn-outline-primary like-btn" data-ref="complaints/${complaintId}/comments/${cid}">
                  👍 (${comment.likes ? Object.keys(comment.likes).length : 0})
                </button>
                <button class="btn btn-sm btn-outline-secondary reply-btn" data-post="${complaintId}" data-comment="${cid}">
                  Reply
                </button>
              </div>
              ${replyHTML}
            </div>
          </div>
        `;
      }).join("");
    } else {
      html = "<p class='text-muted'>No comments yet.</p>";
    }

    // Add admin reply section at the bottom
    html += `
      <div class="mt-3 border-top pt-3">
        <h6 class="text-sm font-weight-bold">Reply as Admin</h6>
        <div class="d-flex gap-2">
          <textarea id="adminReplyText" class="form-control" rows="2" placeholder="Enter your admin reply..."></textarea>
          <button class="btn btn-success admin-reply-submit-btn" data-id="${complaintId}">
            Send
          </button>
        </div>
      </div>
    `;

    modalBody.innerHTML = html;
  });
}

// Show comment modal
async function showCommentModal(complaintId) {
  currentComplaintId = complaintId;
  const modal = new bootstrap.Modal(document.getElementById('commentsModal'));
  watchComments(complaintId);
  modal.show();
}

// Event listeners
document.addEventListener("click", async (e) => {
  if (e.target.matches(".view-comments-btn")) {
    const key = e.target.getAttribute("data-id");
    await showCommentModal(key);
  }

  if (e.target.matches(".admin-reply-submit-btn")) {
    const key = e.target.getAttribute("data-id");
    const textArea = document.getElementById("adminReplyText");
    const message = textArea.value.trim();
    
    if (message) {
      await addAdminComment(key, message);
      textArea.value = ""; // Clear the textarea after sending
    }
  }

  if (e.target.matches(".like-btn")) {
    const refPath = e.target.getAttribute("data-ref");
    await toggleLike(refPath);
  }

  if (e.target.matches(".reply-btn")) {
    const post = e.target.getAttribute("data-post");
    const comment = e.target.getAttribute("data-comment");
    const message = prompt("Enter reply:");
    if (message?.trim()) {
      await addReply(post, comment, message.trim());
    }
  }
});

document.getElementById("LogoutBtn").addEventListener("click", () => {
  window.location.href = "../pages/sign-in.html";
});
