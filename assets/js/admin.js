document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "http://localhost:5000/api/v1/bookings/admin"; // Update with the actual API base URL
    const token = sessionStorage?.getItem("token"); // Assume token is stored in session storage
  
    // Function to load and display unavailable dates from the server
    async function loadUnavailableDates() {
      try {
        const response = await fetch(`${API_URL}/get-unavailable-dates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          displayUnavailableDates(data.dates);
        } else {
          console.error("Failed to load unavailable dates:", data.message);
        }
      } catch (error) {
        console.error("Error loading unavailable dates:", error);
      }
    }
  
    // Display unavailable dates in the DOM
    function displayUnavailableDates(dates) {
      const unavailableDatesList = document.getElementById("unavailableDatesList");
      unavailableDatesList.innerHTML = ""; // Clear previous content
  
      dates.forEach((date) => {
        const dateItem = document.createElement("div");
        dateItem.className = "date-item";
        dateItem.innerHTML = `
          <span>${new Date(date).toLocaleDateString()}</span>
          <button class="remove-date" data-date="${date}">Remove</button>
        `;
        unavailableDatesList.appendChild(dateItem);
      });
    }
  
    // Function to add an unavailable date
    document.getElementById("addUnavailableDate").addEventListener("click", async function() {
      const dateInput = document.getElementById("unavailableDate").value;
      if (!dateInput) {
        showAlert("Please select a date.");
        return;
      }
  
      try {
        const response = await fetch(`${API_URL}/set-unavailable-dates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ dates: [dateInput] }) // Send date as an array
        });
  
        if (response.ok) {
          showAlert("Date added to unavailable list.");
          loadUnavailableDates(); // Refresh list of unavailable dates
        } else {
          const data = await response.json();
          showAlert(data.message || "Failed to set date as unavailable.");
        }
      } catch (error) {
        console.error("Error setting unavailable date:", error);
        showAlert("Error setting date as unavailable.");
      }
    });
  
    // Event listener to remove an unavailable date
    document.getElementById("unavailableDatesList").addEventListener("click", async function(event) {
      if (event.target.classList.contains("remove-date")) {
        const dateToRemove = event.target.getAttribute("data-date");
  
        try {
          const response = await fetch(`${API_URL}/remove-unavailable-date`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ date: dateToRemove })
          });
  
          if (response.ok) {
            showAlert("Date removed from unavailable list.");
            loadUnavailableDates(); // Refresh list of unavailable dates
          } else {
            const data = await response.json();
            showAlert(data.message || "Failed to remove date.");
          }
        } catch (error) {
          console.error("Error removing unavailable date:", error);
          showAlert("Error removing date.");
        }
      }
    });
  
    // loadUnavailableDates();  Initial load of unavailable dates


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
    setTimeout(() => (alertBox.style.display = "none"), 3000);
  }
  });
  