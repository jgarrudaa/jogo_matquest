"""TriQuest Flask application."""

import os
import secrets
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY") or secrets.token_hex(32)


@app.context_processor
def inject_public_config():
    return {
        "supabase_url": os.getenv("SUPABASE_URL", "https://qlyzuvasybmanktbuipm.supabase.co"),
        "supabase_key": os.getenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_eEEhFCMhXqzzT6KVbtjEEg_dhbEqDOr"),
    }


@app.get("/")
def index():
    return render_template("landing.html", page="landing")


@app.get("/entrar")
def login():
    return render_template("auth.html", page="login", mode="login")


@app.get("/cadastro")
def signup():
    return render_template("auth.html", page="signup", mode="signup")


@app.get("/inicio")
def home():
    return render_template("home.html", page="home")


@app.get("/jogar")
def quiz():
    return render_template("quiz.html", page="quiz")


@app.get("/regras")
def rules():
    return render_template("rules.html", page="rules")


@app.get("/resultado/<result_type>")
def result(result_type):
    allowed = {"acerto", "erro", "vencedor", "perdedor", "sem-vidas"}
    if result_type not in allowed:
        return render_template("404.html", page="404"), 404
    return render_template("result.html", page="result", result_type=result_type)


@app.get("/assets/<path:filename>")
def asset(filename):
    return send_from_directory(BASE_DIR / "imagens_triquest", filename)


@app.get("/api/health")
def health():
    return jsonify(status="ok", app="TriQuest")


@app.errorhandler(404)
def not_found(_error):
    return render_template("404.html", page="404"), 404


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
