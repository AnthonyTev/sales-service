document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // ✅ Redirect to main page if login successful
      window.location.href = "main.html";
    } else {
      document.getElementById("message").innerText = data.message;
    }
  } catch (err) {
    document.getElementById("message").innerText = "Server error";
    console.error(err);
  }
});
