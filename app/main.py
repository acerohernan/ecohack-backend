from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from yolo_utils import detectar_residuos
import shutil
import os

app = FastAPI()

# Habilitar CORS para pruebas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return FileResponse("public/index.html")

@app.post("/clasificar/")
async def clasificar_imagen(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    objetos = detectar_residuos(temp_path)
    os.remove(temp_path)
    return {"resultado": objetos}

app.mount("/", StaticFiles(directory="public", html=True), name="web")

if __name__ == "__main__":
    import uvicorn
    from dotenv import load_dotenv

    load_dotenv()  # Carga las variables desde .env
    import os

    port = int(os.getenv("PORT", 3000))  # Usa 8000 si no se encuentra PORT

    uvicorn.run("main:app", host="0.0.0.0", port=port)