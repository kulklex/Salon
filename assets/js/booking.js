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
  

  // Other elements
  const selectedStyle = document.getElementById("styleSelect").value;
  const bookingNote = document.getElementById("bookingNote").value;

  console.log("Selected Style:", selectedStyle)

  // Check if the user is logged in
  const token = sessionStorage.getItem("token");
  const isLoggedIn = !!token;
  const user = parseJwt(token);


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
    if (user) {
      nameInput.value = user.name;
      emailInput.value = user.email;
    }
  }

    // Helper function to decode JWT token to extract user info
    function parseJwt(token) {
      const base64Url = token?.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    }

  // Open modal when "Book an Appointment" button is clicked
  openModalBtn.addEventListener("click", function(event) {
    if (!isLoggedIn) {
      showAlert("Please log in to create a booking.");
      event.preventDefault();
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

    if (!date || !time || !customerName || !customerEmail || !customerPhone || selectedStyle === "") {
      console.log("Selected Style:", selectedStyle)
      showAlert("Please fill in all details.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/create-booking`, {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ date, time, customerName, customerEmail, customerPhone, selectedStyle, bookingNote})
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

    // Function to check login status and update UI accordingly
    function updateUI() {
      const isLoggedIn = !!sessionStorage.getItem("token");
      
      // Show or hide Google login button based on login status
      googleLoginButton.style.display = isLoggedIn ? "none" : "block";
    }
  
    // Run UI update on page load
    updateUI();

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
});
