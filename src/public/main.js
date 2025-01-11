document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("presentationForm");
  const urlContainer = form.querySelector(".url-inputs");
  const fileContainer = form.querySelector(".file-inputs");

  // Setup paste handlers for existing file inputs
  document
    .querySelectorAll('.file-inputs input[type="file"]')
    .forEach(setupPasteHandler);
});

document
  .getElementById("presentationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Add spinner and disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${originalText}<span class="spinner"></span>`;

    const formData = new FormData(e.target);
    const data = {
      urls: [formData.get("url1"), formData.get("url2"), formData.get("url3")],
      ratio: parseFloat(formData.get("ratio")),
      email: formData.get("email"),
    };

    // Convert file inputs to base64
    const imagePromises = ["image1", "image2", "image3"].map(async (name) => {
      const file = formData.get(name);
      if (!file) return null;
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
    });

    data.images = await Promise.all(imagePromises);

    try {
      const response = await fetch("/api/presentations/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to generate presentation: ${errorData.error}\n` +
            `Step: ${errorData.step || "Request"}\n` +
            `Details: ${errorData.details || "Unknown error"}`
        );
      }

      alert("Presentation generated and sent to your email!");
    } catch (error) {
      console.error(error);
      alert(
        error.message || "Failed to generate presentation. Please try again."
      );
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

document
  .querySelectorAll('.file-inputs input[type="file"]')
  .forEach((input) => {
    input.addEventListener("paste", async (e) => {
      e.preventDefault();
      const items = e.clipboardData?.items;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            // Create a DataTransfer object to set the input's files
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;

            // Update visual feedback
            input.dispatchEvent(new Event("change"));
          }
        }
      }
    });
  });

// Make inputs paste-aware
document.querySelectorAll(".file-inputs").forEach((div) => {
  div.addEventListener("click", () => {
    // Focus the input to enable paste
    const input = div.querySelector('input[type="file"]');
    if (input) input.focus();
  });
});
