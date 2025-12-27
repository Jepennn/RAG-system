from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definiera vad vi förväntar oss att få från frontenden
class ChatMessage(BaseModel):
    text: str

@app.post("/")  # Vi ändrar till POST
async def chat_endpoint(message: ChatMessage):      
    # Här kan du senare lägga in din AI-logik
    user_text = message.text
    
    # Just nu skickar vi bara tillbaka ett svar som bevisar att vi läst texten
    return {"reply": f"RAGis har mottagit ditt meddelande: '{user_text}'"}