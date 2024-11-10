document.addEventListener("DOMContentLoaded", function () {
  const API_URL = 'http://localhost:5000/api/v1'; 

  // Elements for opening and closing the modal
  const openModalBtn = document.getElementById("openBookingSystem");
  const bookingModal = document.getElementById("bookingModal");
  const bookingDateInput = document.getElementById("bookingDate");
  const closeModalBtn = document.getElementById("closeModal") || bookingModal.querySelector(".close-btn");

  // Function to show the modal
  function showModal() {
    bookingModal.style.display = "flex";
    resetModal(); // Reset modal UI on open
  }

  // Function to hide the modal
  function hideModal() {
    bookingModal.style.display = "none";
    resetModal();
  }

  // Open modal when "Book an Appointment" button is clicked
  openModalBtn.addEventListener("click", function (event) {
    showModal();
  });

  // Close modal when the close button is clicked
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", hideModal);
  }

  // Close modal when clicking outside the modal content
  window.addEventListener("click", function (event) {
    if (event.target === bookingModal) {
      hideModal();
    }
  });

  // Initialize Flatpickr on the date input
  function initializeDatePicker(unavailableDates = []) {
    flatpickr(bookingDateInput, {
      enableTime: false, // No time selection
      dateFormat: "Y-m-d",
      minDate: "today", // Start from today
      disable: unavailableDates, // Array of unavailable dates
      onChange: function (selectedDates, dateStr, instance) {
        if (unavailableDates.includes(dateStr)) {
          showAlert("This date is unavailable for booking.");
          instance.clear(); // Clear the selected date if unavailable
        }
      },
    });
  }

  // Fetch unavailable dates and initialize Flatpickr with them
  async function fetchUnavailableDates() {
    try {
      const response = await fetch(`${API_URL}/bookings/admin/get-unavailable-dates`, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) {
        initializeDatePicker(data.dates || []);
      } else {
        console.error("Failed to fetch unavailable dates:", data.message);
      }
    } catch (error) {
      console.error("Error fetching unavailable dates:", error);
    }
  }

  fetchUnavailableDates(); // Initialize Flatpickr with unavailable dates from API

  // Reset modal form and UI
  function resetModal() {
    document.getElementById("bookingDate").value = "";
    document.getElementById("bookingTime").selectedIndex = 0;
    document.getElementById("availabilityStatus").innerHTML = "";
    resetTimeOptions();
  }

  // Reset all time options to be enabled and available
  function resetTimeOptions() {
    document.querySelectorAll("#bookingTime option").forEach((option) => {
      option.classList.remove("disabled-slot", "slot-unavailable", "slot-available");
      option.disabled = false;
      option.textContent = option.value ? `${option.value} AM/PM` : "Choose a time slot...";
    });
  }

  // Check availability when a date is selected
  bookingDateInput.addEventListener("change", async function () {
    const date = this.value;
    resetTimeOptions();

    if (date) {
      try {
        const response = await fetch(`${API_URL}/bookings/check-availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date }),
        });
        const data = await response.json();

        if (data.unavailable) {
          showAlert("This date is unavailable for booking.");
          bookingDateInput.value = ""; // Clear the selected date
        } else {
          updateTimeSlots(data.unavailableTimes || []);
        }
      } catch (error) {
        document.getElementById("availabilityStatus").innerHTML = `<span class="text-danger">Error loading availability. Please try again.</span>`;
      }
    }
  });

  // Disable unavailable time slots in the dropdown
  function updateTimeSlots(unavailableTimes) {
    const timeOptions = document.querySelectorAll("#bookingTime option");
    timeOptions.forEach((option) => {
      if (option.value) {
        if (unavailableTimes.includes(option.value)) {
          option.classList.add("disabled-slot", "slot-unavailable");
          option.textContent = `${option.value} AM/PM (Unavailable)`;
          option.disabled = true;
        } else {
          option.classList.add("slot-available");
        }
      }
    });
  }

  // Confirm Booking function
  document.getElementById("confirmBooking").addEventListener("click", async function () {
    const date = document.getElementById("bookingDate").value;
    const time = document.getElementById("bookingTime").value;
    const customerName = document.getElementById("customerName").value;
    const customerEmail = document.getElementById("customerEmail").value;
    const customerPhone = document.getElementById("customerPhone").value;
    const selectedStyle = document.getElementById("styleSelect").value;
    const bookingNote = document.getElementById("bookingNote").value;

    // Validation
    if (!date || !time || !customerName || !customerEmail || !customerPhone || selectedStyle === "") {
      showAlert("Please fill in all details.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bookings/create-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, time, customerName, customerEmail, customerPhone, selectedStyle, bookingNote }),
      });

      const data = await response.json();
      if (response.ok) {
        showAlert("Booking confirmed!");
        hideModal();
      } else {
        showAlert(data.message);
      }
    } catch (error) {
      showAlert("Error creating booking. Try again later.");
    }
  });

  // Function to show a custom alert message
  function showAlert(message) {
    const alertBox = document.createElement("div");
    alertBox.className = "custom-alert";
    alertBox.innerHTML = `<div class="alert-content"><span>${message}</span></div>`;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 3000);
  }
});
