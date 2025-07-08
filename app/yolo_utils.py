from ultralytics import YOLO
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# Ruta del modelo
model_path = "./model/yolo11n.pt"

# Verificar existencia del modelo
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Modelo no encontrado en: {model_path}")

# Cargar el modelo YOLO
model = YOLO(model_path)
print(f"✅ Modelo cargado desde: {model_path}")

def clasificar_residuo(etiqueta: str) -> str:
    verdes = ['bottle', 'cup', 'can', 'glass', 'paper', 'cardboard']
    marrones = ['banana', 'apple', 'hot dog', 'orange', 'food']
    rojos = ['knife', 'scissors', 'battery', 'lighter', 'paint can']
    negros = ['pizza', 'sandwich', 'donut', 'cake', 'styrofoam']

    if etiqueta in verdes:
        return "verde"
    if etiqueta in marrones:
        return "marrón"
    if etiqueta in rojos:
        return "rojo"
    if etiqueta in negros:
        return "negro"
    return "no_clasificado"

# Detectar residuos en una imagen
def detectar_residuos(imagen_path: str):
    resultados = model(imagen_path)[0]
    objetos = []

    if resultados.boxes is None:
        return []

    for box in resultados.boxes:
        clase_id = int(box.cls[0])
        etiqueta = model.names[clase_id]
        residuo = clasificar_residuo(etiqueta)
        bbox = [round(coord, 2) for coord in box.xyxy[0].tolist()]
        confianza = round(float(box.conf[0]), 3)

        objetos.append({
            "etiqueta": etiqueta,
            "residuo": residuo,
            "confianza": confianza,
            "bbox": bbox
        })

    return objetos