# RAG System

This is a Retrieval-Augmented Generation (RAG) system that uses Gemini and Pinecone to answer questions based on your own documents.

---

## 🌐 Try the project live

👉 [https://rag-system-sandy.vercel.app/](https://rag-system-sandy.vercel.app/)

---

## 🚀 Getting Started – Step by Step

### ⭐️ Requirements

- Node.js
- Python 3.12.x (with pip)
- Gemini API key
- Pinecone API key

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/rag-system.git
cd rag-system
```

---

### 2. Create .env files

**In the `backend` folder:**  
Add a `.env` file with the following content:

```
GEMINI_API_KEY=your-gemini-api-key
PINCONE_API_KEY=your-pinecone-api-key
```

**In the `frontend` folder:**  
Add a `.env` file with:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 3. Start the project

#### 🖥️ Backend

1. Navigate to the `backend` folder
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate    # macOS/Linux
   .\venv\Scripts\activate     # Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend:
   ```bash
   fastapi dev main.py
   ```
   The backend is now running at [http://localhost:8000](http://localhost:8000)

#### 💻 Frontend

1. Navigate to the `frontend` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
   The frontend is now running at [http://localhost:3000](http://localhost:3000)

---

### 4. Test in the browser

Open [http://localhost:3000](http://localhost:3000) to start using the system!

---

## ⏹️ Stop the project

**Backend:**  
Press `Ctrl + C` in the terminal where the backend is running to stop the server.

**Frontend:**  
Press `Ctrl + C` in the terminal where the frontend is running to shut down the project.

---
