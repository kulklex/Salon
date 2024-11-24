document.addEventListener("DOMContentLoaded", function () {
  const bookingsContainer = document.getElementById("bookingsContainer");
  const noBookingsMessage = document.getElementById("noBookingsMessage");
  const removePastBookingsBtn = document.getElementById("removePastBookings");

  const API_URL = "https://app.tifehairhaven.co.uk/api/v1";

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
    setTimeout(() => (alertBox.style.display = "none"), 3000);
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
      const response = await fetch(`${API_URL}/auth/user-bookings`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response data:", errorData);
        showAlert(
          errorData.message || "Error fetching bookings. Please try again."
        );
        return;
      }

      const data = await response.json();

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

    bookings.forEach((booking) => {
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

  // Event listener for Delete button
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("btn-delete-booking")) {
      const bookingId = event.target.getAttribute("data-booking-id");
      deleteBooking(bookingId);
    }
  });

  // Function to delete booking
  async function deleteBooking(bookingId) {
    const token = sessionStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/bookings/admin/delete-booking/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  // Function to remove past bookings
  async function removePastBookings() {
    try {
      const response = await fetch(
        `${API_URL}/bookings/admin/remove-past-bookings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        showAlert("Past bookings removed successfully.", "success");
        fetchUserBookings(); // Refresh the bookings list
      } else {
        showAlert(data.message, "warning");
      }
    } catch (error) {
      console.error("Error removing past bookings:", error);
      showAlert("Error removing past bookings. Please try again.", "danger");
    }
  }

  // Event listener for Remove Past Bookings button
  // removePastBookingsBtn.addEventListener("click", function () {
  //   removePastBookings();
  // });

});
