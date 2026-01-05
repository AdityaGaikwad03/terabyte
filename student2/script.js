const searchInput = document.getElementById("search-input");
const itemList = document.getElementById("item-list");
const statusText = document.getElementById("status");

/* ---------- DATA ---------- */
const originalItems = [
  { id: 1, name: "Cricket" },
  { id: 2, name: "Ball" },
  { id: 3, name: "Umpire" },
  { id: 4, name: "Bat" },
  { id: 5, name: "Stumps" }
];

let sortOrder = null;

/* ---------- FEATURE 7: SUBSEQUENCE SEARCH ---------- */
function isSubsequence(search, text) {
  let i = 0;
  for (let char of text) {
    if (char === search[i]) i++;
    if (i === search.length) return true;
  }
  return search.length === 0;
}

/* ---------- FEATURE 8: DEBOUNCE ---------- */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ---------- FEATURE 11: FILTER → SORT → RENDER ---------- */
function applyFilterAndSort() {
  const searchValue = searchInput.value.toLowerCase();

  // 1️⃣ FILTER FIRST
  let result = originalItems.filter(item =>
    isSubsequence(searchValue, item.name.toLowerCase())
  );

  // 2️⃣ SORT FILTERED RESULT
  if (sortOrder === "asc") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === "desc") {
    result.sort((a, b) => b.name.localeCompare(a.name));
  }

  // 3️⃣ UPDATE UI
  updateStatus(searchValue, sortOrder);
  renderList(result);
}

/* ---------- RENDER ---------- */
function renderList(items) {
  itemList.innerHTML = "";

  if (items.length === 0) {
    itemList.innerHTML = "<li>No results found</li>";
    return;
  }

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.name;
    itemList.appendChild(li);
  });
}

/* ---------- UI STATUS ---------- */
function updateStatus(filter, sort) {
  let msg = filter ? `Filter: "${filter}"` : "Filter: none";
  msg += " | ";
  msg += sort === "asc" ? "Sort: A–Z"
       : sort === "desc" ? "Sort: Z–A"
       : "Sort: none";

  statusText.innerText = msg;
}

/* ---------- EVENTS ---------- */
const debouncedUpdate = debounce(applyFilterAndSort, 300);
searchInput.addEventListener("input", debouncedUpdate);

function ascending() {
  sortOrder = "asc";
  applyFilterAndSort();
}

function descending() {
  sortOrder = "desc";
  applyFilterAndSort();
}

/* ---------- FEATURE 12: CLEAR FILTERS ---------- */
function clearFilters() {
  searchInput.value = "";
  sortOrder = null;
  updateStatus("", null);
  renderList(originalItems);
}

/* ---------- INIT ---------- */
renderList(originalItems);
updateStatus("", null);
