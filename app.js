document.addEventListener("DOMContentLoaded", function() {
    const API_URL = 'http://localhost:5000/api/v1/bookings';
  
    // Open modal when "Book an Appointment" button is clicked
    document.getElementById("openBookingSystem").addEventListener("click", function() {
      $('#bookingModal').modal('show');
      resetModal(); // Reset modal UI on open
    });
  
    // Resets modal form and UI
    function resetModal() {
      document.getElementById("bookingDate").value = '';
      document.getElementById("bookingTime").selectedIndex = 0;
      document.getElementById("availabilityStatus").innerHTML = '';
      resetTimeOptions();
    }
  
    // Resets all time options to be enabled and available
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
      resetTimeOptions();  // Reset all options whenever the date changes
  
      if (date) {
        try {
          // Send a request to get unavailable slots for this date
          const response = await fetch(`${API_URL}/check-availability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date })
          });
          const data = await response.json();
  
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
        alert("Please fill in all details.");
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
          alert("Booking confirmed!");
          $('#bookingModal').modal('hide');
        } else {
          alert(data.message);
        }
      } catch (error) {
        alert("Error creating booking. Try again later.");
      }
    });
  });
  