from fastapi import FastAPI
app = FastAPI()

@app.get('/')
def check_engine():
    return {"message": "ShieldBox Engine is Online!"}