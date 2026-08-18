# Banco de dados TriQuest

O esquema foi aplicado no projeto `qlyzuvasybmanktbuipm` por migrations gerenciadas pelo Supabase.

Tabelas:

- `profiles`: nome público associado ao usuário do Supabase Auth.
- `questions`: banco público somente para leitura, com 10 questões ativas.
- `attempts`: tentativas que cada usuário só pode inserir e consultar para si.
- `user_progress`: pontuação e sequência que cada usuário só pode consultar e atualizar para si.

Todas as tabelas usam Row Level Security. O cadastro cria automaticamente o perfil e o progresso inicial por meio do gatilho `on_auth_user_created`.
