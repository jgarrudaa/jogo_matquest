document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#auth-form');
  if (!form) return;
  const message = document.querySelector('#form-message');
  const submit = form.querySelector('button[type="submit"]');
  const loader = submit.querySelector('.button-loader');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); message.textContent = '';
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const client = window.triquestSupabase;
    if (!client) { message.textContent = 'Não foi possível conectar ao serviço de cadastro.'; return; }
    submit.disabled = true; loader.hidden = false;
    const email = form.email.value.trim(); const password = form.password.value;
    try {
      if (form.dataset.mode === 'signup') {
        const name = form.name.value.trim();
        const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: `${location.origin}/inicio` } });
        if (error) throw error;
        localStorage.setItem('triquest_name', name);
        if (!data.session) { message.className = 'form-message success'; message.textContent = 'Cadastro criado. Confira seu e-mail para confirmar a conta.'; return; }
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const name = data.user?.user_metadata?.display_name;
        if (name) localStorage.setItem('triquest_name', name);
      }
      location.href = '/inicio';
    } catch (error) {
      const translations = { 'Invalid login credentials': 'E-mail ou senha incorretos.', 'User already registered': 'Este e-mail já possui uma conta.', 'Password should be at least 6 characters.': 'A senha precisa ter pelo menos 6 caracteres.' };
      message.className = 'form-message'; message.textContent = translations[error.message] || 'Não foi possível concluir. Revise os dados e tente novamente.';
    } finally { submit.disabled = false; loader.hidden = true; }
  });
});
