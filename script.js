// script.js - Enhanced Version: Includes Validation, Notifications, Role-based Dashboard, Dashboard Stats

function initEmployee() {
  const leaveForm = document.getElementById("leaveForm");
  const leaveHistoryBody = document.getElementById("leaveHistoryBody");
  const dashboardCounts = document.getElementById("dashboardCounts");
  const dashboardTable = document.getElementById("dashboardTable");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Employee Side - Apply Leave
  if (leaveForm) {
    leaveForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const leaveType = document.getElementById("leaveType").value;
      const fromDate = document.getElementById("fromDate").value;
      const toDate = document.getElementById("toDate").value;
      const reason = document.getElementById("reason").value;

      if (!leaveType || !fromDate || !toDate || !reason) {
        alert("All fields are required!");
        return;
      }

      if (new Date(fromDate) > new Date(toDate)) {
        alert("From Date cannot be after To Date!");
        return;
      }

      const leaveData = {
        type: leaveType,
        from: fromDate,
        to: toDate,
        reason: reason,
        status: "Pending",
        employee: currentUser?.username || "Unknown",
        timestamp: new Date().toISOString(),
      };

      let leaves = JSON.parse(localStorage.getItem("leaves")) || [];
      leaves.push(leaveData);
      localStorage.setItem("leaves", JSON.stringify(leaves));

      alert("✅ Leave applied successfully!");
      leaveForm.reset();
      updateDashboard();
    });
  }

  // Employee Side - Display Leave History
  if (leaveHistoryBody) {
    renderLeaveHistory();
  }

  // Dashboard - Display Counts & Table
  if (dashboardCounts && dashboardTable) {
    updateDashboard();
  }
}

function renderLeaveHistory() {
  const leaveHistoryBody = document.getElementById("leaveHistoryBody");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  leaveHistoryBody.innerHTML = "";
  const leaves = JSON.parse(localStorage.getItem("leaves")) || [];
  leaves
    .filter((l) => l.employee === currentUser?.username)
    .forEach((leave) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${leave.type}</td>
        <td>${leave.from}</td>
        <td>${leave.to}</td>
        <td>${leave.status}</td>
      `;
      leaveHistoryBody.appendChild(row);
    });
}

function updateDashboard() {
  const dashboardCounts = document.getElementById("dashboardCounts");
  const dashboardTable = document.getElementById("dashboardTable");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const leaves = JSON.parse(localStorage.getItem("leaves")) || [];
  const userLeaves = leaves.filter((l) => l.employee === currentUser?.username);
  const total = userLeaves.length;
  const pending = userLeaves.filter((l) => l.status === "Pending").length;
  const approved = userLeaves.filter((l) => l.status === "Approved").length;
  const rejected = userLeaves.filter((l) => l.status === "Rejected").length;

  document.getElementById("totalLeaves").textContent = total;
  document.getElementById("pendingLeaves").textContent = pending;
  document.getElementById("approvedLeaves").textContent = approved;
  document.getElementById("rejectedLeaves").textContent = rejected;

  dashboardTable.innerHTML = userLeaves
    .map(
      (leave) => `
        <tr>
          <td>${leave.type}</td>
          <td>${leave.from}</td>
          <td>${leave.to}</td>
          <td>${leave.status}</td>
        </tr>
      `
    )
    .join("");
}

function initManager() {
  const approvalTableBody = document.querySelector("#approvalTable tbody");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Manager Side - Approve or Reject
  if (approvalTableBody) {
    const leaves = JSON.parse(localStorage.getItem("leaves")) || [];
    approvalTableBody.innerHTML = "";

    leaves.forEach((leave, index) => {
      if (leave.status === "Pending") {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${leave.employee}</td>
          <td>${leave.type}</td>
          <td>${leave.from}</td>
          <td>${leave.to}</td>
          <td>${leave.reason}</td>
          <td>
            <button onclick="updateStatus(${index}, 'Approved')">✅ Approve</button>
            <button onclick="updateStatus(${index}, 'Rejected')">❌ Reject</button>
          </td>
        `;
        approvalTableBody.appendChild(row);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  const users = [
    { username: "employee", password: "123", role: "employee" },
    { username: "manager", password: "123", role: "manager" }
  ];

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        alert(`Welcome ${user.username} 👋`);
        if (user.role === "employee") {
          window.location.href = "index.html";
        } else {
          window.location.href = "approval.html";
        }
      } else {
        alert("Invalid credentials ❌");
      }
    });
  }

  // Page protection
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const path = window.location.pathname;

  if (
    path.includes("applyLeave") ||
    path.includes("leaveHistory") ||
    path.includes("index")
  ) {
    if (!currentUser || currentUser.role !== "employee") {
      alert("Please log in as an employee");
      window.location.href = "login.html";
    }
  } else if (path.includes("approval")) {
    if (!currentUser || currentUser.role !== "manager") {
      alert("Please log in as a manager");
      window.location.href = "login.html";
    }
  }

  // Logout logic
  document.querySelectorAll("a[href='login.html']").forEach((el) => {
    el.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
    });
  });
});

function updateStatus(index, newStatus) {
  let leaves = JSON.parse(localStorage.getItem("leaves")) || [];
  leaves[index].status = newStatus;
  localStorage.setItem("leaves", JSON.stringify(leaves));
  alert(`Leave has been ${newStatus}`);
  location.reload();
}