import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
from pinecone import Pinecone

from langchain_text_splitters import RecursiveCharacterTextSplitter


load_dotenv()


gemini_client = genai.Client()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import UploadFile, File
# kan lägga till separators o length_function
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

EMBED_MODEL = "multilingual-e5-large"

pc = Pinecone(api_key=os.getenv("PINCONE_API_KEY"))

index = pc.Index("test-text-file")

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    content = await file.read()
    text = content.decode("utf-8")
    chunks = text_splitter.split_text(text)

    embeddings = pc.inference.embed(
        model = EMBED_MODEL,
        inputs=chunks,
        parameters={"input_type": "passage", "truncate": "END"}
    )

    vectors = []
    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        vectors.append({
            "id": f"{file.filename}_{i}",
            "values": emb.values,
            "metadata": {"text": chunk, "filename": file.filename}
        })

    index.upsert(vectors=vectors)

    return {"status": "Success", "chunks": len(chunks)}
    


class ChatMessage(BaseModel):
    text: str



@app.post("/")
async def chat_endpoint(message: ChatMessage):  

    query_embeddings = pc.inference.embed(
        model = EMBED_MODEL,
        inputs=message.text,
        parameters={"input_type": "query"}
    )

    result = index.query(
        vector=query_embeddings[0].values,
        top_k=5,
        include_metadata = True
    )
    print(result)

    context = "\n-----------\n".join([res.metadata["text"] for res in result.matches])

    prompt = f"""Använd kontexten nedan som bakgrund till ditt svar.
    Om du inte kan komma fram till svaret från kontext-texten nedan, svara att du inte vet.
    Om vardagligt prat kommer in, typ hej osv, hälsa vänligt och påminn om att du kan hjälpa till med filer användaren anger.
    Kontext: {context}

    Fråga: {message.text}
    """

    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    print(response)

    

    return {"reply": response.text}

@app.get("/files")
async def get_files():
    try:
        filenames = set()
    
        for ids in index.list():
            for vector_id in ids:
                filename = vector_id.rsplit("_", 1)[0]
                filenames.add(filename)
        

        return {"files": sorted(list(filenames))}
    except Exception as e:
        print(f"Error listing files: {e}")
        return {"files": [], "error": str(e)}
    
# Deletes all files in the whole index
@app.delete("/files")
async def delete_all_files():
    try:
        index.delete(delete_all=True)
        return {"status": "Success", "message": "All files deleted"}
    except Exception as e:
        print(e)
        return {"status": "Error", "message": "Failed to delete all files"}




from fastapi import HTTPException

@app.delete("/files/{file_name}")
async def delete_file(file_name: str):
    try:
        # 1. Hitta alla ID:n som börjar med filnamnet (t.ex. "shortest.txt_0", "shortest.txt_1")
        # Vi använder index.list med prefix, vilket är väldigt effektivt.
        ids_to_delete = []
        for ids in index.list(prefix=f"{file_name}_"):
            ids_to_delete.extend(ids)

        # 2. Om listan är tom, hittades ingen fil
        if not ids_to_delete:
            raise HTTPException(
                status_code=404, 
                detail=f"Hittade inga vektorer för filen '{file_name}'"
            )

        # 3. Radera vektorerna baserat på deras specifika ID:n
        index.delete(ids=ids_to_delete)
        
        return {
            "status": "Success", 
            "message": f"Raderade {len(ids_to_delete)} bitar av filen '{file_name}'"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Delete error: {e}")
        return {"status": "Error", "message": str(e)}

