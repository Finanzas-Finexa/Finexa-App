<template>
  <div>
    <h2>Registro</h2>
    <form @submit.prevent="registrar">
      <div>
        <label>Usuario:</label>
        <input v-model="usuario" placeholder="Usuario" required />
      </div>

      <div>
        <label>Contraseña:</label>
        <input v-model="contrasena" type="password" placeholder="Contraseña" required />
      </div>

      <div>
        <label>Tipo de cuenta:</label>
        <select v-model="tipo" required>
          <option disabled value="">Selecciona tipo de usuario</option>
          <option value="prestamista">Prestamista</option>
          <option value="prestatario">Prestatario</option>
        </select>
      </div>

      <button type="submit">Registrar</button>
    </form>

    <router-link to="/login">¿Ya tienes cuenta? Inicia sesión</router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      usuario: '',
      contrasena: '',
      tipo: ''
    }
  },
  methods: {
    registrar() {
      if (!this.tipo) {
        alert('Por favor, selecciona un tipo de usuario (prestamista o prestatario).')
        return
      }

      const nuevoUsuario = {
        usuario: this.usuario,
        contrasena: this.contrasena,
        tipo: this.tipo
      }

      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || []
      usuarios.push(nuevoUsuario)
      localStorage.setItem('usuarios', JSON.stringify(usuarios))

      alert('Registro exitoso')
      this.$router.push('/login')
    }
  }
}
</script>
