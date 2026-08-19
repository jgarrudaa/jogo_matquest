# TriQuest

Jogo educacional responsivo sobre razões trigonométricas, construído com Flask, JavaScript e Supabase.

## Regras principais

- Rodadas aleatórias de 10 desafios, gerais ou filtradas por tema.
- Três vidas; uma resposta incorreta não remove pontos, mostra a resolução e repete o desafio.
- Acerto sem dica: 100 pontos. Acerto com dica: 50 pontos.
- Vitória a partir de 700 pontos; uma nova rodada sorteia outra combinação.
- As barras da página inicial mostram perguntas distintas já dominadas em cada tema.

## Executar localmente

1. Crie um ambiente virtual: `python -m venv .venv`
2. Ative-o no PowerShell: `.venv\Scripts\Activate.ps1`
3. Instale as dependências: `pip install -r requirements.txt`
4. Copie `.env.example` para `.env` e confira as variáveis públicas do Supabase.
5. Execute: `python app.py`
6. Abra `http://127.0.0.1:5000`.

## Estrutura

- `app.py`: rotas Flask e configuração pública.
- `templates/`: páginas e componentes HTML.
- `static/css/`: sistema visual responsivo.
- `static/js/`: autenticação, estado, motor testável de rodadas e lógica do jogo.
- `imagens_triquest/`: identidade e ilustrações originais.
- `tests/`: testes das rotas Flask.
- `supabase/`: documentação do esquema remoto.

## Supabase

O projeto usa Supabase Auth com e-mail e senha. As tabelas `profiles`, `questions`, `attempts` e `user_progress` possuem RLS. A chave publicável pode aparecer no navegador; nunca adicione uma chave secreta ou `service_role` ao frontend.

O banco remoto recebeu as migrations `create_triquest_schema_and_seed_questions` e `add_attempts_question_index`.
