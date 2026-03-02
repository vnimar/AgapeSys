from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from resources.routers import missao_router, users_router

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    html_content = """
    <!DOCTYPE html>
    <html>
        <head>
            <title>Cognitive API</title>
            <style>
                body {
                    background-color: #F5F7F6;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    justify_content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background-color: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    text-align: center;
                    max_width: 400px;
                    margin: 0 auto
                }
                h1 {
                    color: #4a4939;
                    margin-bottom: 10px;
                }
                .status {
                    color: #92C7A3;
                    font-weight: bold;
                    font-size: 1.2em;
                    margin-bottom: 30px;
                }
                .btn {
                    background-color: #92C7A3;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: bold;
                    transition: background-color 0.3s;
                }
                .btn:hover {
                    background-color: #76a885;
                }
                p {
                    color: #666;
                    margin-bottom: 30px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div style="font-size: 50px;">🧠</div>
                <h1>AgapeSys API</h1>
                <div class="status">● Sistema Online</div>
                <p>Esta é a API backend que alimenta o aplicativo AgapeSys.</p>
                <a href="/docs" class="btn">Ver Documentação (Swagger)</a>
            </div>
        </body>
    </html>
    """
    return html_content

app.include_router(users_router.router)
app.include_router(missao_router.router)
