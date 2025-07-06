<template>
  <div class="dashboard-bg">
    <nav class="navbar">
      <span class="navbar-title">Dashboard Bonista</span>
      <div class="navbar-actions">
        <Button class="create-bond-btn" @click="$router.push('/bonista')">Dashboard</button>
        <button class="create-bond-btn" @click="$router.push('/createbond')">Crear Bono</button>
        <button class="logout-btn" @click="logout">Cerrar sesión</button>
      </div>
    </nav>
    <div class="dashboard-content">
      <h2>Bienvenido, Bonista</h2>
      <div class="bonos-list">
        <div v-for="bono in bonos" :key="bono.id" class="bono-card">
          <h3>{{ bono.nombre }}</h3>
          <p><b>Moneda:</b> {{ bono.moneda }}</p>
          <p><b>Monto:</b> {{ bono.monto }}</p>
          <p><b>Tasa:</b> {{ bono.tasa }}%</p>
          <p><b>Tipo de tasa:</b> {{ bono.tipo_tasa }}</p>
          <p v-if="bono.capitalizacion"><b>Capitalización:</b> {{ bono.capitalizacion }}</p>
          <p><b>Plazo:</b> {{ bono.plazo }} años</p>
          <p><b>Frecuencia:</b> {{ bono.frecuencia }}</p>
          <p><b>Gracia:</b> {{ bono.gracia }}</p>
          <button class="delete-btn" @click="eliminarBono(bono.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dashboard-prestamista',
  data() {
    return {
      bonos: []
    }
  },
  async mounted() {
    await this.cargarBonos()
  },
  methods: {
    async cargarBonos() {
      try {
        const res = await fetch('http://localhost:3000/bonds')
        this.bonos = await res.json()
      } catch (e) {
        this.bonos = []
      }
    },
    async eliminarBono(id) {
      if (!confirm('¿Seguro que deseas eliminar este bono?')) return
      try {
        await fetch(`http://localhost:3000/bonds/${id}`, { method: 'DELETE' })
        this.bonos = this.bonos.filter(b => b.id !== id)
      } catch (e) {
        alert('Error al eliminar el bono.')
      }
    },
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
.bonos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 2rem;
}
.bono-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(21, 101, 192, 0.08);
  padding: 1.5rem 1.2rem;
  min-width: 260px;
  max-width: 320px;
  margin-bottom: 1rem;
  color: #1565c0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.bono-card h3 {
  margin-bottom: 0.5rem;
  color: #1976d2;
  font-size: 1.2rem;
}
.delete-btn {
  margin-top: 0.7rem;
  background: #d32f2f;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #b71c1c;
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