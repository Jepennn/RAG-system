from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv


load_dotenv()

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import UploadFile, File

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # 1. Läs innehållet
    content = await file.read()
    print(content)
    text = content.decode("utf-8") # Förutsatt att det är en .txt-fil
    print(text)
    return {"filename": file.filename, "status": "Text extraherad"}

# Definiera vad vi förväntar oss att få från frontenden
class ChatMessage(BaseModel):
    text: str


## Query endpoint
@app.post("/")  # Vi ändrar till POST
async def chat_endpoint(message: ChatMessage):      
    # Här kan du senare lägga in din AI-logik
    user_text = message.text
    
    # Just nu skickar vi bara tillbaka ett svar som bevisar att vi läst texten
    return {"reply": f"RAGis har mottagit ditt meddelande: '{user_text}'"}

