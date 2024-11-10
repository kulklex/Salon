document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "http://localhost:5000/api/v1";

    // Select form elements
    const formContainer = document.querySelector(".form-container");
    const nameInput = formContainer.querySelector("input[name='name']");
    const emailInput = formContainer.querySelector("input[type='email']");
    const passwordInput = formContainer.querySelector("input[name='password']");
    const confirmPasswordInput = formContainer.querySelector("input[name='confirmPassword']");
    const registerButton = formContainer.querySelector("button[type='submit']");
  
    // Add event listener for form submission
    registerButton.addEventListener("click", async function (event) {
      event.preventDefault(); // Prevent default form submission behavior
  
      // Get values from inputs
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      const confirmPassword = confirmPasswordInput.value.trim();
      const name = nameInput.value.trim();


      // Basic validation
      if (!name || !email || !password || !confirmPassword) {
        showAlert("Please fill in all fields.");
        return;
      }

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email.match(emailPattern)) {
        showAlert("Invalid email address.");
        return;
      }
  
      if (password !== confirmPassword) {
        showAlert("Passwords do not match.");
        return;
      }
  
      // Send registration data to the server
      try {
        const response =  await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, confirmPassword }),
        });
  
        await response.json().then(data => {
             if (response.ok && data.token) {
          showAlert("Registration successful!");
          window.location.href = "./login.html"; // Redirect to login page
        } else {
          showAlert(data.message || "Registration failed.");
        }
        });
  
       
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
  