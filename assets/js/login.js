document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://app.tifehairhaven.co.uk/api/v1";
  
    // Select form elements
    const formContainer = document.querySelector(".form-container");
    const emailInput = formContainer.querySelector("input[type='email']");
    const passwordInput = formContainer.querySelector("input[name='password']");
    const loginButton = formContainer.querySelector("button[type='submit']");
  
    // Add event listener for form submission
    loginButton.addEventListener("click", async function (event) {
      event.preventDefault(); // Prevent default form submission behavior
  
      // Get values from inputs
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
  
      // Basic validation
      if (!email || !password) {
        showAlert("Please fill in all fields.");
        return;
      }
  
      // Send login data to the server
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          showAlert("Login successful!");
          
          // Store token and redirect to the homepage
          sessionStorage.setItem("token", data.token);
          window.location.href = "./admin.html";
        } else {
          showAlert(data.message || "Login failed.");
        }
      } catch (error) {
        console.error("Error:", error);
        showAlert("An error occurred. Please try again.");
      }
    });
  
 // Function to show a custom alert message
 function showAlert(message) {
    const alertBox = document.createElement("div");
    alertBox.className = "custom-alert";
    alertBox.innerHTML = `
            <div class="alert-content">
              <span>${message}</span>
            </div>
          `;
    document.body.appendChild(alertBox);
    setTimeout(() => (alertBox.style.display = "none"), 3000);
  }
  });
  