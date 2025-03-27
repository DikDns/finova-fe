document.addEventListener("DOMContentLoaded", () => {
  initializeAIAssistant();
});

function initializeAIAssistant() {
  const aiAssistantBtn = document.querySelector(".ai-assistant-btn");
  const aiAssistantSidebar = document.querySelector(".ai-assistant-sidebar");
  const closeButton = document.querySelector("#closeButton");
  const suggestions = document.querySelectorAll(".ai-assistant-suggestion");
  const tabs = document.querySelectorAll(".ai-assistant-tab");
  const sendButton = document.querySelector(".ai-assistant-send-button");
  const inputField = document.querySelector(".ai-assistant-input-field");

  // Toggle sidebar
  aiAssistantBtn.addEventListener("click", () => {
    aiAssistantSidebar.classList.add("show");
  });

  closeButton.addEventListener("click", () => {
    aiAssistantSidebar.classList.remove("show");
  });

  // Handle suggestions click
  suggestions.forEach((suggestion) => {
    suggestion.addEventListener("click", () => {
      const text = suggestion
        .querySelector(".ai-assistant-suggestion-text")
        .textContent.trim();
      inputField.value = text;
    });
  });

  // Handle tabs click
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  // Handle send message
  sendButton.addEventListener("click", handleSendMessage);
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !aiAssistantSidebar.contains(e.target) &&
      !aiAssistantBtn.contains(e.target) &&
      aiAssistantSidebar.classList.contains("show")
    ) {
      aiAssistantSidebar.classList.remove("show");
    }
  });
}

function handleSendMessage() {
  const inputField = document.querySelector(".ai-assistant-input-field");
  const message = inputField.value.trim();

  if (message) {
    // TODO: Handle message sending logic here
    console.log("Sending message:", message);
    inputField.value = "";
  }
}
