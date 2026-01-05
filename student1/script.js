function showLogin() {
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("registrationSection").style.display = "none";
}

function showRegistration() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("registrationSection").style.display = "block";
}

let corrent_user = null;

document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    let users = JSON.parse(localStorage.getItem("users_a")) || [];
    const user = users.find(
      (user) => user.email === email && user.password === password
    );
    if (user) {
      corrent_user = user;
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      // Add action log for login
      if (typeof addActionLog === 'function') addActionLog('login', user.email);
      document.getElementById("loginError").innerText = "Login successful!";
      showApp(user.role);
      displayUserData();
    } else {
      document.getElementById("loginError").innerText =
        "Invalid email or password.";
    }
  });

document
  .getElementById("registrationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const role = document.querySelector('input[name="role"]:checked').value;

    if (password.length < 6) {
      document.getElementById("regError").innerText =
        "Password must be at least 6 characters long.";
      return;
    }
    let users = JSON.parse(localStorage.getItem("users_a")) || [];
    const userExists = users.some((user) => user.email === email);
    if (userExists) {
      document.getElementById("regError").innerText =
        "Email is already registered.";
      return;
    }
    const newUser = { name, email, password, role };
    users.push(newUser);
    localStorage.setItem("users_a", JSON.stringify(users));
    // Add action log for register
    if (typeof addActionLog === 'function') addActionLog('register', email);
    // Update admin users list if admin panel is visible
    if (typeof renderRegisteredUsers === "function") renderRegisteredUsers();
    document.getElementById("regError").innerText =
      "Registration successful! You can now log in.";
    showLogin();
  });

function logout() {
  // record logout with current logged in email
  const current = JSON.parse(localStorage.getItem('loggedInUser'));
  if (current && typeof addActionLog === 'function') addActionLog('logout', current.email);
  document.getElementById("appSection").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  localStorage.removeItem("loggedInUser");
  corrent_user = null;
  displayUserData();
}

function showApp(role) {
  document.getElementById("loginSection").style.display = "none";
  if (role === "admin") {
    document.getElementById("adminApp").style.display = "block";
    document.getElementById("appSection").style.display = "block";
    document.getElementById("userApp").style.display = "none";
    if (typeof renderRegisteredUsers === "function") renderRegisteredUsers();
    if (typeof renderActionLogs === "function") renderActionLogs();

  } else if (role === "user") {
    document.getElementById("userApp").style.display = "block";
    document.getElementById("adminApp").style.display = "none";
    document.getElementById("appSection").style.display = "block";
  } else {
    document.getElementById("adminApp").style.display = "none";
    document.getElementById("userApp").style.display = "none";
  }
  displayUserData();
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderRegisteredUsers() {
  const users = JSON.parse(localStorage.getItem("users_a")) || [];
  // Filter to only show regular users (exclude admin registrations)
  const usersOnly = users.filter(u => (u.role || '').toLowerCase() === 'user');
  const table = document.getElementById("usersTable");
  const tbody = document.getElementById("usersTableBody");
  const noMsg = document.getElementById("noUsersMsg");
  if (!table || !tbody || !noMsg) return;
  if (usersOnly.length === 0) {
    table.style.display = "none";
    noMsg.style.display = "block";
    tbody.innerHTML = "";
    return;
  }
  noMsg.style.display = "none";
  table.style.display = "table";
  tbody.innerHTML = usersOnly
    .map(u => `\n
        <tr>\n  
            <td>${escapeHtml(u.name)}</td>\n  
            <td>${escapeHtml(u.email)}</td>\n  
            <td>${escapeHtml(u.role)}</td>\n
        </tr>
    `)
    .join("");
}

function displayUserData() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const profileCard = document.getElementById("profileCard");
  const noProfileMsg = document.getElementById("noProfileMsg");
  if (loggedInUser) {
    if (profileCard) profileCard.style.display = "block";
    if (noProfileMsg) noProfileMsg.style.display = "none";
    document.getElementById("profileName").innerText = loggedInUser.name || "";
    document.getElementById("profileEmail").innerText =
      loggedInUser.email || "";
    document.getElementById("profileRole").innerText = loggedInUser.role || "";
  } else {
    if (profileCard) profileCard.style.display = "none";
    if (noProfileMsg) noProfileMsg.style.display = "block";
    document.getElementById("profileName").innerText = "";
    document.getElementById("profileEmail").innerText = "";
    document.getElementById("profileRole").innerText = "";
  }
}

window.onload = function () {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedInUser) {
    showApp(loggedInUser.role);
    displayUserData();
  } else {
    showLogin();
  }
};

// Action logs storage (used by admin)
// key: action_logs (array of {type, email, timestamp})
function addActionLog(type, email) {
  const logs = JSON.parse(localStorage.getItem('action_logs')) || [];
  const entry = { type, email: email || '', timestamp: new Date().toISOString() };
  logs.unshift(entry); // newest first
  localStorage.setItem('action_logs', JSON.stringify(logs));
  if (typeof renderActionLogs === 'function') renderActionLogs();
}

function renderActionLogs() {
  const logs = JSON.parse(localStorage.getItem('action_logs')) || [];
  const table = document.getElementById('logsTable');
  const tbody = document.getElementById('logsTableBody');
  const noMsg = document.getElementById('noLogsMsg');
  if (!table || !tbody || !noMsg) return;
  if (logs.length === 0) {
    table.style.display = 'none';
    noMsg.style.display = 'block';
    tbody.innerHTML = '';
    return;
  }
  noMsg.style.display = 'none';
  table.style.display = 'table';
  tbody.innerHTML = logs.map(l => `\n
    <tr>\n  
        <td>${escapeHtml(l.type)}</td>\n
        <td>${escapeHtml(l.email)}</td>\n  
        <td>${escapeHtml(new Date(l.timestamp).toLocaleString())}</td>\n
    </tr>`).join('');
}