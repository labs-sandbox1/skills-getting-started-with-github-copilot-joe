document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Fetch and display activities
  async function loadActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Display each activity
      for (const [name, details] of Object.entries(activities)) {
        // Create activity card
        const card = document.createElement("div");
        card.className = "activity-card";

        const participantsHtml =
          details.participants.length > 0
            ? `<ul class="participants-list">${details.participants.map((p) => `<li>${p}</li>`).join("")}</ul>`
            : `<p class="no-participants">No participants yet</p>`;

        card.innerHTML = `
          <h4>${name}</h4>
          <p><strong>Description:</strong> ${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Capacity:</strong> ${details.participants.length}/${details.max_participants}</p>
          <div class="participants-section">
            <h5>Participants (${details.participants.length}):</h5>
            ${participantsHtml}
          </div>
        `;
        activitiesList.appendChild(card);

        // Add to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      }
    } catch (error) {
      activitiesList.innerHTML = '<p class="error">Failed to load activities</p>';
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    if (!activity) {
      showMessage("Please select an activity", "error");
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const data = await response.json();
        showMessage(data.message, "success");
        signupForm.reset();
        loadActivities(); // Reload activities to show updated participants
      } else {
        const error = await response.json();
        showMessage(error.detail, "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
    }
  });

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");
    setTimeout(() => messageDiv.classList.add("hidden"), 5000);
  }

  // Initial load
  loadActivities();
});
