document.addEventListener("DOMContentLoaded", async () => {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const newChatBtn = document.getElementById("newChatBtn");
  const clearConversationsBtn = document.getElementById("clearConversationsBtn");
  const conversationsList = document.getElementById("conversationsList");
  const chatHeader = document.getElementById("chatHeader").querySelector("h2");
  const messagesList = document.getElementById("messagesList");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const editTitleBtn = document.getElementById("editTitleBtn");
  const deleteConversationBtn = document.getElementById("deleteConversationBtn");
  const editTitleModal = document.getElementById("editTitleModal");
  const titleInput = document.getElementById("titleInput");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const saveTitleBtn = document.getElementById("saveTitleBtn");
  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const clearConversationsModal = document.getElementById("clearConversationsModal");
  const cancelClearBtn = document.getElementById("cancelClearBtn");
  const confirmClearBtn = document.getElementById("confirmClearBtn");
  let currentConversationId = null;
  let currentConversation = null;
  const sidebarToggleBtn = document.getElementById("sidebarToggle");

  sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
  let currentUser = null;
  const authContainer = document.createElement("div");
  authContainer.id = "authContainer";
  authContainer.style.padding = "16px";
  authContainer.style.borderTop = "1px solid #45475a";
  conversationsList.parentElement.appendChild(authContainer);

  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = (userInput.scrollHeight) + "px";
  });

  
  
  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/status", { credentials: "include" });
      const data = await res.json();
      if (data.authenticated) {
        currentUser = data.user;
        renderAuth();
        loadConversations();
      } else {
        currentUser = null;
        renderAuth();
        window.location.href = "/auth/discord";
      }
    } catch (e) {
      currentUser = null;
      renderAuth();
      window.location.href = "/auth/discord";
    }
  }

  function renderAuth() {
    authContainer.innerHTML = "";
    authContainer.style.borderTop = "1px solid #45475a"; 
	authContainer.style.marginTop = "0";     
	authContainer.style.paddingTop = "5px";  

    if (!document.getElementById('round-button-styles')) {
      const style = document.createElement("style");
      style.id = 'round-button-styles';
      style.textContent = `.round-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  height: 32px;
  border-radius: 16px;
  padding: 0 14px;
  background: linear-gradient(145deg, #2563eb, #1e40af);
  color: white;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  text-decoration: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;
  margin-left: 12px;
  font-size: 0.85rem;
}

.round-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, #3b82f6, #2563eb);
}

.round-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-button {
  background: linear-gradient(145deg, #5865f2, #4752c4);
  padding: 0 20px;
}

.login-button:hover {
  background: linear-gradient(145deg, #6975f3, #5865f2);
}
`;
      document.head.appendChild(style);
    }
    if (currentUser) {
      const span = document.createElement("span");
      span.textContent = "Logged in as " + currentUser.username;
      const logoutBtn = document.createElement("button");
      logoutBtn.textContent = "Logout";
      logoutBtn.className = "round-button";
      logoutBtn.onclick = () => { window.location.href = "/auth/logout"; };
      authContainer.appendChild(span);
      authContainer.appendChild(logoutBtn);
    } else {
      const loginBtn = document.createElement("button");
      loginBtn.textContent = "Login with Discord";
      loginBtn.className = "round-button login-button";
      loginBtn.onclick = () => { window.location.href = "/auth/discord"; };
      authContainer.appendChild(loginBtn);
    }
  }

  async function loadConversations() {
    try {
      const res = await fetch("/api/conversations", { credentials: "include" });
      const data = await res.json();
      conversationsList.innerHTML = "";
      data.forEach(conv => {
        const template = document.getElementById("conversationItemTemplate");
        const convElem = template.content.cloneNode(true);
        convElem.querySelector(".conversation-title").textContent = conv.title;
        convElem.querySelector(".conversation-item").dataset.id = conv.id;
        convElem.querySelector(".delete-conversation-btn").onclick = (e) => { 
          e.stopPropagation(); 
          openConfirmDeleteModal(conv.id); 
        };
        convElem.querySelector(".conversation-item").onclick = () => { loadConversation(conv.id); };
        conversationsList.appendChild(convElem);
      });
    } catch (e) {}
  }

  async function loadConversation(id) {
    try {
      const res = await fetch(`/api/conversations/${id}`, { credentials: "include" });
      if (res.ok) {
        const conv = await res.json();
        currentConversationId = conv.id;
        currentConversation = conv;
        chatHeader.textContent = conv.title;
        renderMessages(conv.messages);
      }
    } catch (e) {}
  }

  function convertMathDelimiters(html) {
  return html.replace(/(?:^|\n)\[\s*([\s\S]+?)\s*\](?=\n|$)/g, '\n\\[$1\\]\n');
}

function convertMathDelimiters(html) {
  return html.replace(/\[(.*?)\]/gs, function(match, content) {
    return `\\[ ${content} \\]`;
  });
}

async function typeHTMLText(targetElement, html, speed = 20) {
  const dummy = document.createElement("div");
  dummy.innerHTML = html;
  const nodes = Array.from(dummy.childNodes);

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (let char of node.textContent) {
        targetElement.innerHTML += char;
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        await new Promise(resolve => setTimeout(resolve, speed));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = node.cloneNode(false); // clone the element (no children)
      targetElement.appendChild(clone);
      await typeHTMLText(clone, node.innerHTML, speed); // type children inside
    }
  }
}

async function renderAssistantMessageWithTyping(content) {
  const template = document.getElementById("messageTemplate");
  const msgElem = template.content.cloneNode(true);
  const contentElem = msgElem.querySelector(".message-content");

  let parsedContent = marked.parse(content);
  parsedContent = DOMPurify.sanitize(parsedContent);

  messagesList.appendChild(msgElem);
  messagesList.scrollTop = messagesList.scrollHeight;

  await typeTextWithHTML(contentElem, parsedContent, 15);
}



function renderMessages(messages) {
  messagesList.innerHTML = "";
  messages.forEach(msg => {
    const template = document.getElementById("messageTemplate");
    const msgElem = template.content.cloneNode(true);
    msgElem.querySelector(".message").classList.add(msg.role);
    const contentElem = msgElem.querySelector(".message-content");
    let parsedContent = marked.parse(msg.content);
    parsedContent = DOMPurify.sanitize(parsedContent);
    parsedContent = convertMathDelimiters(parsedContent);

    contentElem.innerHTML = parsedContent;

    contentElem.querySelectorAll("pre code").forEach(block => {
      hljs.highlightElement(block);
    });
    contentElem.querySelectorAll("pre").forEach(pre => {
      const codeBlock = pre.querySelector("code");
      if (codeBlock && !pre.querySelector(".code-copy-btn")) {
        const copyBtn = document.createElement("button");
        copyBtn.className = "code-copy-btn";
        copyBtn.textContent = "Copy";
        copyBtn.style.position = "absolute";
        copyBtn.style.top = "5px";
        copyBtn.style.right = "5px";
        copyBtn.style.zIndex = "10";
        copyBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          const codeText = codeBlock.innerText;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(codeText)
              .then(() => {
                copyBtn.textContent = "Copied!";
                setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
              })
              .catch(err => console.error("Failed to copy code:", err));
          } else {
            const textarea = document.createElement("textarea");
            textarea.value = codeText;
            document.body.appendChild(textarea);
            textarea.select();
            try {
              document.execCommand("copy");
              copyBtn.textContent = "Copied!";
              setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000);
            } catch (err) {
              console.error("Fallback: Unable to copy", err);
            }
            document.body.removeChild(textarea);
          }
        });
        pre.style.position = "relative";
        pre.appendChild(copyBtn);
      }
    });
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetPromise([contentElem]).catch(err => console.error("MathJax error:", err));
    }
    msgElem.querySelector(".copy-btn").onclick = () => {
      navigator.clipboard.writeText(msg.content);
    };
    messagesList.appendChild(msgElem);
  });
  
  messagesList.scrollTop = messagesList.scrollHeight;
  
}



  function addLoadingIndicator() {
    const loadingElem = document.createElement("div");
    loadingElem.classList.add("message", "assistant", "loading");
    loadingElem.innerHTML = '<div class="message-content"><em>Loading...</em></div>';
    messagesList.appendChild(loadingElem);
    messagesList.scrollTop = messagesList.scrollHeight;
    return loadingElem;
  }

async function sendMessage() {
  const text = userInput.value.trim();

  if (!text) {
    userInput.focus();  // put cursor back
    return; // If empty, exit safely without disabling
  }
  const userMessage = text;
  userInput.value = "";
  if (!currentConversation) {
    currentConversation = { messages: [] };
  }
  currentConversation.messages.push({ role: 'user', content: userMessage });
  if ((!currentConversation.title || currentConversation.title === "New Conversation") && isComplexQuestion(userMessage)) {
    const autoTitle = await getConversationTitle(userMessage);
    if (autoTitle) {
      currentConversation.title = autoTitle;
      chatHeader.textContent = autoTitle;
    }
  }
  renderMessages(currentConversation.messages);
  const loadingElem = addLoadingIndicator();
  sendBtn.disabled = true;
  const model = selectedModel;
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message: userMessage, conversationId: currentConversationId, model })
    });
    if (res.ok) {
      const data = await res.json();
      currentConversationId = data.conversationId;
      currentConversation = data.conversation;
      if (loadingElem) {
        messagesList.removeChild(loadingElem);
      }
      renderMessages(currentConversation.messages);
      loadConversations();
    } else {
      const errorData = await res.json();
      alert(errorData.error || "Failed to send message.");
    }
  } catch (e) {
    console.error(e);
    alert("Error sending message.");
  }
  sendBtn.disabled = false;
  userInput.focus(); 
}

async function getConversationTitle(question) {
  const prompt = `The user asked this question - "${question}". Based on the question, give a small conversation name.`;
  try {
    const res = await fetch("/api/conversationTitle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    if (res.ok) {
      const data = await res.json();
      return data.title.trim();
    }
  } catch (e) {}
  return null;
}

function isComplexQuestion(text) {
  const trimmed = text.trim().toLowerCase();
  const words = trimmed.split(/\s+/);
  if (words.length < 5) return false;
  const trivialPhrases = ["hi", "hello", "how are you", "who are you", "what's up", "hey"];
  if (trivialPhrases.includes(trimmed)) return false;
  return true;
}



  sendBtn.onclick = sendMessage;
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  newChatBtn.addEventListener("click", () => {
  currentConversation = { messages: [] };
  currentConversationId = null;
  chatHeader.textContent = "New Conversation";
  messagesList.innerHTML = "";
  selectedModel = dropdownOptions[0].getAttribute("data-value");
  dropdownToggle.querySelector(".selected").textContent = dropdownOptions[0].textContent;

  selectedModel = "gpt-3.5-turbo";
  dropdownToggle.querySelector(".selected").textContent = "GPT-3.5 Turbo";
});


  editTitleBtn.addEventListener("click", () => {
    if (currentConversation && currentConversation.title) {
      titleInput.value = currentConversation.title;
    } else {
      titleInput.value = "";
    }
    editTitleModal.classList.add("active");
  });

  cancelEditBtn.addEventListener("click", () => {
    editTitleModal.classList.remove("active");
  });

  saveTitleBtn.addEventListener("click", async () => {
    const newTitle = titleInput.value.trim();
    if (!newTitle) return;
    try {
      const res = await fetch(`/api/conversations/${currentConversationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        currentConversation.title = newTitle;
        chatHeader.textContent = newTitle;
        loadConversations();
        editTitleModal.classList.remove("active");
      } else {
        alert("Failed to update title.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating title.");
    }
  });

  deleteConversationBtn.addEventListener("click", () => {
    if (currentConversationId) {
      openConfirmDeleteModal(currentConversationId);
    }
  });

  function openConfirmDeleteModal(id) {
    confirmDeleteModal.classList.add("active");
    confirmDeleteBtn.onclick = async () => {
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: "DELETE",
          credentials: "include"
        });
        if (res.ok) {
          if (currentConversationId === id) {
            currentConversation = null;
            currentConversationId = null;
            chatHeader.textContent = "New Conversation";
            messagesList.innerHTML = "";
          }
          loadConversations();
          confirmDeleteModal.classList.remove("active");
        } else {
          alert("Failed to delete conversation.");
        }
      } catch (e) {
        console.error(e);
        alert("Error deleting conversation.");
      }
    };
  }

  clearConversationsBtn.addEventListener("click", () => {
    clearConversationsModal.classList.add("active");
  });

  cancelClearBtn.addEventListener("click", () => {
    clearConversationsModal.classList.remove("active");
  });

  confirmClearBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`/api/conversations`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        currentConversation = null;
        currentConversationId = null;
        chatHeader.textContent = "New Conversation";
        messagesList.innerHTML = "";
        loadConversations();
        clearConversationsModal.classList.remove("active");
      } else {
        alert("Failed to clear conversations.");
      }
    } catch (e) {
      console.error(e);
      alert("Error clearing conversations.");
    }
  });

  const dropdown = document.querySelector(".dropdown");
const dropdownToggle = dropdown.querySelector(".dropdown-toggle");
const dropdownOptions = dropdown.querySelectorAll(".dropdown-menu li");
let selectedModel = dropdownOptions[0].getAttribute("data-value");
dropdownToggle.querySelector(".selected").textContent = dropdownOptions[0].textContent;

dropdownToggle.addEventListener("click", function(e) {
  e.stopPropagation();
  dropdown.classList.toggle("open");
});

dropdownOptions.forEach(option => {
  option.addEventListener("click", function(e) {
    e.stopPropagation();
    selectedModel = this.getAttribute("data-value");
    dropdownToggle.querySelector(".selected").textContent = this.textContent;
    dropdown.classList.remove("open");
  });
});

document.addEventListener("click", function(e) {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("open");
  }
});

  
  checkAuth();
});
