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
