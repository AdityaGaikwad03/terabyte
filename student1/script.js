/*************************
 * DOM CACHING
 *************************/
const loginSection = document.getElementById("loginSection");
const registrationSection = document.getElementById("registrationSection");
const appSection = document.getElementById("appSection");
const adminApp = document.getElementById("adminApp");
const userApp = document.getElementById("userApp");

const loginForm = document.getElementById("loginForm");
const registrationForm = document.getElementById("registrationForm");

const loginError = document.getElementById("loginError");
const regError = document.getElementById("regError");

const profileCard = document.getElementById("profileCard");
const noProfileMsg = document.getElementById("noProfileMsg");

/*************************
 * VIEW HELPERS
 *************************/
function showLogin() {
  loginSection.style.display = "block";
  registrationSection.style.display = "none";
  appSection.style.display = "none";
}

function showRegistration() {
  loginSection.style.display = "none";
  registrationSection.style.display = "block";
}

document.getElementById("otpSection").style.display = "none";

function showApp(role) {
  loginSection.style.display = "none";
  appSection.style.display = "block";

  adminApp.style.display = role === "admin" ? "block" : "none";
  userApp.style.display = role === "user" ? "block" : "none";

  if (role === "admin") {
    renderRegisteredUsers();
    renderActionLogs();
  }

  displayUserData();
  sync2FAToggle();
}

/*************************
 * AUTH: LOGIN
 *************************/
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users_a")) || [];
  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    loginError.innerText = "Invalid email or password";
    return;
  }

  loginError.innerText = "";

  if (user.is2FAEnabled) {
    start2FA(user);
    show2FAScreen();
  } else {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    addActionLog("login", user.email);
    document.getElementById("otpSection").style.display = "none";
    showApp(user.role);
  }
});

/*************************
 * AUTH: REGISTRATION
 *************************/
registrationForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const role = document.querySelector('input[name="role"]:checked').value;

  if (password.length < 6) {
    regError.innerText = "Password must be at least 6 characters";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users_a")) || [];

  if (users.some((u) => u.email === email)) {
    regError.innerText = "Email already registered";
    return;
  }

  const newUser = {
    name,
    email,
    password,
    role,
    is2FAEnabled: false,
    currentOTP: null,
    otpExpiresAt: null
  };

  users.push(newUser);
  localStorage.setItem("users_a", JSON.stringify(users));
  addActionLog("register", email);

  regError.innerText = "Registration successful. Please login.";
  showLogin();
});

/*************************
 * LOGOUT
 *************************/
function logout() {
  const current = JSON.parse(localStorage.getItem("loggedInUser"));
  if (current) addActionLog("logout", current.email);

  if (otpTimer) clearInterval(otpTimer);
  localStorage.removeItem("pending2FAUser");
  localStorage.removeItem("loggedInUser");

  showLogin();
  displayUserData();
}

/*************************
 * PROFILE (READ-ONLY)
 *************************/
function displayUserData() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user) {
    if (profileCard) profileCard.style.display = "none";
    if (noProfileMsg) noProfileMsg.style.display = "block";
    return;
  }

  if (profileCard) profileCard.style.display = "block";
  if (noProfileMsg) noProfileMsg.style.display = "none";

  document.getElementById("profileName").innerText = user.name;
  document.getElementById("profileEmail").innerText = user.email;
  document.getElementById("profileRole").innerText = user.role;
}

/*************************
 * ADMIN: USERS LIST
 *************************/
function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderRegisteredUsers() {
  const users = JSON.parse(localStorage.getItem("users_a")) || [];
  const usersOnly = users.filter(u => u.role === "user");

  const table = document.getElementById("usersTable");
  const tbody = document.getElementById("usersTableBody");
  const noMsg = document.getElementById("noUsersMsg");

  if (usersOnly.length === 0) {
    table.style.display = "none";
    noMsg.style.display = "block";
    return;
  }

  table.style.display = "table";
  noMsg.style.display = "none";

  tbody.innerHTML = usersOnly.map(u => `
    <tr>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(u.role)}</td>
    </tr>
  `).join("");
}

/*************************
 * ACTION LOGS
 *************************/
function addActionLog(type, email) {
  // Don't record logs for admin users
  const users = JSON.parse(localStorage.getItem("users_a")) || [];
  const user = users.find(u => u.email === email);
  if (user && user.role === "admin") return;

  const logs = JSON.parse(localStorage.getItem("action_logs")) || [];
  logs.unshift({ type, email, timestamp: new Date().toISOString() });
  localStorage.setItem("action_logs", JSON.stringify(logs));
}

function renderActionLogs() {
  const logs = JSON.parse(localStorage.getItem("action_logs")) || [];
  const table = document.getElementById("logsTable");
  const tbody = document.getElementById("logsTableBody");
  const noMsg = document.getElementById("noLogsMsg");

  if (logs.length === 0) {
    table.style.display = "none";
    noMsg.style.display = "block";
    return;
  }

  table.style.display = "table";
  noMsg.style.display = "none";

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td>${escapeHtml(l.type)}</td>
      <td>${escapeHtml(l.email)}</td>
      <td>${new Date(l.timestamp).toLocaleString()}</td>
    </tr>
  `).join("");
}

/*************************
 * 2FA IMPLEMENTATION
 *************************/
let otpTimer = null;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function start2FA(user) {
  user.currentOTP = generateOTP();
  user.otpExpiresAt = Date.now() + 30000;
  localStorage.setItem("pending2FAUser", JSON.stringify(user));

  if (otpTimer) clearInterval(otpTimer);

  updateOTPDisplay();
  updateOTPProgress(); // 🔥 start immediately

  otpTimer = setInterval(() => {
    const pending = JSON.parse(localStorage.getItem("pending2FAUser"));
    if (!pending) {
      clearInterval(otpTimer);
      otpTimer = null;
      return;
    }

    if (Date.now() >= pending.otpExpiresAt) {
      pending.currentOTP = generateOTP();
      pending.otpExpiresAt = Date.now() + 30000;
      localStorage.setItem("pending2FAUser", JSON.stringify(pending));
      updateOTPDisplay();
    }

    updateOTPProgress();
  }, 1000);
}


function show2FAScreen() {
  if (loginSection) loginSection.style.display = "none";

  const otpSection = document.getElementById("otpSection");
  if (otpSection) otpSection.style.display = "block";

  const otpInput = document.getElementById("otpInput");
  if (otpInput) {
    otpInput.value = "";
    try { otpInput.focus(); } catch (e) {}
  }

  const otpError = document.getElementById("otpError");
  if (otpError) otpError.innerText = "";

  updateOTPDisplay();
  updateOTPProgress();
}

function updateOTPDisplay() {
  const user = JSON.parse(localStorage.getItem("pending2FAUser"));
  const otpDisplay = document.getElementById("otpDisplay");

  if (!otpDisplay) return;

  if (user) {
    otpDisplay.innerText = `Current Code: ${user.currentOTP}`;
  } else {
    otpDisplay.innerText = "";
  }
} 

function verifyOTP() {
  const entered = document.getElementById("otpInput").value;
  const user = JSON.parse(localStorage.getItem("pending2FAUser"));

  if (!user) {
    showLogin();
    return;
  }

  if (entered === user.currentOTP && Date.now() <= user.otpExpiresAt) {
    clearInterval(otpTimer);
    localStorage.removeItem("pending2FAUser");
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    addActionLog("login", user.email);
    document.getElementById("otpSection").style.display = "none";
    showApp(user.role);
  } else {
    document.getElementById("otpError").innerText =
      "Invalid or expired OTP";
  }
}

/*************************
 * AUTO LOGIN
 *************************/
window.onload = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (user) showApp(user.role);
  else showLogin();
};

function sync2FAToggle() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return;

  const toggle = document.getElementById("toggle2FA");
  toggle.checked = !!user.is2FAEnabled;
}

document.getElementById("toggle2FA").addEventListener("change", (e) => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return;

  if (e.target.checked) {
    // ENABLE 2FA
    user.is2FAEnabled = true;
    updateUser(user);
  } else {
    // ASK PASSWORD TO DISABLE
    document.getElementById("disable2FABox").style.display = "block";
  }
});

function disable2FA() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const enteredPassword = document.getElementById("confirmPassword").value;
  const toggle = document.getElementById("toggle2FA");

  if (enteredPassword !== user.password) {
    document.getElementById("disable2FAError").innerText =
      "Incorrect password";
    toggle.checked = true; // 🔥 revert checkbox
    return;
  }

  user.is2FAEnabled = false;
  updateUser(user);

  document.getElementById("disable2FABox").style.display = "none";
  document.getElementById("confirmPassword").value = "";
  document.getElementById("disable2FAError").innerText = "";
}


function updateUser(updatedUser) {
  let users = JSON.parse(localStorage.getItem("users_a")) || [];
  users = users.map(u => u.email === updatedUser.email ? updatedUser : u);

  localStorage.setItem("users_a", JSON.stringify(users));
  localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
}

function updateOTPProgress() {
  const user = JSON.parse(localStorage.getItem("pending2FAUser"));
  const progressEl = document.getElementById("otpProgress");
  const timerTextEl = document.getElementById("otpTimerText");

  if (!progressEl || !timerTextEl) return;

  if (!user) {
    progressEl.style.width = "0%";
    timerTextEl.innerText = "";
    return;
  }

  const remaining = Math.max(0, user.otpExpiresAt - Date.now());
  const percent = (remaining / 30000) * 100;

  progressEl.style.width = percent + "%";
  timerTextEl.innerText = `Expires in ${Math.ceil(remaining / 1000)}s`;
}
