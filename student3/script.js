/********************************
 * HELPER: RENDER LIST
 ********************************/
function renderList(ul, items, mapper) {
  ul.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.innerText = mapper ? mapper(item) : item;
    ul.appendChild(li);
  });
}

/********************************
 * FEATURE 13: FETCH WITH PROMISES
 ********************************/
const fetchPromisesBtn = document.getElementById("fetchPromisesBtn");
const loadingPromises = document.getElementById("loadingPromises");
const dataPromises = document.getElementById("dataPromises");
const errorPromises = document.getElementById("errorPromises");

fetchPromisesBtn.addEventListener("click", () => {
  fetchPromisesBtn.disabled = true;
  loadingPromises.style.display = "block";
  dataPromises.innerHTML = "";
  errorPromises.innerText = "";

  fetch("https://jsonplaceholder.typicode.com/users")
    .then(res => {
      if (!res.ok) throw new Error("Network error");
      return res.json();
    })
    .then(data => {
      renderList(dataPromises, data, u => `${u.name} | ${u.email}`);
    })
    .catch(err => {
      errorPromises.innerText = err.message;
    })
    .finally(() => {
      loadingPromises.style.display = "none";
      fetchPromisesBtn.disabled = false;
    });
});

/********************************
 * FEATURE 14 + 18: ASYNC + CACHE
 ********************************/
const fetchAsyncBtn = document.getElementById("fetchAsyncBtn");
const refreshBtn = document.getElementById("refreshBtn");

const loadingAsync = document.getElementById("loadingAsync");
const dataAsync = document.getElementById("dataAsync");
const errorAsync = document.getElementById("errorAsync");

const CACHE_KEY = "myData";
const API_URL = "https://jsonplaceholder.typicode.com/users";

async function loadUsers(forceRefresh = false) {
  // Prevent concurrent loads
  if (loadUsers._loading) return;

  dataAsync.innerHTML = "";
  errorAsync.innerText = "";

  try {
    // Use cache unless forced to refresh
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        renderList(dataAsync, JSON.parse(cached), u => u.name);
        return;
      }
    }

    // Show loading UI and mark as loading
    loadUsers._loading = true;
    loadingAsync.style.display = "block";
    fetchAsyncBtn.disabled = true;
    refreshBtn.disabled = true;

    // Fetch fresh data
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch data");

    const data = await res.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    renderList(dataAsync, data, u => u.name);

  } catch (err) {
    errorAsync.innerText = err.message;
  } finally {
    loadingAsync.style.display = "none";
    fetchAsyncBtn.disabled = false;
    refreshBtn.disabled = false;
    loadUsers._loading = false;
  }
}

fetchAsyncBtn.addEventListener("click", () => loadUsers(false));
refreshBtn.addEventListener("click", () => loadUsers(true));
// Do not auto-load on page load — load only when user clicks the button
// window.addEventListener("load", () => loadUsers(false));

/********************************
 * FEATURE 15: PARALLEL API CALLS
 ********************************/
const loadParallelBtn = document.getElementById("loadParallelBtn");
const loadingParallel = document.getElementById("loadingParallel");
const dataParallel = document.getElementById("dataParallel");
const errorParallel = document.getElementById("errorParallel");

loadParallelBtn.addEventListener("click", () => {
  loadingParallel.style.display = "block";
  dataParallel.innerHTML = "";
  errorParallel.innerText = "";

  Promise.all([
    fetch("https://jsonplaceholder.typicode.com/users").then(r => r.json()),
    fetch("https://jsonplaceholder.typicode.com/posts").then(r => r.json())
  ])
    .then(([users, posts]) => {
      const combined = [
        ...users.slice(0, 5).map(u => `User: ${u.name}`),
        ...posts.slice(0, 5).map(p => `Post: ${p.title}`)
      ];
      renderList(dataParallel, combined);
    })
    .catch(() => {
      errorParallel.innerText = "Failed to load parallel data";
    })
    .finally(() => {
      loadingParallel.style.display = "none";
    });
});

/********************************
 * FEATURE 16: CONTEXT-AWARE INPUT
 ********************************/
const input = document.getElementById("input");
const pay = document.getElementById("pay");
const message = document.getElementById("message");

input.addEventListener("input", () => {
  const value = input.value.trim();
  pay.style.display = "none";
  message.style.display = "none";

  if (!value) return;

  const isNumber = /^\d+$/.test(value);
  const num = Number(value);

  if (isNumber && num >= 1 && num <= 100000) {
    pay.style.display = "inline-block";
  } else {
    message.style.display = "inline-block";
  }
});

/********************************
 * FEATURE 17: EVENT DELEGATION
 ********************************/
const delegationList = document.getElementById("delegationList");

const delegatedItems = [
  { id: 1, name: "Item One" },
  { id: 2, name: "Item Two" },
  { id: 3, name: "Item Three" }
];

delegatedItems.forEach(item => {
  const li = document.createElement("li");
  li.className = "delegated-item";
  li.dataset.id = item.id;
  li.innerText = item.name;
  delegationList.appendChild(li);
});

delegationList.addEventListener("click", e => {
  const li = e.target.closest(".delegated-item");
  if (!li) return;

  document
    .querySelectorAll(".delegated-item")
    .forEach(el => el.classList.remove("active"));

  li.classList.add("active");
});
