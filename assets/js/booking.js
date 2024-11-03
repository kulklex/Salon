document.addEventListener("DOMContentLoaded", function() {
  const API_URL = 'http://localhost:5000/api/v1/bookings';

  // Elements for opening and closing the modal
  const bookingModal = document.getElementById("bookingModal");
  const openModalBtn = document.getElementById("openBookingSystem");
  const closeModalBtn = document.getElementById("closeModal") || bookingModal.querySelector(".close-btn");
  const bookingDateInput = document.getElementById("bookingDate");

  // Elements for user auto-fill
  const nameInput = document.getElementById("customerName");
  const emailInput = document.getElementById("customerEmail");

  // Check if the user is logged in
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Custom alert elements
  const alertBox = document.createElement("div");
  alertBox.id = "customAlert";
  alertBox.className = "custom-alert";
  alertBox.style.display = "none";
  document.body.appendChild(alertBox);

  // Function to show a custom alert message
  function showAlert(message) {
    alertBox.innerHTML = `
      <div class="alert-content">
        <span>${message}</span>
      </div>
    `;
    alertBox.style.display = "block";
    setTimeout(() => alertBox.style.display = "none", 5000);
  }

  // Function to show the modal
  function showModal() {
    bookingModal.style.display = "flex";
    resetModal(); // Reset modal UI on open
  }

  // Function to hide the modal
  function hideModal() {
    bookingModal.style.display = "none";
  }

  // Auto-fill user details if logged in
  function fillUserDetails() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      nameInput.value = user.name;
      emailInput.value = user.email;
    }
  }

  // Open modal when "Book an Appointment" button is clicked
  openModalBtn.addEventListener("click", function() {
    if (!isLoggedIn) {
      showAlert("Please log in to create a booking.");
      return;
    }
    fillUserDetails(); // Fill user details if logged in
    showModal();
  });

  // Close modal when the close button is clicked
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", hideModal);
  }

  // Close modal when clicking outside the modal content
  window.addEventListener("click", function(event) {
    if (event.target === bookingModal) {
      hideModal();
    }
  });

  // Set minimum selectable date to today
  function setMinDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    bookingDateInput.setAttribute("min", `${year}-${month}-${day}`);
  }

  setMinDate(); // Initialize minimum date on load

  // Reset modal form and UI
  function resetModal() {
    document.getElementById("bookingDate").value = '';
    document.getElementById("bookingTime").selectedIndex = 0;
    document.getElementById("availabilityStatus").innerHTML = '';
    resetTimeOptions();
  }

  // Reset all time options to be enabled and available
  function resetTimeOptions() {
    document.querySelectorAll('#bookingTime option').forEach(option => {
      option.classList.remove('disabled-slot', 'slot-unavailable', 'slot-available');
      option.disabled = false;
      option.textContent = option.value ? `${option.value} AM/PM` : 'Choose a time slot...';
    });
  }

  // Check availability when a date is selected
  document.getElementById("bookingDate").addEventListener("change", async function() {
    const date = this.value;
    resetTimeOptions();

    if (date) {
      try {
        const response = await fetch(`${API_URL}/check-availability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date })
        });
        const data = await response.json();
        updateTimeSlots(data.unavailableTimes || []);
      } catch (error) {
        document.getElementById("availabilityStatus").innerHTML = `<span class="text-danger">Error loading availability. Please try again.</span>`;
      }
    }
  });

  // Disable unavailable time slots in the dropdown
  function updateTimeSlots(unavailableTimes) {
    const timeOptions = document.querySelectorAll('#bookingTime option');
    timeOptions.forEach(option => {
      if (option.value) {
        if (unavailableTimes.includes(option.value)) {
          option.classList.add('disabled-slot', 'slot-unavailable');
          option.textContent = `${option.value} AM/PM (Unavailable)`;
          option.disabled = true;
        } else {
          option.classList.add('slot-available');
        }
      }
    });
  }

  // Confirm Booking function
  document.getElementById("confirmBooking").addEventListener("click", async function() {
    if (!isLoggedIn) {
      showAlert("Please log in to confirm the booking.");
      return;
    }
    
    const date = document.getElementById("bookingDate").value;
    const time = document.getElementById("bookingTime").value;
    const customerName = nameInput.value;
    const customerEmail = emailInput.value;
    const customerPhone = document.getElementById("customerPhone").value;

    if (!date || !time || !customerName || !customerEmail || !customerPhone) {
      showAlert("Please fill in all details.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/create-booking`, {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ date, time, customerName, customerEmail, customerPhone })
      });

      const data = await response.json();
      if (response.ok) {
        showAlert("Booking confirmed!");
        hideModal(); 
        // Optionally refresh bookings here if needed
      } else {
        showAlert(data.message);
      }
    } catch (error) {
      showAlert("Error creating booking. Try again later.");
    }
  });

  // Function to delete a booking
  async function deleteBooking(bookingId) {
    if (!isLoggedIn) {
      showAlert("Please log in to delete a booking.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/delete-booking/${bookingId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("Booking deleted successfully.");
        document.querySelector(`[data-booking-id="${bookingId}"]`).remove();
      } else {
        showAlert(data.message || "Failed to delete booking.");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      showAlert("An error occurred. Please try again.");
    }
  }

  // Event listener for delete booking button
  document.addEventListener("click", function(event) {
    if (event.target.classList.contains("btn-delete-booking")) {
      const bookingId = event.target.getAttribute("data-booking-id");
      if (bookingId) {
        deleteBooking(bookingId);
      } else {
        showAlert("Booking ID not found.");
      }
    }
  });
});
