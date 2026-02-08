document
  .getElementById("form-contact")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get form values
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    // Log form values to check if they are correct
    console.log("Form Data: ", { firstName, lastName, email, message });

    // Create form data object
    const formData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      message: message,
    };

    // Get the submit button and change its text to "Submitting..."
    const submitButton = document.querySelector(".contact-btn");
    submitButton.textContent = "Submitting...";
    submitButton.disabled = true; // Disable the button to prevent multiple submissions

    // Use Fetch to send form data to server
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: document.getElementById("first-name").value.trim(),
        lastName: document.getElementById("last-name").value.trim(),
        email: document.getElementById("email").value.trim(),
        message: document.getElementById("message").value.trim(),
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Server error");
        }
        return res.text();
      })
      .then(() => {
        const feedbackMessage = document.getElementById("feedback-message");
        feedbackMessage.textContent =
          "Message sent! We'll get back to you soon.";
        feedbackMessage.style.color = "green";
        feedbackMessage.style.display = "block";

        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((error) => {
        console.log("Error:", error);

        const feedbackMessage = document.getElementById("feedback-message");
        feedbackMessage.textContent = "Failed to send email. Please try again";
        feedbackMessage.style.color = "red";
        feedbackMessage.style.display = "block";
      });
  });
