let cart = [];

// Load products from backend
async function loadProducts() {
  try {
    const res = await fetch("/products");
    const products = await res.json();

    const productList = document.getElementById("productList");
    productList.innerHTML = "";

    products.forEach((p) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${p.name} - ₱${p.unitPrice} (Stock: ${p.qty})
        <button onclick="addToCart(${p.id}, '${p.name}', ${p.unitPrice})">Add to Cart</button>
      `;
      productList.appendChild(li);
    });
  } catch (err) {
    console.error("Failed to load products", err);
  }
}

// Add product to cart
function addToCart(id, name, price) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, qty: 1 });
  }
  renderCart();
}

// Render cart items
function renderCart() {
  const cartList = document.getElementById("cartList");
  cartList.innerHTML = "";
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.qty} - ₱${item.price * item.qty}`;
    cartList.appendChild(li);
  });
}

// Checkout
document.getElementById("checkoutBtn").addEventListener("click", async () => {
  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  try {
    const res = await fetch("/cart/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart }),
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById("message").innerText =
        `Checkout successful! Total: ₱${data.total}`;
      cart = []; // clear cart
      renderCart();
      loadProducts(); // refresh product list stock
    } else {
      alert(data.error || "Checkout failed");
    }
  } catch (err) {
    console.error("Checkout failed", err);
  }
});

// Initialize page
loadProducts();
