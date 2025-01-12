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

// Initialize year select options
function initYearSelect() {
  const yearSelect = document.querySelector('select[name="year"]');
  const currentYear = new Date().getFullYear();

  yearSelect.innerHTML = `
    <option value="${currentYear - 1}">${currentYear - 1}</option>
    <option value="${currentYear}" selected>${currentYear}</option>
    <option value="${currentYear + 1}">${currentYear + 1}</option>
  `;
}

// Call it when page loads
initYearSelect();

document
  .getElementById("presentationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `${originalText}<span class="spinner"></span>`;

    const formData = new FormData(form);
    const data = {
      campaignName: formData.get("campaignName"),
      format: formData.get("format"),
      date: `${formData.get("date")}.${formData.get("year")}`,
      goal: formData.get("goal"),
      url: formData.get("url"),
      benchmark: formData.get("benchmark"),
      category: formData.get("category"),
    };

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

      showToast("Prezentacja wysłana na maila!", "success");
      form.reset();
    } catch (error) {
      console.error(error);
      showToast(error.message || "Coś się nie udało :(", "error");
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

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Add progress bar
  const progress = document.createElement("div");
  progress.className = "toast-progress";
  toast.appendChild(progress);

  // Add click handler
  toast.addEventListener("click", () => {
    toast.classList.remove("show");
    setTimeout(() => container.removeChild(toast), 300);
  });

  container.appendChild(toast);
  toast.offsetHeight; // Trigger reflow

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Remove toast after 10 seconds
  setTimeout(() => {
    if (container.contains(toast)) {
      toast.classList.remove("show");
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }
  }, 10000);
}
