import React, { useState } from 'react'
import { REAL_MEASUREMENTS, ECA_LIMITS } from '../data/measurementsData'
import { RealMeasurement } from '../types'
import {
  FlaskConical,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Info,
  ExternalLink,
  Table,
} from 'lucide-react'

export const ScientificDataView: React.FC = () => {
  const [selectedCuenca, setSelectedCuenca] = useState<string>('todos')
  const [onlyViolations, setOnlyViolations] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const filteredMeasurements = REAL_MEASUREMENTS.filter((m) => {
    if (selectedCuenca !== 'todos' && m.cuencaId !== selectedCuenca) return false
    if (onlyViolations && m.cumpleECA) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        m.punto.toLowerCase().includes(term) ||
        m.quebrada.toLowerCase().includes(term) ||
        m.fuente.toLowerCase().includes(term)
      )
    }
    return true
  })

  // Quick statistics
  const total = REAL_MEASUREMENTS.length
  const acidicPoints = REAL_MEASUREMENTS.filter((m) => m.ph < 6.5).length
  const metalExceeding = REAL_MEASUREMENTS.filter(
    (m) => m.hierro > ECA_LIMITS.hierro || m.aluminio > ECA_LIMITS.aluminio
  ).length
  const pctAcidic = Math.round((acidicPoints / total) * 100)

  const exportCSV = () => {
    const headers = [
      'ID',
      'Punto',
      'Quebrada',
      'Cuenca',
      'Lat',
      'Lng',
      'Fecha',
      'pH',
      'Conductividad_uS_cm',
      'Hierro_mg_L',
      'Aluminio_mg_L',
      'Manganeso_mg_L',
      'Cumple_ECA',
      'Fuente',
    ]

    const rows = filteredMeasurements.map((m) => [
      m.id,
      `"${m.punto}"`,
      `"${m.quebrada}"`,
      m.cuencaId,
      m.lat,
      m.lng,
      m.fecha,
      m.ph,
      m.conductividad,
      m.hierro,
      m.aluminio,
      m.manganeso,
      m.cumpleECA ? 'SI' : 'NO',
      `"${m.fuente}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'glaciagua_mediciones_inaigem_upch.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#dfe7e5] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-[#3346a8] bg-[#edf0ff] px-2.5 py-0.5 rounded-full inline-block mb-1">
              Etiquetas de Contraste Científico
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172726]">
              Mediciones Hidroquímicas en Terreno
            </h1>
            <p className="text-sm text-[#667573] mt-1 max-w-3xl">
              Datos reales digitalizados de estudios publicados por INAIGEM (49 localidades) y UPCH
              (19 quebradas del Santa). Sirven como verdad de terreno (ground truth) para contrastar
              el índice de riesgo frente a los Estándares de Calidad Ambiental (D.S. 004-2017-MINAM).
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-[#3346a8] hover:bg-[#25368f] text-white text-xs font-bold flex items-center gap-2 transition-colors self-start md:self-auto shrink-0 shadow-xs"
          >
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#dfe7e5] shadow-xs">
          <span className="text-[11px] font-bold text-[#667573] uppercase">Puntos Monitoreados</span>
          <h3 className="text-2xl font-black text-[#172726] mt-1">{total} estaciones</h3>
          <span className="text-[11px] text-[#3346a8] font-semibold">INAIGEM · UPCH · ANA</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#dfe7e5] shadow-xs">
          <span className="text-[11px] font-bold text-[#667573] uppercase">pH Fuera de Norma</span>
          <h3 className="text-2xl font-black text-[#bd3f3a] mt-1">
            {acidicPoints} puntos ({pctAcidic}%)
          </h3>
          <span className="text-[11px] text-[#bd3f3a] font-semibold">pH &lt; 6.5 (Drenaje Ácido)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#dfe7e5] shadow-xs">
          <span className="text-[11px] font-bold text-[#667573] uppercase">Exceso de Fe / Al</span>
          <h3 className="text-2xl font-black text-[#a86408] mt-1">
            {metalExceeding} puntos
          </h3>
          <span className="text-[11px] text-[#a86408] font-semibold">Superan el ECA Agua</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#dfe7e5] shadow-xs">
          <span className="text-[11px] font-bold text-[#667573] uppercase">ECA de Referencia</span>
          <h3 className="text-xl font-black text-[#21835b] mt-1">D.S. 004-2017</h3>
          <span className="text-[11px] text-[#667573] font-semibold">MINAM Cat. 1 y Cat. 3</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dfe7e5] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#667573] flex items-center gap-1">
            <Filter size={14} /> Cuenca:
          </span>
          <button
            onClick={() => setSelectedCuenca('todos')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedCuenca === 'todos'
                ? 'bg-[#3346a8] text-white'
                : 'bg-gray-100 text-[#667573] hover:text-black'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedCuenca('quillcay')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedCuenca === 'quillcay'
                ? 'bg-[#3346a8] text-white'
                : 'bg-gray-100 text-[#667573] hover:text-black'
            }`}
          >
            Quillcay (Huaraz)
          </button>
          <button
            onClick={() => setSelectedCuenca('pachacoto')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedCuenca === 'pachacoto'
                ? 'bg-[#3346a8] text-white'
                : 'bg-gray-100 text-[#667573] hover:text-black'
            }`}
          >
            Pachacoto (Pastoruri)
          </button>
          <button
            onClick={() => setSelectedCuenca('canray-chico')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedCuenca === 'canray-chico'
                ? 'bg-[#3346a8] text-white'
                : 'bg-gray-100 text-[#667573] hover:text-black'
            }`}
          >
            Canray Chico
          </button>
          <button
            onClick={() => setSelectedCuenca('rio-blanco')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              selectedCuenca === 'rio-blanco'
                ? 'bg-[#3346a8] text-white'
                : 'bg-gray-100 text-[#667573] hover:text-black'
            }`}
          >
            Río Blanco
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-bold text-[#bd3f3a] cursor-pointer">
            <input
              type="checkbox"
              checked={onlyViolations}
              onChange={(e) => setOnlyViolations(e.target.checked)}
              className="accent-[#bd3f3a]"
            />
            Solo con exceso de metales / pH ácido
          </label>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-[#667573]" />
            <input
              type="text"
              placeholder="Buscar estación o quebrada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-[#dfe7e5] text-xs text-[#172726] focus:outline-[#3346a8] w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-[#dfe7e5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8faf9] text-[#667573] uppercase font-black text-[10px] tracking-wider border-b border-[#dfe7e5]">
              <tr>
                <th className="py-3 px-4">Estación / Punto</th>
                <th className="py-3 px-4">Quebrada / Cuenca</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">pH</th>
                <th className="py-3 px-3">Cond. (µS/cm)</th>
                <th className="py-3 px-3">Hierro Fe (mg/L)</th>
                <th className="py-3 px-3">Aluminio Al (mg/L)</th>
                <th className="py-3 px-3">ECA Agua</th>
                <th className="py-3 px-4">Fuente Oficial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe7e5]">
              {filteredMeasurements.map((m) => {
                const isPhBad = m.ph < 6.5
                const isFeBad = m.hierro > ECA_LIMITS.hierro
                const isAlBad = m.aluminio > ECA_LIMITS.aluminio

                return (
                  <tr key={m.id} className="hover:bg-[#fbfcfc] transition-colors">
                    <td className="py-3 px-4 font-black text-[#172726]">
                      {m.punto}
                      <span className="block text-[10px] font-normal text-[#667573]">
                        {m.lat.toFixed(3)}, {m.lng.toFixed(3)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#172726] font-semibold">{m.quebrada}</td>
                    <td className="py-3 px-3 text-[#667573]">{m.fecha}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-black px-2 py-0.5 rounded-md ${
                          isPhBad
                            ? 'bg-red-50 text-[#bd3f3a] border border-red-200'
                            : 'text-[#21835b]'
                        }`}
                      >
                        {m.ph.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#172726]">{m.conductividad}</td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${isFeBad ? 'text-[#bd3f3a]' : 'text-[#172726]'}`}>
                        {m.hierro.toFixed(2)}
                      </span>
                      {isFeBad && <span className="text-[9px] text-red-600 block">(&gt; 1.0)</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${isAlBad ? 'text-[#bd3f3a]' : 'text-[#172726]'}`}>
                        {m.aluminio.toFixed(2)}
                      </span>
                      {isAlBad && <span className="text-[9px] text-red-600 block">(&gt; 0.9)</span>}
                    </td>
                    <td className="py-3 px-3">
                      {m.cumpleECA ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#21835b] bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                          <CheckCircle2 size={12} /> Cumple
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#bd3f3a] bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          <AlertTriangle size={12} /> Supera ECA
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#3346a8] font-bold">{m.fuente}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
