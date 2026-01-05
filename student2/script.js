const searchInput = document.getElementById("search-input");
const itemList = document.getElementById("item-list");

const originalItems = [
  { id: 1, name: "Cricket" },
  { id: 2, name: "Ball" },
  { id: 3, name: "Umpire" },
  { id: 4, name: "Bat" },
  { id: 5, name: "Stumps" }
];

let items = [...originalItems];
let sortOrder = null; 

// Feature 7: Smart Subsequence Search
function isSubsequence(search, text) {
  let i = 0;
  for (let char of text) {
    if (char === search[i]) i++;
    if (i === search.length) return true;
  }
  return search.length === 0;
}

// Feature 8: Search-As-You-Type with Debouncing
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}


// Feature 9: Dynamic Data List Rendering
function renderList(data) {
  itemList.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.name;
    itemList.appendChild(li);
  });
}

function filterItems() {
  const searchValue = searchInput.value.toLowerCase();

  let filteredItems = originalItems.filter(item =>
    isSubsequence(searchValue, item.name.toLowerCase())
  );


  if (sortOrder === "asc") {
    filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOrder === "desc") {
    filteredItems.sort((a, b) => b.name.localeCompare(a.name));
  }

  items = filteredItems;
  renderList(items);
}



const debouncedFilterItems = debounce(filterItems, 300);
searchInput.addEventListener("input", debouncedFilterItems);

//  Feature 10: Sorting with Toggle State
function ascending() {
  sortOrder = "asc";
  filterItems();
}

function descending() {
  sortOrder = "desc";
  filterItems();
}

//  Feature 12: Clear All Filters 
function clearFilters() {
  searchInput.value = "";
  sortOrder = null;
  items = [...originalItems];
  renderList(items);
}


renderList(items);



