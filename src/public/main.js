document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("presentationForm");

  // Setup paste handler for file input
  document
    .querySelector('.file-inputs input[type="file"]')
    .addEventListener("paste", handlePaste);
});

function handlePaste(e) {
  e.preventDefault();
  const items = e.clipboardData?.items;

  for (const item of items) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        e.target.files = dataTransfer.files;
        e.target.dispatchEvent(new Event("change"));
      }
    }
  }
}

document
  .getElementById("presentationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `${originalText}<span class="spinner"></span>`;

    const formData = new FormData(e.target);
    const data = {
      campaignName: formData.get("campaignName"),
      format: formData.get("format"),
      date: formData.get("date"),
      goal: formData.get("goal"),
      url: formData.get("url"),
      benchmark: formData.get("benchmark"),
      category: formData.get("category"),
      email: formData.get("email"),
    };

    // Convert image to base64
    const file = formData.get("image");
    if (file) {
      data.image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
    }

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
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

// Make input paste-aware
document.querySelector(".file-inputs").addEventListener("click", () => {
  const input = document.querySelector('.file-inputs input[type="file"]');
  if (input) input.focus();
});
