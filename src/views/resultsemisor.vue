<template>
  <div class="calculo-page">
    <nav class="navbar">
      <span class="navbar-title">Dashboard Bonista</span>
      <div class="navbar-actions">
        <button class="create-bond-btn" @click="$router.push('/bonista')">Dashboard</button>
        <button class="create-bond-btn" @click="$router.push('/createbond')">Crear Bono</button>
        <button class="logout-btn" @click="logout">Cerrar sesión</button>
      </div>
    </nav>

    <div class="calculo-content" v-if="bono">
      <h1>Resultados</h1>

      <div class="bono-info">
        <div class="info-block">
          <p><strong>Nombre:</strong> {{ bono.nombre }}</p>
          <p><strong>Monto:</strong> {{ bono.monto }}</p>
          <p><strong>Moneda:</strong> {{ bono.moneda }}</p>
          <p><strong>Tasa:</strong> {{ bono.tasa }}%</p>
          <p><strong>Tipo de Tasa:</strong> {{ bono.tipo_tasa }}</p>
        </div>
        <div class="info-block">
          <p><strong>Plazo:</strong> {{ bono.plazo }} años</p>
          <p><strong>Frecuencia:</strong> {{ bono.frecuencia }}</p>
          <p><strong>Capitalización:</strong> {{ bono.capitalizacion || '-' }}</p>
          <p><strong>Amortización:</strong> {{ bono.amortizacion }}</p>
          <p><strong>Gracia:</strong> {{ bono.gracia }}</p>
        </div>
      </div>

      <h3>Indicadores de Rentabilidad</h3>
      <p><strong>TCEA:</strong> {{ (tcea * 100).toFixed(2) }}%</p>

      <h3>Duración y Convexidad</h3>
      <p><strong>Duración:</strong> {{ duracion.toFixed(4) }}</p>
      <p><strong>Duración Modificada:</strong> {{ duracionModificada.toFixed(4) }}</p>
      <p><strong>Convexidad:</strong> {{ convexidad.toFixed(4) }}</p>

      <h3>Precio Máximo</h3>
      <p><strong>Precio Máximo:</strong> {{ precioMaximo.toFixed(2) }}</p>

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
      }
    }
  },
  async mounted() {
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
  methods: {
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
  background: #f7faff;
  display: flex;
  flex-direction: column;
}
.navbar {
  background: linear-gradient(90deg, #1565c0 0%, #42a5f5 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
}
.navbar-title {
  font-size: 1.4rem;
  font-weight: bold;
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
}
.create-bond-btn {
  color: #388e3c;
}
.create-bond-btn:hover {
  background: #388e3c;
  color: #fff;
}
.logout-btn {
  color: #1565c0;
}
.logout-btn:hover {
  background: #1976d2;
  color: #fff;
}
.calculo-content {
  max-width: 98vw;
  margin: 2rem auto;
  padding: 2rem 2.5vw;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(21, 101, 192, 0.08);
  color: #1565c0;
  border: 1.5px solid #e3f2fd;
}
h1, h2, h3 {
  color: #0d47a1;
}
.bono-info {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}
.info-block {
  flex: 1;
  min-width: 250px;
  margin: 0.5rem 1rem;
}
.flujo-table-container {
  overflow-x: auto;
  margin-top: 1.5rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
table th, table td {
  border: 1px solid #90caf9;
  padding: 0.6rem;
  text-align: center;
}
table th {
  background-color: #e3f2fd;
}
</style>