document.addEventListener("DOMContentLoaded", function() {
  const API_URL = 'http://localhost:5000/api/v1/bookings';

  // Elements for opening and closing the modal
  const bookingModal = document.getElementById("bookingModal");
  const openModalBtn = document.getElementById("openBookingSystem");
  const closeModalBtn = document.getElementById("closeModal") || bookingModal.querySelector(".close-btn");
  const bookingDateInput = document.getElementById("bookingDate");

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
    setTimeout(() => alertBox.style.display = "none", 3000);
  }

  // Function to show the modal
  function showModal() {
    bookingModal.style.display = "flex"; // or "block" depending on styling preference
    resetModal(); // Reset modal UI on open
  }

  // Function to hide the modal
  function hideModal() {
    bookingModal.style.display = "none";
  }

  // Open modal when "Book an Appointment" button is clicked
  openModalBtn.addEventListener("click", function() {
    console.log("Open modal button clicked"); // Debugging log
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

  // Call setMinDate on page load to set the minimum booking date to today
  setMinDate();

  // Reset modal form and UI
  function resetModal() {
    console.log("Resetting modal"); // Debugging log
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
    resetTimeOptions(); // Reset all options whenever the date changes
    console.log("Date selected:", date); // Debugging log

    if (date) {
      try {
        // Send a request to get unavailable slots for this date
        const response = await fetch(`${API_URL}/check-availability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date })
        });
        const data = await response.json();
        console.log("Unavailable times:", data.unavailableTimes); // Debugging log

        // Update time slots based on availability
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
    const date = document.getElementById("bookingDate").value;
    const time = document.getElementById("bookingTime").value;
    const customerName = document.getElementById("customerName").value;
    const customerEmail = document.getElementById("customerEmail").value;
    const customerPhone = document.getElementById("customerPhone").value;

    // Validate form inputs
    if (!date || !time || !customerName || !customerEmail || !customerPhone) {
      showAlert("Please fill in all details.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/create-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, customerName, customerEmail, customerPhone })
      });

      const data = await response.json();
      if (response.ok) {
        showAlert("Booking confirmed!");
        hideModal(); // Hide the modal after confirming
      } else {
        showAlert(data.message);
      }
    } catch (error) {
      showAlert("Error creating booking. Try again later.");
    }
  });
});
