import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
from pinecone import Pinecone
import pdfplumber
import io
from fastapi import UploadFile, File
from langchain_text_splitters import RecursiveCharacterTextSplitter


load_dotenv()
gemini_client = genai.Client()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://rag-system-sandy.vercel.app", "https://id1214.jesperhesselgren.dev", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
            You are a helpful and professional assistant. Use the provided context below to answer the user's question.

            Guidelines:
            1. **Context-Based Answers:** Base your answers strictly on the provided context. If the information is not available in the context, politely inform the user that you do not have enough information to answer.
            2. **Citations:** You must cite your sources. Every time you provide information from the context, include the source name in parentheses, for example: (Source Name).
            3. **Tone:** Maintain a friendly and helpful tone. Respond warmly to greetings and general pleasantries.
            4. **Accuracy:** Do not use outside knowledge or make up information that is not present in the text.

            Context: {context}

            Question: {query.text}
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


if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
