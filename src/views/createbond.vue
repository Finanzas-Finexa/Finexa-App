<template>
  <div class="crear-bono-bg">
    <nav class="navbar">
      <span class="navbar-title">Dashboard Bonista</span>
      <div class="navbar-actions">
        <Button label="Dashboard" class="p-button-success create-bond-btn" @click="$router.push('/bonista')" />
        <Button label="Crear Bono" class="p-button-success create-bond-btn" @click="$router.push('/createbond')" />
        <Button label="Cerrar sesión" class="p-button-secondary logout-btn" @click="logout" />
      </div>
    </nav>

    <div class="crear-bono-content">
      <div class="form-card p-fluid">
        <h2>🧾 Nuevo Bono Corporativo</h2>
        <form @submit.prevent="crearBono">
          <div class="p-field">
            <label for="nombre">Nombre</label>
            <InputText id="nombre" v-model="nombre" required placeholder="Ej: Bono Empresa X" />
          </div>
          <div class="p-field">
            <label for="moneda">Moneda</label>
            <Dropdown id="moneda" v-model="moneda" :options="monedas" optionLabel="label" optionValue="value" />
          </div>
          <div class="p-field">
            <label for="monto">Monto</label>
            <InputNumber id="monto" v-model="monto" mode="decimal" :min="0" :useGrouping="false" placeholder="0.00" />
          </div>
          <div class="p-field">
            <label for="tasa">Tasa (%)</label>
            <InputNumber id="tasa" v-model="tasa" mode="decimal" :min="0" :maxFractionDigits="2" placeholder="0.00" />
          </div>
          <div class="p-field">
            <label for="tipoTasa">Tipo de tasa</label>
            <Dropdown id="tipoTasa" v-model="tipoTasa" :options="tiposTasa" optionLabel="label" optionValue="value" />
          </div>
          <div class="p-field" v-if="tipoTasa === 'nominal'">
            <label for="capitalizacion">Capitalización</label>
            <Dropdown id="capitalizacion" v-model="capitalizacion" :options="capitalizaciones" optionLabel="label" optionValue="value" />
          </div>
          <div class="p-field">
            <label for="plazo">Plazo (años)</label>
            <InputNumber id="plazo" v-model="plazo" :min="1" placeholder="Ej: 5" />
          </div>
          <div class="p-field">
            <label for="frecuencia">Frecuencia de pago</label>
            <Dropdown id="frecuencia" v-model="frecuencia" :options="frecuencias" optionLabel="label" optionValue="value" />
          </div>
          <div class="p-field">
            <label for="gracia">Periodos de gracia</label>
            <Dropdown id="gracia" v-model="gracia" :options="gracias" optionLabel="label" optionValue="value" />
          </div>
          <div class="p-field" v-if="gracia !== 'ninguna'">
            <label for="graciaPeriodos">Cantidad de periodos de gracia</label>
            <InputNumber id="graciaPeriodos" v-model="graciaPeriodos" :min="1" placeholder="Ej: 2" />
          </div>
          <div class="p-field">
            <label>Periodos de gracia</label>
            <div v-for="(gp, idx) in graciasPeriodos" :key="idx" class="gracia-row">
              <Dropdown v-model="gp.tipo" :options="gracias" optionLabel="label" optionValue="value" class="gracia-dropdown" />
              <InputNumber v-model="gp.cantidad" :min="1" placeholder="Cantidad" class="gracia-input" />
              <Button icon="pi pi-trash" class="p-button-danger p-button-sm" @click="eliminarGracia(idx)" v-if="graciasPeriodos.length > 1" />
            </div>
            <Button label="Agregar periodo de gracia" class="p-button-text p-button-sm mt-2" @click="agregarGracia" />
          </div>
          <div v-if="error" class="p-error mt-2">{{ error }}</div>
          <div v-if="exito" class="p-success mt-2">{{ exito }}</div>
          <Button type="submit" label="Crear Bono" class="p-button-primary w-full mt-3" />
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

export default {
  name: 'CreateBondView',
  components: { InputText, InputNumber, Dropdown, Button },
  data() {
    return {
      nombre: '',
      moneda: 'PEN',
      monto: null,
      tasa: null,
      tipoTasa: 'efectiva',
      capitalizacion: 'anual',
      plazo: null,
      frecuencia: 'anual',
      gracia: 'ninguna',
      error: '',
      exito: '',
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
      graciasPeriodos: [
        { tipo: 'ninguna', cantidad: 1 }
      ],
      gracias: [
        { label: 'Ninguna', value: 'ninguna' },
        { label: 'Parcial', value: 'parcial' },
        { label: 'Total', value: 'total' }
      ]
    }
  },
  methods: {
    agregarGracia() {
      this.graciasPeriodos.push({ tipo: 'ninguna', cantidad: 1 })
    },
    eliminarGracia(idx) {
      this.graciasPeriodos.splice(idx, 1)
    },
    async crearBono() {
      this.error = ''
      this.exito = ''
      if (!this.nombre || !this.monto || !this.tasa || !this.plazo) {
        this.error = 'Completa todos los campos obligatorios.'
        return
      }
      if (this.gracia !== 'ninguna' && (!this.graciaPeriodos || this.graciaPeriodos < 1)) {
        this.error = 'Indica la cantidad de periodos de gracia.'
        return
      }
      for (const gp of this.graciasPeriodos) {
        if (gp.tipo === 'ninguna') continue
        if (!gp.cantidad || gp.cantidad < 1) {
          this.error = 'Indica la cantidad de periodos para cada tipo de gracia.'
          return
        }
      }
      const nuevoBono = {
        nombre: this.nombre,
        moneda: this.moneda,
        monto: Number(this.monto),
        tasa: Number(this.tasa),
        tipo_tasa: this.tipoTasa,
        capitalizacion: this.tipoTasa === 'nominal' ? this.capitalizacion : null,
        plazo: Number(this.plazo),
        frecuencia: this.frecuencia,
        amortizacion: 'francesa',
        gracia: this.gracia,
        gracia_periodos: this.gracia !== 'ninguna' ? Number(this.graciaPeriodos) : 0,
        gracias_periodos: this.graciasPeriodos.filter(gp => gp.tipo !== 'ninguna'),
        created_at: new Date().toISOString()
      }
      try {
        await fetch('http://localhost:3000/bonds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoBono)
        })
        this.exito = '✅ Bono creado exitosamente.'
        setTimeout(() => this.$router.push('/bonista'), 1000)
      } catch (e) {
        this.error = '❌ Error al crear el bono.'
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
.crear-bono-bg {
  min-height: 100vh;
  background: #eaf4fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.navbar {
  background: linear-gradient(90deg, #1565c0 0%, #42a5f5 100%);
  color: #fff;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.navbar-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.navbar-actions {
  display: flex;
  gap: 1rem;
}

.create-bond-btn,
.logout-btn {
  border-radius: 10px;
  font-weight: 600;
}

.crear-bono-content {
  margin-top: 6rem;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.form-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  transition: all 0.3s ease-in-out;
}

h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
  color: #1565c0;
}

.p-field label {
  font-weight: 600;
  color: #1565c0;
  margin-bottom: 0.5rem;
  display: block;
}

.p-error {
  color: #d32f2f;
  font-weight: 500;
}

.p-success {
  color: #388e3c;
  font-weight: 500;
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
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .navbar-actions {
    width: 100%;
    justify-content: space-between;
  }
  .form-card {
    padding: 1.5rem;
  }
}
</style>