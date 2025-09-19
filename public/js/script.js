// Simple fake login
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  if (email && pass) {
    localStorage.setItem("user", email); // fake session
    window.location.href = "main.html";
  } else {
    alert("Enter email and password!");
  }
}

// Fetch products
async function loadProducts() {
  const res = await fetch("/products");
  const products = await res.json();

  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${p.name} - ₱${p.unitPrice} (Stock: ${p.qty})
      <button onclick="addToCart(${p.id}, '${p.name}', ${p.unitPrice})">Add</button>
    `;
    listDiv.appendChild(div);
  });
}

let cart = [];

function addToCart(id, name, price) {
  cart.push({ id, name, price });
  renderCart();
}

function renderCart() {
  const cartDiv = document.getElementById("cart");
  cartDiv.innerHTML = "";
  cart.forEach((item, index) => {
    cartDiv.innerHTML += `${item.name} - ₱${item.price} 
      <button onclick="removeFromCart(${index})">Remove</button><br>`;
  });
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function checkout() {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }
  alert("Checkout successful! Total items: " + cart.length);
  cart = [];
  renderCart();
}

// Auto-load products if on main.html
if (window.location.pathname.endsWith("main.html")) {
  loadProducts();
}
