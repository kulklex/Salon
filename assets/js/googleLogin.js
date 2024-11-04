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
  
        try {
              // Send Google token to the backend
      fetch("http://localhost:5000/api/v1/auth/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      }).then(response => response.json())
            // Store token in session storage to track login state (expires on page close)
        sessionStorage.setItem("token", token);
        if (sessionStorage.getItem(token)) {
          const userInfo = parseJwt(token);
        showAlert(`Welcome, ${userInfo.name}`);
        
      //fetch user
        fetchUserBookings();
      }
        

        // Hide Google Login Button after successful sign-in
        toggleLoginUI(true)
        } catch 
          (error) {
          console.error("Error:", error);
          showAlert("Failed to log in with Google. Please try again.");
        };
}

// Helper function to toggle UI elements based on login status
function toggleLoginUI(isLoggedIn) {
  const googleLoginButton = document.getElementById("googleLoginButton");
  const myBookingsLink = document.getElementById("myBookings");

  if (isLoggedIn) {
    googleLoginButton.style.display = "none";
    myBookingsLink.style.display = "block";
  } else {
    googleLoginButton.style.display = "block";
    myBookingsLink.style.display = "none";
  }
}

 // Check login status on page load and update UI
 const token = sessionStorage.getItem("token");
 if (token) {
   // If a token exists, hide Google Login and show "My Bookings"
   toggleLoginUI(true);
 } else {
   // If no token, show Google Login button
   toggleLoginUI(false);
 }

// Update this function in your main JavaScript file
async function fetchUserBookings() {
  const token = sessionStorage.getItem("token");
  if (!token) {
    showAlert("Please log in to view your bookings.");
    return;
  }

  
    const response = await fetch("http://localhost:5000/api/v1/auth/user-bookings", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();
    console.log(data)
    if (data.success && data.bookings.length > 0) {
      displayBookings(data.bookings);
    } else {
      document.getElementById("noBookingsMessage").style.display = `"block"`;
    }
}

// Function to display bookings on the frontend
function displayBookings(bookings) {
  const bookingsContainer = document.getElementById("bookingsContainer");
  bookingsContainer.innerHTML = ""; // Clear existing bookings
  document.getElementById("noBookingsMessage").style.display = "none"; // Hide "No bookings" message

  bookings.forEach(booking => {
    const bookingElement = document.createElement("div");
    bookingElement.className = "booking-entry";
    bookingElement.innerHTML = `
      <div>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
      </div>
      <button class="btn-delete-booking" data-booking-id="${booking._id}">Delete Booking</button>
    `;
    bookingsContainer.appendChild(bookingElement);
  });
  document.getElementById("userBookingsSection").style.display = "block"; 
}

// Add a call to `fetchUserBookings()` if the token exists on page load
if (sessionStorage.getItem("token")) {
  fetchUserBookings();
}



// Event listener for Delete button
document.addEventListener("click", function(event) {
  if (event.target.classList.contains("btn-delete-booking")) {
    const bookingId = event.target.getAttribute("data-booking-id");
    deleteBooking(bookingId);
  }
});

// Prevent booking if not logged in
document.getElementById("openBookingSystem").addEventListener("click", function(event) {
  if (!sessionStorage.getItem("token")) {
    showAlert("Please log in to create a booking.");
    event.preventDefault();
  }
});

// Function to delete booking
async function deleteBooking(bookingId) {
  const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:5000/api/v1/bookings/delete-booking/${bookingId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.success) {
      showAlert("Booking deleted successfully.");
      fetchUserBookings(); // Refresh bookings list
    } else {
      showAlert(data.message);
    }
  } catch (error) {
    showAlert("Error deleting booking. Please try again.");
  }
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
        </div>
      `;
      document.body.appendChild(alertBox);
      setTimeout(() => alertBox.style.display = "none", 3000);
    }
  })
  