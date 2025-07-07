<template>
  <div class="edit-bond-bg">
    <nav class="navbar">
      <span class="navbar-title">Editar Bono</span>
      <div class="navbar-actions">
        <button class="nav-btn" @click="$router.push('/emisor')">Dashboard</button>
        <button class="nav-btn logout" @click="logout">Cerrar sesión</button>
      </div>
    </nav>
    <div class="center-content">
      <div class="edit-card">
        <h2>✏️ Editar Bono</h2>
        <form @submit.prevent="editarBono">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input id="nombre" v-model="nombre" required placeholder="Ej: Bono Empresa X" />
          </div>
          <div class="form-group">
            <label for="moneda">Moneda</label>
            <select id="moneda" v-model="moneda">
              <option v-for="m in monedas" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="monto">Monto</label>
            <input id="monto" type="number" v-model.number="monto" min="0" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label for="tasa">Tasa (%)</label>
            <input id="tasa" type="number" v-model.number="tasa" min="0" step="0.01" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label for="tipoTasa">Tipo de tasa</label>
            <select id="tipoTasa" v-model="tipoTasa">
              <option v-for="t in tiposTasa" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>
          <div class="form-group" v-if="tipoTasa === 'nominal'">
            <label for="capitalizacion">Capitalización</label>
            <select id="capitalizacion" v-model="capitalizacion">
              <option v-for="c in capitalizaciones" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="plazo">Plazo (años)</label>
            <input id="plazo" type="number" v-model.number="plazo" min="1" placeholder="Ej: 5" />
          </div>
          <div class="form-group">
            <label for="frecuencia">Frecuencia de pago</label>
            <select id="frecuencia" v-model="frecuencia">
              <option v-for="f in frecuencias" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Periodos de gracia</label>
            <div v-for="(gp, idx) in graciasPeriodos" :key="idx" class="gracia-row">
              <select v-model="gp.tipo" class="gracia-dropdown">
                <option v-for="g in gracias" :key="g.value" :value="g.value">{{ g.label }}</option>
              </select>
              <input type="number" v-model.number="gp.cantidad" min="1" class="gracia-input" placeholder="Cantidad" />
              <button type="button" class="icon-btn" @click="eliminarGracia(idx)" v-if="graciasPeriodos.length > 1" title="Eliminar">
                🗑️
              </button>
            </div>
            <button type="button" class="add-gracia-btn" @click="agregarGracia">+ Agregar periodo de gracia</button>
          </div>
          <div v-if="error" class="msg error">{{ error }}</div>
          <div v-if="exito" class="msg success">{{ exito }}</div>
          <button type="submit" class="main-btn">Guardar Cambios</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditBondView',
  data() {
    return {
      id: null,
      nombre: '',
      moneda: 'PEN',
      monto: null,
      tasa: null,
      tipoTasa: 'efectiva',
      capitalizacion: 'anual',
      plazo: null,
      frecuencia: 'anual',
      graciasPeriodos: [{ tipo: 'ninguna', cantidad: 1 }],
      error: '',
      exito: '',
      usuarioId: null, // Nuevo campo
      monedas: [
        { label: 'Soles (PEN)', value: 'PEN' },
        { label: 'Dólares (USD)', value: 'USD' },
        { label: 'Euros (EUR)', value: 'EUR' }
      ],
      tiposTasa: [
        { label: 'Efectiva', value: 'efectiva' },
        { label: 'Nominal', value: 'nominal' }
      ],
      capitalizaciones: [
        { label: 'Mensual', value: 'mensual' },
        { label: 'Trimestral', value: 'trimestral' },
        { label: 'Cuatrimestral', value: 'cuatrimestral' },
        { label: 'Semestral', value: 'semestral' },
        { label: 'Anual', value: 'anual' }
      ],
      frecuencias: [
        { label: 'Mensual', value: 'mensual' },
        { label: 'Trimestral', value: 'trimestral' },
        { label: 'Cuatrimestral', value: 'cuatrimestral' },
        { label: 'Semestral', value: 'semestral' },
        { label: 'Anual', value: 'anual' }
      ],
      gracias: [
        { label: 'Ninguna', value: 'ninguna' },
        { label: 'Parcial', value: 'parcial' },
        { label: 'Total', value: 'total' }
      ]
    }
  },
  async mounted() {
    this.id = this.$route.params.id
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'))
    this.usuarioId = usuarioActual?.id || usuarioActual?.usuario_id
    await this.cargarBono()
  },
  methods: {
    async cargarBono() {
      try {
        const res = await fetch(`http://localhost:3000/bonds/${this.id}`)
        const bono = await res.json()
        // Validar que el bono sea del usuario actual
        if (bono.usuario_id !== this.usuarioId) {
          this.error = 'No tienes permiso para editar este bono.'
          setTimeout(() => this.$router.push('/emisor'), 1500)
          return
        }
        this.nombre = bono.nombre
        this.moneda = bono.moneda
        this.monto = bono.monto
        this.tasa = bono.tasa
        this.tipoTasa = bono.tipo_tasa
        this.capitalizacion = bono.capitalizacion || 'anual'
        this.plazo = bono.plazo
        this.frecuencia = bono.frecuencia
        this.graciasPeriodos = bono.gracias_periodos && bono.gracias_periodos.length
            ? bono.gracias_periodos.map(gp => ({ tipo: gp.tipo, cantidad: gp.cantidad }))
            : [{ tipo: 'ninguna', cantidad: 1 }]
      } catch (e) {
        this.error = 'No se pudo cargar el bono.'
      }
    },
    agregarGracia() {
      this.graciasPeriodos.push({ tipo: 'ninguna', cantidad: 1 })
    },
    eliminarGracia(idx) {
      this.graciasPeriodos.splice(idx, 1)
    },
    async editarBono() {
      this.error = ''
      this.exito = ''
      if (!this.nombre || !this.monto || !this.tasa || !this.plazo) {
        this.error = 'Completa todos los campos obligatorios.'
        return
      }
      for (const gp of this.graciasPeriodos) {
        if (gp.tipo === 'ninguna') continue
        if (!gp.cantidad || gp.cantidad < 1) {
          this.error = 'Indica la cantidad de periodos para cada tipo de gracia.'
          return
        }
      }
      const bonoEditado = {
        nombre: this.nombre,
        moneda: this.moneda,
        usuario_id: this.usuarioId, // Asegura que se envía el usuario_id
        monto: Number(this.monto),
        tasa: Number(this.tasa),
        tipo_tasa: this.tipoTasa,
        capitalizacion: this.tipoTasa === 'nominal' ? this.capitalizacion : null,
        plazo: Number(this.plazo),
        frecuencia: this.frecuencia,
        amortizacion: 'francesa',
        gracias_periodos: this.graciasPeriodos.filter(gp => gp.tipo !== 'ninguna')
      }
      try {
        await fetch(`http://localhost:3000/bonds/${this.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bonoEditado)
        })
        this.exito = '✅ Bono editado exitosamente.'
        setTimeout(() => this.$router.push('/emisor'), 1000)
      } catch (e) {
        this.error = '❌ Error al editar el bono.'
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
.edit-bond-bg {
  min-height: 100vh;
  background: linear-gradient(120deg, #e3f2fd 0%, #bbdefb 100%);
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
.nav-btn {
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
.nav-btn:hover {
  background: #1976d2;
  color: #fff;
}
.logout {
  color: #d32f2f;
}
.logout:hover {
  background: #d32f2f;
  color: #fff;
}
.center-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 80vh;
  padding-top: 2.5rem;
}
.edit-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(21, 101, 192, 0.13);
  padding: 2.5rem 2.2rem 2rem 2.2rem;
  width: 100%;
  max-width: 480px;
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.edit-card h2 {
  text-align: center;
  color: #1565c0;
  margin-bottom: 1.2rem;
  font-size: 2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 0.7rem;
}
.form-group label {
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 0.1rem;
}
.form-group input,
.form-group select {
  border: 1.5px solid #90caf9;
  border-radius: 7px;
  padding: 0.5rem 0.8rem;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
  background: #f7faff;
}
.form-group input:focus,
.form-group select:focus {
  border: 1.5px solid #1976d2;
  background: #e3f2fd;
}
.gracia-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.5rem;
}
.gracia-dropdown, .gracia-input {
  min-width: 120px;
}
.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #d32f2f;
  padding: 0 0.3rem;
  transition: color 0.2s;
}
.icon-btn:hover {
  color: #b71c1c;
}
.add-gracia-btn {
  background: #e3f2fd;
  color: #1976d2;
  border: none;
  border-radius: 7px;
  padding: 0.4rem 1rem;
  font-weight: 600;
  margin-top: 0.3rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.add-gracia-btn:hover {
  background: #1976d2;
  color: #fff;
}
.main-btn {
  width: 100%;
  background: linear-gradient(90deg, #388e3c 0%, #43a047 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px 0 rgba(56, 142, 60, 0.08);
}
.main-btn:hover {
  background: #2e7d32;
}
.msg {
  margin: 0.7rem 0 0.2rem 0;
  padding: 0.6rem 1rem;
  border-radius: 7px;
  font-weight: 600;
  text-align: center;
  font-size: 1rem;
}
.error {
  background: #ffebee;
  color: #d32f2f;
  border: 1.5px solid #d32f2f;
}
.success {
  background: #e8f5e9;
  color: #388e3c;
  border: 1.5px solid #388e3c;
}
@media (max-width: 600px) {
  .edit-card {
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
    max-width: 98vw;
  }
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
}
</style>