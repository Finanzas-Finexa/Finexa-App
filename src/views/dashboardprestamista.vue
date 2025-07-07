<template>
  <div class="dashboard-bg">
    <nav class="navbar">
      <span class="navbar-title">Dashboard Emisor</span>
      <div class="navbar-actions">
        <button class="create-bond-btn" @click="$router.push('/emisor')">Dashboard</button>
        <button class="create-bond-btn" @click="$router.push('/createbond')">Crear Bono</button>
        <button class="logout-btn" @click="logout">Cerrar sesión</button>
      </div>
    </nav>
    <div class="dashboard-content">
      <h2>Bienvenido, Emisor</h2>
      <div class="table-container">
        <table class="bonos-table">
          <thead>
          <tr>
            <th>Nombre</th>
            <th>Moneda</th>
            <th>Monto</th>
            <th>Tasa (%)</th>
            <th>Tipo de tasa</th>
            <th>Capitalización</th>
            <th>Plazo (años)</th>
            <th>Frecuencia</th>
            <th>Periodos de gracia</th>
            <th>Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="bono in bonos" :key="bono.id">
            <td>{{ bono.nombre }}</td>
            <td>{{ bono.moneda }}</td>
            <td>{{ bono.monto }}</td>
            <td>{{ bono.tasa }}</td>
            <td>{{ bono.tipo_tasa }}</td>
            <td>{{ bono.capitalizacion || '-' }}</td>
            <td>{{ bono.plazo }}</td>
            <td>{{ bono.frecuencia }}</td>
            <td>{{ formatGraciasPeriodos(bono.gracias_periodos) }}</td>
            <td class="acciones-cell">
              <div class="acciones-btns">
                <button class="calculate-btn" @click="$router.push(`/resultemisor/${bono.id}`)">Calcular</button>
                <button class="edit-btn" @click="$router.push(`/editbond/${bono.id}`)">Editar</button>
                <button class="delete-btn" @click="eliminarBono(bono.id)">Eliminar</button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
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
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'))
        const usuarioId = usuarioActual?.id || usuarioActual?.usuario_id
        const res = await fetch('http://localhost:3000/bonds')
        const todos = await res.json()
        this.bonos = todos.filter(b => b.usuario_id === usuarioId)
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
    formatGraciasPeriodos(gracias_periodos) {
      if (!gracias_periodos || !gracias_periodos.length) return '-'
      return gracias_periodos
          .map(gp => `${gp.tipo.charAt(0).toUpperCase() + gp.tipo.slice(1)} (${gp.cantidad})`)
          .join(', ')
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
.table-container {
  width: 100%;
  max-width: 1100px;
  margin: 2rem auto 0 auto;
  overflow-x: auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(21, 101, 192, 0.10);
  padding: 1.5rem;
}
.bonos-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.05rem;
  color: #1565c0;
}
.bonos-table th,
.bonos-table td {
  padding: 0.8rem 0.7rem;
  text-align: center;
}
.bonos-table th {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 700;
  border-bottom: 2px solid #90caf9;
}
.bonos-table td {
  border-bottom: 1px solid #e3f2fd;
}
.bonos-table tr:hover {
  background: #f1f8ff;
}
.acciones-cell {
  display: flex;
  justify-content: center;
}
.acciones-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.calculate-btn {
  background: #0288d1;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.calculate-btn:hover {
  background: #0277bd;
}
.delete-btn {
  background: #d32f2f;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
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
.edit-btn {
  background: #fbc02d;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #f9a825;
}
@media (max-width: 900px) {
  .table-container {
    padding: 0.5rem;
  }
  .bonos-table th,
  .bonos-table td {
    padding: 0.5rem 0.3rem;
    font-size: 0.95rem;
  }
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
