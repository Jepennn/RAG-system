from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Tillåt din frontend att prata med din backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Adressen till din Next.js-app
    allow_credentials=True,
    allow_methods=["*"], # Tillåt alla metoder (GET, POST etc.)
    allow_headers=["*"],
)

@app.get("/")
async def chat():
    return {"reply": "Hello world"}