# 📚 RAG-based Chatbot with Gemini + Pinecone  

An interactive **Retrieval-Augmented Generation (RAG)** chatbot built with **Node.js**, **Express**, **LangChain**, **Google Gemini API**, and **Pinecone**.  
It allows you to **chat with your documents (PDFs)** through a clean, modern web interface.  

---

## 🚀 Features  

- 📄 **PDF Ingestion & Indexing** – Load a PDF, split into chunks, embed with Gemini, and store in Pinecone  
- 🔍 **RAG-powered QA** – Retrieves relevant chunks and generates answers using Gemini  
- 💬 **Multi-turn Conversations** – Context-aware chat with history memory  
- 🎨 **Modern Frontend** – TailwindCSS-based UI with dark mode  
- 🖥️ **Chat Controls**  
  - **Clear Chat** → clears UI only (bot still remembers)  
  - **New Chat** → resets both UI and backend context  
- ⏳ **Typing Indicator** – Bot shows *“🤖 Bot is typing...”*  
- 💾 **Persistent Chat** – Messages survive page reloads (localStorage)  

---

## 🛠️ Tech Stack  

- **Backend**: Node.js, Express, LangChain, Pinecone, Google Generative AI  
- **Frontend**: HTML, TailwindCSS, Vanilla JS  
- **Database**: Pinecone (Vector DB for embeddings)  
- **Embedding Model**: `text-embedding-004` (Gemini)  
- **LLM**: `gemini-2.0-flash`  

---

## 📂 Project Structure  

```markdown
RAG_ChatBot/
├── public/           # Frontend files
│   ├── script.js     # Chat logic (frontend)
│   ├── style.css     # Custom styling (scrollbar, overrides)
|
│── views/ 
|   ├── index.html    # Chat UI
|
│── index.js          # Index PDF into Pinecone
│── query.js          # Query logic with RAG + Gemini
│── server.js         # Express server (API endpoints)
│── package.json      # Dependencies & scripts
│── .env              # API keys (Gemini, Pinecone)
│
└── node_modules/     # Installed dependencies


## ⚡ Setup Instructions

### Set up Pinecone Index
Go to Pinecone Console
Create a new Index with:
Name: same as PINECONE_INDEX_NAME in .env
Dimension: 768 (for Gemini embeddings text-embedding-004)
Metric: cosine

### Clone the Repository  
cd RAG_ChatBot open terminal there
Install Dependencies
Create a .env file in the project root
and put your API keys for
GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX_NAME

### Index your PDF
Keep your PDF in the root folder with the name doc.pdf
node index.js

### Start the Server
npx nodemon server.js
