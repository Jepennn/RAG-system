import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
from pinecone import Pinecone
import pdfplumber
import io

from langchain_text_splitters import RecursiveCharacterTextSplitter


load_dotenv()


gemini_client = genai.Client()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://rag-system-sandy.vercel.app","http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import UploadFile, File

text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)

EMBED_MODEL = "multilingual-e5-large"

pc = Pinecone(api_key=os.getenv("PINCONE_API_KEY"))

index = pc.Index("test-text-file")

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    content = await file.read()
    extracted_text = ""


    if file.filename.endswith(".pdf"):

        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
                    
    elif file.filename.endswith(".txt"):


        extracted_text = content.decode("utf-8")




   
   
    chunks = text_splitter.split_text(extracted_text)

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

    return {"name": file.filename, "status": "Success", "chunks": len(chunks)}
    



class ChatMessage(BaseModel):
    text: str
    file_names: list[str]


@app.post("/")
async def chat_endpoint(query: ChatMessage):

    query_embeddings = pc.inference.embed(
        model = EMBED_MODEL,
        inputs=query.text,
        parameters={"input_type": "query"}
    )


    if len(query.file_names) > 0:
        result = index.query(
            vector=query_embeddings[0].values,
            top_k=5,
            include_metadata = True,
            filter={
                "filename": {"$in": query.file_names}
            }
        )
    else:
        result = index.query(
            vector=query_embeddings[0].values,
            top_k=5,
            include_metadata = True
        )

    context = "\n-----------\n".join([f"Källa: {res.metadata['filename']}\nText: {res.metadata['text']}" for res in result.matches])

    prompt = f"""
    Detta är dina instruktioner:
    -Använd den markerade kontexten nedan som bakgrund till dina svar. Om du inte kan svara med hjälp av kontexten, förklara det på ett vänligt sätt.
    -Om användaren säger hej eller andra vardagliga fraser, svara vänligt.
    -Du kan se i kontexten vilken källa den kommer ifrån. Du ska ange i dina svar vart du fick en viss information ifrån, skriv källan inom parenteser.
    -Du ska ange vilken källa du fick informationen ifrån! Ange källan inom parenteser!

    Kontext: {context}

    Fråga: {query.text}
    """
    print(prompt)
    
    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
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


        ids_to_delete = []
        for ids in index.list(prefix=f"{file_name}_"):
            ids_to_delete.extend(ids)


        if not ids_to_delete:
            raise HTTPException(
                status_code=404, 
                detail=f"Hittade inga vektorer för filen '{file_name}'"
            )


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

