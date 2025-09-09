const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

let chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]");

// Render chat message
function renderMessage(sender, text) {
  const div = document.createElement("div");
  div.classList.add("message", "max-w-[70%]", "p-3", "rounded-xl", "break-words");

  if (sender === "user") {
    div.classList.add(
      "self-end",
      "bg-blue-600", "text-white",
      "rounded-br-none",
      "shadow-md"
    );
  } else {
    div.classList.add(
      "self-start",
      "bg-gray-200", "text-gray-900",
      "dark:bg-gray-700", "dark:text-gray-100",
      "rounded-bl-none",
      "shadow-sm"
    );
  }

  div.innerHTML = marked.parse(text);
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}


// Send message
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  renderMessage("user", text);
  chatHistory.push({ sender: "user", text });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  userInput.value = "";

  // Typing indicator
  renderMessage("bot", "🤖 Bot is typing...");
  const botDiv = chatBox.lastChild;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: text,       // ✅ include user query
        history: chatHistory // ✅ include conversation so far
      })
    });

    const data = await res.json();
    botDiv.remove(); // remove typing
    renderMessage("bot", data.answer);

    chatHistory.push({ sender: "bot", text: data.answer });
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  } catch (err) {
    botDiv.remove();
    renderMessage("bot", "❌ Error: Could not get response.");
    console.error(err);
  }
}

// Load previous chat history
chatHistory.forEach(msg => renderMessage(msg.sender, msg.text));

// Send message on Enter key
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
