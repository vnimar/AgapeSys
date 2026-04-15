from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from pathlib import Path
from fastapi.templating import Jinja2Templates
from resources.routers import missao_router, users_router, frequencia_router

app = FastAPI(
    title="AgapeSys Api",
    description="API backend do sistema AgapeSys",
    version="1.0.0"
)

BASE_DIR = Path(__file__).resolve().parent

templates = Jinja2Templates(
    directory=BASE_DIR / "resources" / "templates"
)

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def home(request: Request):
    return templates.TemplateResponse(
        "home.html",
        {"request": request}
    )

app.include_router(users_router.router)
app.include_router(missao_router.router)
app.include_router(frequencia_router.router)
