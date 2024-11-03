document.addEventListener("DOMContentLoaded", function() {
    // Initialize the Google Sign-In Button
    window.onload = function () {
      google.accounts.id.initialize({
        client_id: "738754584957-aftsi9qe2riqpuo6sves3q9916ptmqub.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("googleLoginButton"),
        { theme: "outline", size: "large" } // Customize button style here
      );
    };
  
    // Function to handle credential response from Google
    function handleCredentialResponse(response) {
      // Decode JWT to get user information
      const token = response.credential;
  
      // Send Google token to the backend
      fetch("http://localhost:5000/api/v1/users/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            
        // Store token in session storage to track login state (expires on page close)
        sessionStorage.setItem("token", token);
        const userInfo = parseJwt(token);
        showAlert(`Welcome, ${userInfo.name}`);
          } else {
            showAlert(data.message);
          }
        })
        .catch(error => {
          console.error("Error:", error);
          showAlert("Failed to log in with Google. Please try again.");
        });
    }
  
     // Hide Google Login Button after successful sign-in
    if(userInfo.name) {
        document.getElementById("googleLoginButton").style.display = "none";
    }


    // Helper function to decode JWT token to extract user info
    function parseJwt(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    }
  
    // Function to show a custom alert message
    function showAlert(message) {
      const alertBox = document.createElement("div");
      alertBox.className = "custom-alert";
      alertBox.innerHTML = `
        <div class="alert-content">
          <span>${message}</span>
          <button class="btn-close" onclick="this.parentElement.style.display='none'">&times;</button>
        </div>
      `;
      document.body.appendChild(alertBox);
      setTimeout(() => alertBox.style.display = "none", 3000);
    }
  });
  