<template>
    <div>
      <h2>Iniciar sesión</h2>
      <form @submit.prevent="login">
        <input v-model="usuario" placeholder="Usuario" required />
        <input v-model="contrasena" type="password" placeholder="Contraseña" required />
        <button type="submit">Ingresar</button>
      </form>
      <router-link to="/register">¿No tienes cuenta? Regístrate</router-link>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        usuario: '',
        contrasena: ''
      }
    },
    methods: {
      login() {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || []
        const user = usuarios.find(u => u.usuario === this.usuario && u.contrasena === this.contrasena)
  
        if (user) {
          alert(`Bienvenido, ${user.usuario}`)
          if (user.tipo === 'prestamista') {
            this.$router.push('/prestamista')
          } else {
            this.$router.push('/prestatario')
          }
        } else {
          alert('Usuario o contraseña incorrecta')
        }
      }
    }
  }
  </script>
  