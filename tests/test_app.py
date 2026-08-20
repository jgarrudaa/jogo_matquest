from app import app


RESULT_TYPES = ("acerto", "erro", "vencedor", "perdedor", "sem-vidas")
ASSETS = (
    "logo.svg",
    "mascote_apontando.svg",
    "mascote_feliz.svg",
    "mascote_triste.svg",
    "desafio_diario.svg",
)


def test_health_endpoint():
    client = app.test_client()
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json() == {"app": "TriQuest", "status": "ok"}


def test_main_pages_render():
    client = app.test_client()
    for path in ("/", "/entrar", "/cadastro", "/inicio", "/jogar", "/regras"):
        response = client.get(path)
        assert response.status_code == 200
        assert b"TriQuest" in response.data


def test_unknown_result_is_404():
    response = app.test_client().get("/resultado/inexistente")
    assert response.status_code == 404
    assert "Essa trilha não existe" in response.get_data(as_text=True)


def test_all_result_pages_render():
    client = app.test_client()
    for result_type in RESULT_TYPES:
        response = client.get(f"/resultado/{result_type}")
        assert response.status_code == 200
        assert f'data-result="{result_type}"' in response.get_data(as_text=True)


def test_all_game_images_are_available():
    client = app.test_client()
    for filename in ASSETS:
        response = client.get(f"/assets/{filename}")
        assert response.status_code == 200
        assert response.content_type.startswith("image/svg+xml")
        assert len(response.data) > 100


def test_quiz_has_hidden_oracle_and_no_question_image():
    page = app.test_client().get("/jogar").get_data(as_text=True)
    assert 'id="hint-box" hidden' in page
    assert 'id="question-visual"' not in page
    assert 'class="quiz-map__track"' in page
    assert 'class="quiz-map__back"' in page
    assert "Desafio 1 de 10" not in page  # Filled by the round engine at runtime.
