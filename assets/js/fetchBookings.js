document.addEventListener("DOMContentLoaded", function() {
    // Function to show a custom alert
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
  
    // Check if the user is logged in
    const token = sessionStorage.getItem("token");
    if (!token) {
      showAlert("Please log in to view your bookings.");
      // Redirect to login page if not logged in
      window.location.href = "login.html";
      return;
    }
  
    // Fetch user bookings from the backend
    async function fetchUserBookings() {
        const token = sessionStorage.getItem("token");
        if (!token) {
          showAlert("Please log in to view your bookings.");
          window.location.href = "login.html";
          return;
        }
      
        try {
          const response = await fetch("http://localhost:5000/api/v1/auth/user-bookings", {
            headers: { "Authorization": `Bearer ${token}` }
          });
      
          // Handle cases where response isn't okay
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response data:", errorData);
            showAlert(errorData.message || "Error fetching bookings. Please try again.");
            return; // Make sure to exit function if there's an error
          }
      
          const data = await response.json();
          console.log(data)
          if (data.success && data.bookings.length > 0) {
            displayBookings(data.bookings);
          } else {
            document.getElementById("noBookingsMessage").style.display = "block";
          }
        } catch (error) {
          console.error("Fetch error:", error);
          showAlert("Error fetching bookings. Please try again.");
        }
      }
      
  
    // Display bookings on the page
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
    }
  
    // Call fetchUserBookings on page load
    fetchUserBookings();
  });
  