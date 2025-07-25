document.addEventListener("DOMContentLoaded", function () {
  const API_URL = 'https://app.tifehairhaven.co.uk/api/v1'; 

  // Elements for opening and closing the modal
  const openModalBtn = document.getElementById("openBookingSystem");
  const bookingModal = document.getElementById("bookingModal");
  const bookingDateInput = document.getElementById("bookingDate");
  const closeModalBtn = document.getElementById("closeModal")
  
  const removePastUnavailableDatesBtn = document.getElementById("removePastDates");


  // Success and Cancel Payment 
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  if (status === "success") {
    showAlert("Payment successful! Your booking is confirmed.", "success");
  } else if (status === "canceled") {
    showAlert("Payment canceled. Please try again.", "error");
  }


   // Remove the status query parameter from the URL
   if (status) {
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  }


  // Initialize Flatpickr on the date input
function initializeDatePicker(unavailableDates = []) {
  flatpickr(bookingDateInput, {
    enableTime: false, // No time selection
    dateFormat: "Y-m-d",
    minDate: "today", // Start from today
    disable: [
      ...unavailableDates, // Disable unavailable dates
      function (date) {
        // Disable Thursdays (4), Fridays (5), and Saturdays (6)
        const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        return day === 4 || day === 5 || day === 6;
      },
    ],
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
      const response = await fetch(`${API_URL}/bookings/admin/get-unavailable-dates`);
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
    fetchUnavailableDates(); // Refresh fresh dates before opening
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

  // Reset modal form and UI
  function resetModal() {
    document.getElementById("bookingDate").value = "";
    document.getElementById("bookingTime").selectedIndex = 0;
    document.getElementById("availabilityStatus").innerHTML = "";
    resetTimeOptions();
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
        }

        if (data.unavailableSlots || data.unavailableTimes) {
          updateTimeSlots(data.unavailableTimes || [], data.unavailableSlots || []);
        }
      } catch (error) {
        document.getElementById("availabilityStatus").innerHTML = `<span class="text-danger">Error loading availability. Please try again.</span>`;
      }
    }
  });

    // Reset all time options to be enabled and available
    function resetTimeOptions() {
      document.querySelectorAll("#bookingTime option").forEach((option) => {
        option.classList.remove("disabled-slot", "slot-unavailable", "slot-available");
        option.disabled = false;
        option.textContent = option.value ? `${option.value}` : "Choose a time slot...";
      });
    }

  // Disable unavailable time slots in the dropdown
  function updateTimeSlots(unavailableTimes, unavailableSlots) {
    const timeOptions = document.querySelectorAll("#bookingTime option");
    
    timeOptions.forEach((option) => {
      const timeValue = option.value;
  
      
        // Check if the time is in unavailableTimes or unavailableSlots
        if (unavailableTimes.includes(timeValue) || unavailableSlots.includes(timeValue)) {
          option.disabled = true;
          option.classList.add("disabled-slot", "slot-unavailable");
          option.textContent = `${timeValue} (Unavailable)`;
        } else {
          option.disabled = false;
          option.classList.remove("disabled-slot", "slot-unavailable");
          option.textContent = timeValue; // Reset text to default
        }
    });
  }

 document.getElementById("confirmBooking").addEventListener("click", async function () {
  const date = document.getElementById("bookingDate").value;
  const time = document.getElementById("bookingTime").value;
  const customerName = document.getElementById("customerName").value;
  const customerEmail = document.getElementById("customerEmail").value;
  const customerPhone = document.getElementById("customerPhone").value;
  const selectedStyle = document.getElementById("styleSelect").value;
  const bookingNote = document.getElementById("bookingNote").value;

  if (!date || !time || !customerName || !customerEmail || !customerPhone || selectedStyle === "") {
    showAlert("Please fill in all details.");
    return;
  }

  const disAllowedForLateBooking = ["Small Box braids",
      "Medium Box braids",
      "Small Goddess braids",
      "Medium Goddess braids",
      "Small Knotless Braids",
      "Medium Knotless Braids",
      "Big Knotless Braids",
      "Faux Locs"
    ]

    const disAllowedTimesForLateBooking = [
      "04:00 PM", "05:00 PM"
    ]
 
  if (disAllowedForLateBooking.includes(selectedStyle) && disAllowedTimesForLateBooking.includes(time)) {
    showAlert(`${selectedStyle} cannot be booked after 3pm!`);
    return
  }

  try {
    // Create the booking and get the Stripe session ID
    const response = await fetch(`${API_URL}/bookings/create-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, time, customerName, customerEmail, customerPhone, selectedStyle, bookingNote }),
    });

    const data = await response.json();
    if (response.ok) {
      const stripe = Stripe("pk_live_51QPVvNCKHodMFlYyCcfsD7QwCMZQmOC1t24cSxGZnCTtVBANlB45oiems5ViNWLUhr93e018AQRUrYOyGb0BedaW00RxUMSMOw");
      await stripe.redirectToCheckout({ sessionId: data.id });
    } else {
      showAlert(data.message || "Error initiating payment.");
    }
  } catch (error) {
    console.error("Error:", error);
    showAlert("Error creating booking. Try again later.");
  }
});



  // Send a form message
  document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const formData = new FormData(this);
    const formDataObj = {};
    formData.forEach((value, key) => { formDataObj[key] = value });
  
    try {
      const response = await fetch(`${API_URL}/bookings/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObj)
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showAlert("Your message has been sent successfully!", 'success');
        document.getElementById('contactForm').reset();
      } else {
        const errorMessage = data.message || "An error occurred. Please try again.";
        showAlert(errorMessage, 'error');
      }
    } catch (error) {
      // Handle fetch or network errors
      console.error('Error:', error);
      showAlert("Error sending message. Please try again.", 'error');
    }
  });
  


  // Function to show a custom alert message
  function showAlert(message) {
    const alertBox = document.createElement("div");
    alertBox.className = "custom-alert";
    alertBox.innerHTML = `<div class="alert-content"><span>${message}</span></div>`;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 4000);
  }

    // Function to fetch and remove past unavailable dates
    async function removePastUnavailableDates() {
      try {
        const response = await fetch(`${API_URL}/bookings/admin/remove-past-unavailable-dates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
  
        const data = await response.json();
        if (data.success) {
          showAlert("Past unavailable dates removed successfully.");
          fetchUnavailableDates(); // Refresh the unavailable dates list
        } else {
          showAlert(data.message || "Failed to remove past unavailable dates.");
        }
      } catch (error) {
        console.error("Error removing past unavailable dates:", error);
        showAlert("Error removing past unavailable dates. Please try again.");
      }
    }
  
    // Attach event listener to the "Remove Past Unavailable Dates" button
    // removePastUnavailableDatesBtn.addEventListener("click", removePastUnavailableDates);
});
