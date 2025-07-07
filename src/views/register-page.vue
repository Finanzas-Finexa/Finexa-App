<template>
  <div class="register-bg">
    <div class="register-card">
      <h2>Registro</h2>
      <form @submit.prevent="registrar">
        <div class="form-group">
          <label>Usuario:</label>
          <input v-model="usuario" placeholder="Usuario" required class="input" />
        </div>
        <div class="form-group">
          <label>Contraseña:</label>
          <input v-model="contrasena" type="password" placeholder="Contraseña" required class="input" />
        </div>
        <div class="form-group">
          <label>Email:</label>
          <input v-model="email" type="email" placeholder="Correo electrónico" required class="input" />
        </div>
        <div class="form-group">
          <label>Tipo de cuenta:</label>
          <select v-model="tipo" required class="input">
            <option disabled value="">Selecciona tipo de usuario</option>
            <option value="Emisor">Emisor</option>
            <option value="Inversor">Inversor</option>
          </select>
        </div>
        <button type="submit" class="register-btn">Registrar</button>
      </form>
      <router-link to="/login" class="login-link">¿Ya tienes cuenta? Inicia sesión</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      usuario: '',
      contrasena: '',
      tipo: '',
      email: ''
    }
  },
  methods: {
    async registrar() {
      if (!this.tipo) {
        alert('Por favor, selecciona un tipo de usuario.')
        return
      }
      if (!this.email) {
        alert('Por favor, ingresa un correo electrónico.')
        return
      }
      // Mapea el tipo a rol booleano
      const rol = this.tipo === 'Emisor'
      const nuevoUsuario = {
        username: this.usuario,
        password_hash: this.contrasena,
        email: this.email,
        rol,
        created_at: new Date().toISOString()
      }
      try {
        await fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoUsuario)
        })
        alert('Registro exitoso')
        this.$router.push('/login')
      } catch (e) {
        alert('Error al registrar usuario')
      }
    }
  }
}
</script>

<style scoped>
.register-bg {
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
.register-card {
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
.form-group {
  width: 100%;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
label {
  color: #1976d2;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.input {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 1px solid #b3c6e6;
  border-radius: 8px;
  font-size: 1.1rem;
  box-sizing: border-box;
  margin-bottom: 0;
  outline: none;
  transition: border 0.2s;
}
.input:focus {
  border: 1.5px solid #1976d2;
}
.register-btn {
  width: 100%;
  background: #1976d2;
  border: none;
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 0.9rem 0;
  border-radius: 8px;
  transition: background 0.2s;
  margin-top: 0.5rem;
}
.register-btn:hover {
  background: #0d47a1;
}
.login-link {
  margin-top: 2rem;
  color: #1976d2;
  text-decoration: none;
  transition: color 0.2s;
  font-size: 1rem;
}
.login-link:hover {
  color: #0d47a1;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 500px) {
  .register-card {
    padding: 2rem 1rem;
    max-width: 95vw;
    min-width: unset;
  }
  h2 {
    font-size: 1.3rem;
  }
}
</style>