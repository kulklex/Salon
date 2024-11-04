document.addEventListener("DOMContentLoaded", function() {
    const bookingsContainer = document.getElementById("bookingsContainer");
    const noBookingsMessage = document.getElementById("noBookingsMessage");
  
    // Function to show a custom alert
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
  
    // Check if the user is logged in
    const token = sessionStorage.getItem("token");
    if (!token) {
      showAlert("Please log in to view your bookings.");
      window.location.href = "login.html";
      return;
    }
  
    // Fetch user bookings from the backend
    async function fetchUserBookings() {
      try {
        const response = await fetch("http://localhost:5000/api/v1/auth/user-bookings", {
          headers: { "Authorization": `Bearer ${token}` }
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response data:", errorData);
          showAlert(errorData.message || "Error fetching bookings. Please try again.");
          return;
        }
  
        const data = await response.json();
        console.log("Fetched bookings data:", data);
  
        if (data.success && data.bookings.length > 0) {
          displayBookings(data.bookings);
        } else {
          // If no bookings found, show the message
          noBookingsMessage.style.display = "block";
        }
      } catch (error) {
        console.error("Fetch error:", error);
        showAlert("Error fetching bookings. Please try again.");
      }
    }
  
    // Display bookings on the page
    function displayBookings(bookings) {
      bookingsContainer.innerHTML = ""; // Clear existing content
      noBookingsMessage.style.display = "none"; // Hide "No bookings found" message
  
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
    }
  
    // Fetch bookings on page load
    fetchUserBookings();
  });
  