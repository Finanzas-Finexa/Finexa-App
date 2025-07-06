<template>
  <div class="dashboard-bg">
    <nav class="navbar">
      <span class="navbar-title">Dashboard Bonista</span>
      <div class="navbar-actions">
        <button class="create-bond-btn" @click="$router.push('/createbond')">Crear Bono</button>
        <button class="logout-btn" @click="logout">Cerrar sesión</button>
      </div>
    </nav>
    <div class="dashboard-content">
      <h2>Bienvenido, Bonista</h2>
      <p>Aquí irá la calculadora de bono francés para bonista.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dashboard-prestamista',
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
.navbar-actions {
  display: flex;
  gap: 1rem;
}
.create-bond-btn {
  background: #fff;
  color: #388e3c;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  box-shadow: 0 2px 8px 0 rgba(56, 142, 60, 0.08);
}
.create-bond-btn:hover {
  background: #388e3c;
  color: #fff;
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
  .navbar-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  .create-bond-btn,
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