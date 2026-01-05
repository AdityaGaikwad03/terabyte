function renderList(ulElement, items, mapper) {
  ulElement.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerText = mapper ? mapper(item) : JSON.stringify(item);
    ulElement.appendChild(li);
  });
}


const fetchPromisesBtn = document.getElementById('fetchPromisesBtn');
const loadingPromises = document.getElementById('loadingPromises');
const dataPromises = document.getElementById('dataPromises');
const errorPromises = document.getElementById('errorPromises');

function fetchWithPromises() {
  const url = 'https://jsonplaceholder.typicode.com/users';
  fetchPromisesBtn.disabled = true;
  loadingPromises.style.display = 'block';
  dataPromises.innerHTML = '';
  errorPromises.innerText = '';

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      renderList(dataPromises, data, u => `Name: ${u.name} | Email: ${u.email}`);
    })
    .catch(err => {
      console.error('Fetch (Promises) error:', err);
      errorPromises.innerText = 'Error: ' + err.message;
    })
    .finally(() => {
      loadingPromises.style.display = 'none';
      fetchPromisesBtn.disabled = false;
    });
}

fetchPromisesBtn.addEventListener('click', fetchWithPromises);


const fetchAsyncBtn = document.getElementById('fetchAsyncBtn');
const loadingAsync = document.getElementById('loadingAsync');
const dataAsync = document.getElementById('dataAsync');
const errorAsync = document.getElementById('errorAsync');

async function fetchDataAsync() {
  const url = 'https://jsonplaceholder.typicode.com/users';
  fetchAsyncBtn.disabled = true;
  loadingAsync.style.display = 'block';
  dataAsync.innerHTML = '';
  errorAsync.innerText = '';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    renderList(dataAsync, data, u => `Name: ${u.name} | Email: ${u.email}`);
  } catch (err) {
    console.error('Fetch (Async) error:', err);
    errorAsync.innerText = 'Error: ' + err.message;
  } finally {
    loadingAsync.style.display = 'none';
    fetchAsyncBtn.disabled = false;
  }
}

fetchAsyncBtn.addEventListener('click', fetchDataAsync);


const loadParallelBtn = document.getElementById('loadParallelBtn');
const loadingParallel = document.getElementById('loadingParallel');
const dataParallel = document.getElementById('dataParallel');
const errorParallel = document.getElementById('errorParallel');

function loadParallelData() {
  const url1 = 'https://jsonplaceholder.typicode.com/users';
  const url2 = 'https://jsonplaceholder.typicode.com/posts';
  loadParallelBtn.disabled = true;
  loadingParallel.style.display = 'block';
  dataParallel.innerHTML = '';
  errorParallel.innerText = '';

  Promise.all([
    fetch(url1).then(r => { if (!r.ok) throw new Error('Users fetch failed'); return r.json(); }),
    fetch(url2).then(r => { if (!r.ok) throw new Error('Posts fetch failed'); return r.json(); })
  ])
    .then(([users, posts]) => {
      
      const combined = [];
      users.slice(0,5).forEach(u => combined.push({type:'user', text:`User: ${u.name} | ${u.email}`}));
      posts.slice(0,5).forEach(p => combined.push({type:'post', text:`Post: ${p.title}`}));
      renderList(dataParallel, combined, item => item.text);
    })
    .catch(err => {
      console.error('Parallel fetch error:', err);
      errorParallel.innerText = 'Error: ' + err.message;
    })
    .finally(() => {
      loadingParallel.style.display = 'none';
      loadParallelBtn.disabled = false;
    });
}

loadParallelBtn.addEventListener('click', loadParallelData);




function switch_btn() {
    const send_message = document.getElementById("message")
    const pay = document.getElementById("pay");
    const input = document.getElementById("input");
    if(pay.value === integer) {
      pay.style.display = "block";
    } else {
        send_message.style.display = "block";
    }
}
