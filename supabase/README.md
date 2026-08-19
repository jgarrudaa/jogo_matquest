# Banco de dados TriQuest

O esquema foi aplicado no projeto `qlyzuvasybmanktbuipm` por migrations gerenciadas pelo Supabase.

Tabelas:

- `profiles`: nome público associado ao usuário do Supabase Auth.
- `questions`: banco público somente para leitura, com 60 questões ativas e dicas individuais.
- `attempts`: tentativas que cada usuário só pode inserir e consultar para si.
- `user_progress`: pontuação e sequência que cada usuário só pode consultar e atualizar para si.

Todas as tabelas usam Row Level Security. O cadastro cria automaticamente o perfil e o progresso inicial por meio do gatilho `on_auth_user_created`.

O jogo não utiliza fases ou mundos. As perguntas são divididas em `seno`, `cosseno`, `tangente` e `razoes`, com 15 questões ativas em cada tema. O gatilho `attempts_update_progress` atualiza pontuação, acertos e sequência após cada tentativa salva.
