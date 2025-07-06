<template>
  <div class="calculo-page">
    <div v-if="loading" class="loading-overlay">
      <div class="loader-container">
        <h2>Cargando resultados del bono...</h2>
        <div class="progress-bar-area">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: barraProgreso + '%' }"></div>
          </div>
          <p class="progress-label">{{ barraProgreso.toFixed(0) }}%</p>
        </div>
      </div>
    </div>
    <nav class="navbar" v-else>
      <span class="navbar-title">Dashboard Bonista</span>
      <div class="navbar-actions">
        <button class="create-bond-btn" @click="$router.push('/bonista')">Dashboard</button>
        <button class="create-bond-btn" @click="$router.push('/createbond')">Crear Bono</button>
        <button class="logout-btn" @click="logout">Cerrar sesión</button>
      </div>
    </nav>
    <transition name="fade-scale">
      <div class="calculo-content" v-if="bono && !loading">
        <h1 class="result-title">Resultados</h1>
        <div class="bono-info-cards">
          <div class="info-card" v-for="(block, idx) in infoBlocks" :key="idx">
            <div class="info-card-header">
              <span>{{ block.title }}</span>
            </div>
            <ul>
              <li v-for="item in block.items" :key="item.label">
                <span class="label">{{ item.label }}:</span>
                <span class="value">{{ item.value }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="indicadores-section">
          <div class="indicador-card" v-for="indicador in indicadores" :key="indicador.label">
            <span class="indicador-label">{{ indicador.label }}</span>
            <span class="indicador-value">{{ indicador.value }}</span>
          </div>
        </div>
        <div class="flujo-section">
          <h3>Flujo de Caja</h3>
          <div class="flujo-table-container">
            <table>
              <thead>
              <tr>
                <th>Periodo</th>
                <th>Cuota</th>
                <th>Interés</th>
                <th>Amortización</th>
                <th>Saldo</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="fila in flujo" :key="fila.periodo">
                <td>{{ fila.periodo }}</td>
                <td>{{ fila.cuota.toFixed(2) }}</td>
                <td>{{ fila.interes.toFixed(2) }}</td>
                <td>{{ fila.amortizacion.toFixed(2) }}</td>
                <td>{{ fila.saldo.toFixed(2) }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'CalculoEmisor',
  data() {
    return {
      bono: null,
      flujo: [],
      tcea: 0,
      duracion: 0,
      duracionModificada: 0,
      convexidad: 0,
      precioMaximo: 0,
      frecuenciaMap: {
        mensual: 1,
        bimestral: 2,
        trimestral: 3,
        cuatrimestral: 4,
        semestral: 6,
        anual: 12
      },
      loading: true,
      barraProgreso: 0,
      barraInterval: null
    }
  },
  computed: {
    infoBlocks() {
      if (!this.bono) return [];
      return [
        {
          title: 'Datos del Bono',
          items: [
            { label: 'Nombre', value: this.bono.nombre },
            { label: 'Monto', value: this.bono.monto },
            { label: 'Moneda', value: this.bono.moneda },
            { label: 'Tasa', value: this.bono.tasa + '%' },
            { label: 'Tipo de Tasa', value: this.bono.tipo_tasa }
          ]
        },
        {
          title: 'Condiciones',
          items: [
            { label: 'Plazo', value: this.bono.plazo + ' años' },
            { label: 'Frecuencia', value: this.bono.frecuencia },
            { label: 'Capitalización', value: this.bono.capitalizacion || '-' },
            { label: 'Amortización', value: this.bono.amortizacion },
            { label: 'Gracia', value: this.bono.gracia }
          ]
        }
      ]
    },
    indicadores() {
      return [
        { label: 'TCEA', value: (this.tcea * 100).toFixed(2) + '%' },
        { label: 'Duración', value: this.duracion.toFixed(4) },
        { label: 'Duración Modificada', value: this.duracionModificada.toFixed(4) },
        { label: 'Convexidad', value: this.convexidad.toFixed(4) },
        { label: 'Precio Máximo', value: this.precioMaximo.toFixed(2) }
      ]
    }
  },
  async mounted() {
    this.iniciarCarga();
    const id = this.$route.params.id
    const bonoRes = await fetch(`http://localhost:3000/bonds/${id}`)
    this.bono = await bonoRes.json()
    const configRes = await fetch(`http://localhost:3000/bond_configurations?bond_id=${id}`)
    const configuraciones = await configRes.json()
    const config = configuraciones.length ? configuraciones[0] : null
    let tasaEfectivaAnual = this.bono.tasa / 100
    if (this.bono.tipo_tasa === 'nominal' && config) {
      const capFreq = this.frecuenciaMap[config.capitalization?.toLowerCase()] || 1
      tasaEfectivaAnual = Math.pow(1 + (this.bono.tasa / 100) / capFreq, capFreq) - 1
    }
    this.calcularTodo(tasaEfectivaAnual)
  },
  beforeUnmount() {
    clearInterval(this.barraInterval)
  },
  methods: {
    iniciarCarga() {
      this.barraProgreso = 0
      this.barraInterval = setInterval(() => {
        if (this.barraProgreso < 100) {
          this.barraProgreso += 100 / 30
          if (this.barraProgreso > 100) this.barraProgreso = 100
        }
        if (this.barraProgreso >= 100) {
          this.loading = false
          clearInterval(this.barraInterval)
        }
      }, 100)
    },
    calcularTodo(tasaEfectivaAnual) {
      const { monto, plazo, frecuencia, gracias_periodos } = this.bono
      const frecuenciaMeses = this.frecuenciaMap[frecuencia.toLowerCase()]
      const n_periodos = plazo * (12 / frecuenciaMeses)
      const i_periodo = Math.pow(1 + tasaEfectivaAnual, frecuenciaMeses / 12) - 1
      const cuota = monto * (i_periodo / (1 - Math.pow(1 + i_periodo, -n_periodos)))

      let saldo = monto
      const flujosValores = []
      this.flujo = []

      let totalGracia = 0, parcialGracia = 0
      gracias_periodos?.forEach(p => {
        if (p.tipo === 'total') totalGracia += p.cantidad
        else if (p.tipo === 'parcial') parcialGracia += p.cantidad
      })

      for (let periodo = 1; periodo <= n_periodos; periodo++) {
        let interes = saldo * i_periodo
        let amortizacion = cuota - interes

        if (periodo <= totalGracia) {
          this.flujo.push({ periodo, cuota: 0, interes: 0, amortizacion: 0, saldo })
          flujosValores.push(0)
          continue
        } else if (periodo <= totalGracia + parcialGracia) {
          this.flujo.push({ periodo, cuota: interes, interes, amortizacion: 0, saldo })
          flujosValores.push(interes)
          continue
        }

        saldo -= amortizacion
        this.flujo.push({ periodo, cuota, interes, amortizacion, saldo: Math.max(saldo, 0) })
        flujosValores.push(cuota)
      }

      this.calcularTCEA(flujosValores, i_periodo, n_periodos, frecuenciaMeses)
      this.calcularDuracionYConvexidad(flujosValores, i_periodo, n_periodos, frecuenciaMeses)
      this.precioMaximo = Math.max(...flujosValores)
    },
    calcularTCEA(flujo, i_periodo, n_periodos, frecuenciaMeses) {
      let r = 0.1, vpn = 0, intentos = 0
      do {
        vpn = 0
        for (let i = 1; i <= n_periodos; i++) {
          vpn += flujo[i - 1] / Math.pow(1 + r, i)
        }
        r += vpn > 0 ? 0.001 : -0.001
        intentos++
        if (intentos > 10000) break
      } while (Math.abs(vpn) > 0.01)
      this.tcea = Math.pow(1 + r, frecuenciaMeses / 12) - 1
    },
    calcularDuracionYConvexidad(flujo, tasa, n_periodos, frecuenciaMeses) {
      let dur = 0, conv = 0
      const valor_comercial = flujo.reduce((acum, f, i) => acum + f / Math.pow(1 + tasa, i + 1), 0)

      for (let i = 1; i <= n_periodos; i++) {
        const t = i * frecuenciaMeses / 360
        const flujo_act = flujo[i - 1] / Math.pow(1 + tasa, i)
        dur += t * flujo_act
        conv += t * (t + 1) * flujo_act
      }

      this.duracion = dur / valor_comercial
      this.duracionModificada = this.duracion / (1 + tasa)
      this.convexidad = conv / (valor_comercial * Math.pow(1 + tasa, 2))
    },
    logout() {
      localStorage.removeItem('usuarioActual')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.calculo-page {
  min-height: 100vh;
  background: linear-gradient(120deg, #f7faff 60%, #e3f2fd 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
}
.loading-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: linear-gradient(90deg, #1565c0 0%, #42a5f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.loader-container {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(21, 101, 192, 0.18);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  text-align: center;
  color: #1565c0;
  min-width: 340px;
  animation: loader-pop 0.7s cubic-bezier(.5,1.8,.5,1) alternate;
}
@keyframes loader-pop {
  0% { transform: scale(0.7);}
  60% { transform: scale(1.08);}
  100% { transform: scale(1);}
}
.progress-bar-area {
  margin: 1.5rem auto 0.5rem auto;
  width: 340px;
  user-select: none;
}
.progress-bar-bg {
  width: 100%;
  height: 36px;
  background: #e3f2fd;
  border-radius: 18px;
  border: 2.5px solid #90caf9;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 12px #90caf9;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1565c0 0%, #42a5f5 100%);
  border-radius: 18px 0 0 18px;
  transition: width 0.5s cubic-bezier(.4,2,.6,1);
  z-index: 1;
  position: relative;
  box-shadow: 0 0 16px #42a5f5;
}
.progress-label {
  margin-top: 0.7rem;
  color: #1976d2;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 2px 8px #e3f2fd;
  letter-spacing: 1px;
}
.fade-scale-enter-active {
  animation: fadeScaleIn 0.7s cubic-bezier(.4,2,.6,1);
}
@keyframes fadeScaleIn {
  0% { opacity: 0; transform: scale(0.95);}
  80% { opacity: 1; transform: scale(1.03);}
  100% { opacity: 1; transform: scale(1);}
}
.navbar {
  background: linear-gradient(90deg, #1565c0 0%, #42a5f5 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  box-shadow: 0 2px 12px #90caf9;
  border-radius: 0 0 18px 18px;
  margin-bottom: 1.5rem;
  animation: navbar-fade 0.7s;
}
@keyframes navbar-fade {
  from { opacity: 0; transform: translateY(-30px);}
  to { opacity: 1; transform: translateY(0);}
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
.create-bond-btn,
.logout-btn {
  background: #fff;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.15s;
  box-shadow: 0 2px 8px #e3f2fd;
}
.create-bond-btn {
  color: #388e3c;
}
.create-bond-btn:hover {
  background: #388e3c;
  color: #fff;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 16px #388e3c33;
}
.logout-btn {
  color: #1565c0;
}
.logout-btn:hover {
  background: #1976d2;
  color: #fff;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 16px #1976d233;
}
.calculo-content {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 2.5rem 2vw;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(21, 101, 192, 0.10);
  color: #1565c0;
  border: 1.5px solid #e3f2fd;
  animation: fadeScaleIn 0.7s cubic-bezier(.4,2,.6,1);
}
.result-title {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 2.2rem;
  letter-spacing: 2px;
  color: #0d47a1;
  font-weight: 800;
  text-shadow: 0 2px 12px #e3f2fd;
}
.bono-info-cards {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.info-card {
  background: linear-gradient(120deg, #e3f2fd 80%, #f7faff 100%);
  border-radius: 14px;
  box-shadow: 0 2px 16px #90caf9aa;
  padding: 1.5rem 2rem;
  min-width: 260px;
  flex: 1 1 320px;
  transition: transform 0.18s, box-shadow 0.18s;
  cursor: pointer;
  border: 1.5px solid #90caf9;
  animation: fadeScaleIn 0.7s;
}
.info-card:hover {
  transform: translateY(-6px) scale(1.03) rotate(-1deg);
  box-shadow: 0 8px 32px #42a5f555;
  background: linear-gradient(120deg, #bbdefb 80%, #e3f2fd 100%);
}
.info-card-header {
  font-size: 1.1rem;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 1rem;
  letter-spacing: 1px;
}
.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.info-card li {
  margin-bottom: 0.7rem;
  display: flex;
  justify-content: space-between;
  font-size: 1.04rem;
  transition: color 0.2s;
}
.info-card li .label {
  color: #0d47a1;
  font-weight: 600;
}
.info-card li .value {
  color: #1976d2;
  font-weight: 500;
}
.indicadores-section {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.indicador-card {
  background: #e3f2fd;
  border-radius: 12px;
  box-shadow: 0 2px 12px #90caf9aa;
  padding: 1.2rem 2rem;
  min-width: 160px;
  text-align: center;
  transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
  border: 1.5px solid #90caf9;
  cursor: pointer;
  animation: fadeScaleIn 0.7s;
}
.indicador-card:hover {
  background: #bbdefb;
  transform: scale(1.06) rotate(1deg);
  box-shadow: 0 8px 32px #42a5f555;
}
.indicador-label {
  display: block;
  font-size: 1.05rem;
  color: #1565c0;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.indicador-value {
  font-size: 1.3rem;
  color: #0d47a1;
  font-weight: 700;
  letter-spacing: 1px;
}
.flujo-section {
  margin-top: 2.5rem;
}
.flujo-section h3 {
  color: #1976d2;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.flujo-table-container {
  overflow-x: auto;
  margin-top: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px #90caf933;
  background: #f7faff;
  padding: 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  font-size: 1.01rem;
}
table th, table td {
  border: 1px solid #90caf9;
  padding: 0.6rem;
  text-align: center;
  transition: background 0.18s, color 0.18s;
}
table th {
  background-color: #e3f2fd;
  color: #1565c0;
  font-weight: 700;
  letter-spacing: 1px;
}
table tbody tr:hover {
  background: #e3f2fd;
  color: #1976d2;
  transform: scale(1.01);
}
</style>