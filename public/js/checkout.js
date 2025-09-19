async function loadCheckout() {
  const res = await fetch("/cart");
  const cart = await res.json();

  const checkoutList = document.getElementById("checkoutList");
  checkoutList.innerHTML = "";

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - ${item.qty} pcs`;
    checkoutList.appendChild(li);
  });
}

document.getElementById("confirmBtn").addEventListener("click", async () => {
  const res = await fetch("/checkout", { method: "POST" });

  if (res.ok) {
    alert("Purchase successful!");
    window.location.href = "/main.html";
  } else {
    alert("Checkout failed!");
  }
});

loadCheckout();
