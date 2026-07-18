// Time-aware greeting
(function () {
  const hour = new Date().getHours();
  let text = "Good morning";
  let emoji = "☀️"; // sun

  if (hour >= 12 && hour < 17) {
    text = "Good afternoon";
    emoji = "🌤️"; // sun behind small cloud
  } else if (hour >= 17 || hour < 5) {
    text = "Good evening";
    emoji = "🌙"; // crescent moon
  }

  document.getElementById("greeting-text").textContent = text;
  document.getElementById("greeting-emoji").textContent = emoji;
})();

// Suggestion chips fill the composer
const promptInput = document.getElementById("prompt");

document.querySelectorAll(".chip[data-prompt]").forEach((chip) => {
  chip.addEventListener("click", () => {
    promptInput.value = chip.dataset.prompt;
    promptInput.focus();
    promptInput.setSelectionRange(promptInput.value.length, promptInput.value.length);
  });
});

// Composer submit — placeholder until the backend exists
document.getElementById("composer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const query = promptInput.value.trim();
  if (!query) {
    promptInput.focus();
    return;
  }
  console.log("Sela query:", query);
  alert("Sela is coming soon! You asked:\n\n" + query);
});

// Enter sends, Shift+Enter adds a newline
promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    document.getElementById("composer-form").requestSubmit();
  }
});
