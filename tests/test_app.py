from app import app


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


def test_quiz_has_hidden_oracle_and_no_question_image():
    page = app.test_client().get("/jogar").get_data(as_text=True)
    assert 'id="hint-box" hidden' in page
    assert 'id="question-visual"' not in page
    assert 'class="quiz-map__track"' in page
    assert 'class="quiz-map__back"' in page
    assert "Desafio 1 de 10" not in page  # Filled by the round engine at runtime.
