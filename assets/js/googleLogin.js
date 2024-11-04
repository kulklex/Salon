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
        const userInfo = parseJwt(token);
        showAlert(`Welcome, ${userInfo.name}`);
        fetchUserBookings();
        // Hide Google Login Button after successful sign-in
        if(userInfo) {
        document.getElementById("googleLoginButton").style.display = "none";
        document.getElementById("myBookings").style.display = "block";
    }
        } catch 
          (error) {
          console.error("Error:", error);
          showAlert("Failed to log in with Google. Please try again.");
        };
}

// Update this function in your main JavaScript file
async function fetchUserBookings() {
  const token = sessionStorage.getItem("token");
  if (!token) {
    showAlert("Please log in to view your bookings.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/v1/auth/user-bookings", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success && data.bookings.length > 0) {
      displayBookings(data.bookings);
    } else {
      document.getElementById("noBookingsMessage").style.display = "block";
    }
  } catch (error) {
    console.error(error)
    showAlert("Error fetching bookings. Please try again.");
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
        <p><strong>Customer:</strong> ${booking.customerName}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
      </div>
      <button class="btn-delete-booking" data-booking-id="${booking._id}">Delete Booking</button>
    `;
    bookingsContainer.appendChild(bookingElement);
  });
  document.getElementById("userBookingsSection").style.display = "block"; // Show bookings section
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
          <button class="btn-close" onclick="this.parentElement.style.display='none'">&times;</button>
        </div>
      `;
      document.body.appendChild(alertBox);
      setTimeout(() => alertBox.style.display = "none", 3000);
    }
  })
  