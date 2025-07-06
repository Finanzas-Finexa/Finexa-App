<template>
  <div class="dashboard-bg">
    <nav class="navbar">
      <span class="navbar-title">Dashboard Inversor</span>
      <button class="logout-btn" @click="logout">Cerrar sesión</button>
    </nav>
    <div class="dashboard-content">
      <h2>Bienvenido, Inversor</h2>
      <p>Aquí irá la calculadora de bono francés para inversor.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dashboard-prestatario',
  methods: {
    logout() {
      localStorage.removeItem('usuarioActual')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.dashboard-bg {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7faff;
}
.navbar {
  background: linear-gradient(90deg, #1565c0 0%, #42a5f5 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  box-shadow: 0 2px 8px 0 rgba(21, 101, 192, 0.08);
}
.navbar-title {
  font-size: 1.4rem;
  font-weight: bold;
  letter-spacing: 1px;
}
.logout-btn {
  background: #fff;
  color: #1565c0;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 2px 8px 0 rgba(21, 101, 192, 0.08);
}
.logout-btn:hover {
  background: #1976d2;
  color: #fff;
}
.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1565c0;
  padding: 2.5rem 1.5rem;
}
.dashboard-content h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}
.dashboard-content p {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 700px) {
  .navbar {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    gap: 0.5rem;
  }
  .navbar-title {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  .logout-btn {
    width: 100%;
    font-size: 1rem;
    padding: 0.7rem 0;
  }
  .dashboard-content h2 {
    font-size: 1.3rem;
  }
  .dashboard-content p {
    font-size: 1rem;
  }
}
</style>