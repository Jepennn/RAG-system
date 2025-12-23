from fastapi import FastAPI

app = FastAPI()

## Test route
@app.post("/")
async def read_root():
    return {"message": "Hello World"}


## Files endpoints
# @app.get("/files")
# async def get_files():
#     return {"files": "This is your files"}









