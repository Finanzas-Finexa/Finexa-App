<template>
  <div class="login-bg">
    <div class="login-card">
      <h2>Iniciar sesión</h2>
      <form @submit.prevent="login">
        <InputText v-model="email" placeholder="Correo electrónico" class="input" type="email" />        <Password v-model="contrasena" placeholder="Contraseña" class="input" toggleMask />
        <Button label="Ingresar" type="submit" class="login-btn" />
      </form>
      <router-link to="/register" class="register-link">¿No tienes cuenta? Regístrate</router-link>
    </div>
  </div>
</template>

<script>
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

export default {
  components: { InputText, Password, Button },
  data() {
    return {
      email: '',
      contrasena: ''
    }
  },
  methods: {
    async login() {
      try {
        const res = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(this.email)}&password_hash=${encodeURIComponent(this.contrasena)}`)
        const users = await res.json()
        if (users.length > 0) {
          const user = users[0]
          localStorage.setItem('usuarioActual', JSON.stringify({
            id: user.id,
            username: user.username,
            rol: user.rol
          }))
          alert(`Bienvenido, ${user.username}`)
          if (user.rol) {
            this.$router.push('/emisor')
          } else {
            this.$router.push('/inversor')
          }
        } else {
          alert('Correo o contraseña incorrecta')
        }
      } catch (e) {
        alert('Error al iniciar sesión')
      }
    }
  }
}
</script>

<style>
.login-bg {
  position: fixed;
  inset: 0;
  min-height: 100vh;
  min-width: 100vw;
  background: linear-gradient(135deg, #1565c0 0%, #42a5f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}
.login-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(21, 101, 192, 0.2);
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}
h2 {
  color: #1565c0;
  margin-bottom: 2rem;
  font-size: 2rem;
}
.input {
  width: 100%;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}
.login-btn {
  width: 100%;
  background: #1976d2;
  border: none;
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0.9rem 0;
  border-radius: 8px;
  transition: background 0.2s;
}
.login-btn:hover {
  background: #0d47a1;
}
.register-link {
  margin-top: 2rem;
  color: #1976d2;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 1rem;
}
.register-link:hover {
  color: #0d47a1;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 500px) {
  .login-card {
    padding: 2rem 1rem;
    max-width: 95vw;
    min-width: unset;
  }
  h2 {
    font-size: 1.3rem;
  }
}


</style>