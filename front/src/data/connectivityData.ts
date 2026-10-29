// Datos reales de infraestructura de telecomunicaciones, cobertura móvil y puntos de acceso a internet en el Callejón de Huaylas y la Cordillera Blanca (PRONATEL / MTC / MIDIS / SERNANP)

export type ConnectivityType =
  | 'wifi_libre'
  | 'tambo_satelital'
  | 'antena_movil'
  | 'puesto_salud'
  | 'zona_sombra'

export interface ConnectivityPoint {
  id: string
  nombre: string
  tipo: ConnectivityType
  lugar: string
  cuencaCercana: string
  lat: number
  lng: number
  operador: string
  tecnologia: '4G LTE' | '3G / 2G' | 'WiFi Satelital' | 'Fibra Óptica Rural' | 'Sin Señal'
  tieneWifiLibre: boolean
  descripcion: string
  recomendacion: string
  horario: string
}

export interface ConnectivityZone {
  id: string
  nombre: string
  tipo: 'cobertura_4g' | 'cobertura_3g' | 'zona_sombra'
  color: string
  fillColor: string
  descripcion: string
  coordenadas: [number, number][]
}

export const CONNECTIVITY_POINTS: ConnectivityPoint[] = [
  {
    id: 'pt-h改造-01',
    nombre: 'Plaza Mayor de Huaraz (WiFi Digital Municipal)',
    tipo: 'wifi_libre',
    lugar: 'Huaraz Centro',
    cuencaCercana: 'Quillcay / Río Santa',
    lat: -9.5285,
    lng: -77.5285,
    operador: 'PRONATEL / Municipalidad Provincial de Huaraz',
    tecnologia: 'Fibra Óptica Rural',
    tieneWifiLibre: true,
    descripcion: 'Punto de alta velocidad conectado a la Red Dorsal. Cobertura en toda la plaza y alrededores.',
    recomendacion: 'Ideal para actualizar mapas satelitales sin consumir saldo móvil.',
    horario: 'Abierto 24 horas',
  },
  {
    id: 'pt-unchus-02',
    nombre: 'Plaza Comunal de Unchus (WiFi Rural)',
    tipo: 'wifi_libre',
    lugar: 'Centro Poblado Unchus',
    cuencaCercana: 'Quillcay (Subcuenca Cojup/Shallap)',
    lat: -9.5215,
    lng: -77.4925,
    operador: 'PRONATEL Red Regional Áncash',
    tecnologia: 'WiFi Satelital',
    tieneWifiLibre: true,
    descripcion: 'Internet comunitario gratuito frente al local comunal de Unchus. Muy usado por comuneros y regantes.',
    recomendacion: 'Al descender de Quebrada Cojup o Shallap, aquí se sincronizan automáticamente los reportes guardados.',
    horario: '6:00 am a 10:00 pm',
  },
  {
    id: 'pt-llupa-03',
    nombre: 'Local Comunal Llupa (Punto Digital)',
    tipo: 'wifi_libre',
    lugar: 'Comunidad Campesina de Llupa',
    cuencaCercana: 'Quillcay (Camino a Churup y Pitec)',
    lat: -9.5105,
    lng: -77.4855,
    operador: 'PRONATEL / Bitel Rural',
    tecnologia: '4G LTE',
    tieneWifiLibre: true,
    descripcion: 'Último punto urbano con WiFi antes de ascender hacia Pitec y Laguna Churup.',
    recomendacion: 'Verifica el estado del agua antes de salir hacia las lagunas glaciares.',
    horario: 'Abierto 24 horas',
  },
  {
    id: 'pt-pitec-04',
    nombre: 'Loma de Pitec (Puesto de Control SERNANP)',
    tipo: 'antena_movil',
    lugar: 'Pitec (Entrada Parque Nacional Huascarán)',
    cuencaCercana: 'Quillcay (Quebrada Quilcayhuanca / Cojup)',
    lat: -9.5035,
    lng: -77.4520,
    operador: 'Movistar / Claro (Señal desde antena Rataquenua)',
    tecnologia: '3G / 2G',
    tieneWifiLibre: false,
    descripcion: 'Señal móvil abierta intermitente en la loma abierta. En el puesto SERNANP hay radiofrecuencia de emergencia.',
    recomendacion: 'Si necesitas señal celular, sube a la colina despejada frente a la caseta.',
    horario: 'Guardaparques: 7:00 am a 4:00 pm',
  },
  {
    id: 'pt-tambo-catac-05',
    nombre: 'Tambo Cátac (MIDIS - Conexión Satelital Libre)',
    tipo: 'tambo_satelital',
    lugar: 'Distrito de Cátac (Pampa de Conococha / Pastoruri)',
    cuencaCercana: 'Pachacoto / Pumapampa',
    lat: -9.8050,
    lng: -77.4285,
    operador: 'Plataforma PAIS - MIDIS / PRONATEL',
    tecnologia: 'WiFi Satelital',
    tieneWifiLibre: true,
    descripcion: 'Tambo oficial con internet satelital libre 24/7 para pobladores de comunidades campesinas y ganaderos altoandinos.',
    recomendacion: 'Punto de apoyo clave al regresar del Nevado Pastoruri o Quebrada Pumapampa. Computadoras y WiFi libre.',
    horario: 'Atención comunitaria permanente',
  },
  {
    id: 'pt-catac-plaza-06',
    nombre: 'Plaza de Armas de Cátac',
    tipo: 'wifi_libre',
    lugar: 'Cátac Pueblo',
    cuencaCercana: 'Pachacoto',
    lat: -9.7990,
    lng: -77.4260,
    operador: 'Municipalidad Distrital de Cátac / Red Dorsal',
    tecnologia: '4G LTE',
    tieneWifiLibre: true,
    descripcion: 'Excelente conectividad 4G de todos los operadores y punto WiFi municipal en la plaza.',
    recomendacion: 'Carga completa de fotos comunitarias de agua ácida.',
    horario: 'Abierto 24 horas',
  },
  {
    id: 'pt-tambo-olleros-07',
    nombre: 'Tambo Olleros / Huaripampa (MIDIS)',
    tipo: 'tambo_satelital',
    lugar: 'Distrito de Olleros',
    cuencaCercana: 'Canray Chico (Quebrada Rurec / Uquis)',
    lat: -9.6580,
    lng: -77.4980,
    operador: 'MIDIS - Plataforma PAIS',
    tecnologia: 'WiFi Satelital',
    tieneWifiLibre: true,
    descripcion: 'Centro de conectividad para las familias de Olleros y quebradas laterales. Asistencia digital para la comunidad.',
    recomendacion: 'Espacio seguro para enviar reportes de captación de agua.',
    horario: 'Lunes a Sábado: 8:00 am a 5:00 pm',
  },
  {
    id: 'pt-canray-salud-08',
    nombre: 'Puesto de Salud Canray Chico',
    tipo: 'puesto_salud',
    lugar: 'Canray Chico (Olleros)',
    cuencaCercana: 'Canray Chico',
    lat: -9.6350,
    lng: -77.4700,
    operador: 'MINSA / Red de Salud Huaylas Sur',
    tecnologia: 'WiFi Satelital',
    tieneWifiLibre: true,
    descripcion: 'Punto con antena satelital para telemedicina y coordinación sanitaria de calidad de agua.',
    recomendacion: 'Permite consultar con el técnico de salud sobre agua segura y análisis de metales.',
    horario: 'Emergencias 24h / Consultas 8:00 am a 2:00 pm',
  },
  {
    id: 'pt-pastoruri-sombra-09',
    nombre: 'Frente Glaciar Pastoruri (Zona Sombra)',
    tipo: 'zona_sombra',
    lugar: 'Quebrada Pachacoto Alta (5,050 msnm)',
    cuencaCercana: 'Pachacoto (Pastoruri)',
    lat: -9.9210,
    lng: -77.1950,
    operador: 'Sin Operador Comercial (SERNANP VHF 145.5 MHz)',
    tecnologia: 'Sin Señal',
    tieneWifiLibre: false,
    descripcion: 'Zona de estricta sombra celular por encajonamiento rocoso. No hay señal de internet móvil de ningún operador.',
    recomendacion: '¡No te preocupes! GlaciAgua funciona 100% desconectado. Tus mediciones de pH se sincronizarán al llegar al Tambo Cátac.',
    horario: 'Ingreso PNH: 7:00 am a 2:00 pm',
  },
  {
    id: 'pt-shallap-sombra-10',
    nombre: 'Laguna Shallap (Foco DAR - Zona Sombra)',
    tipo: 'zona_sombra',
    lugar: 'Cabecera de Quebrada Shallap (4,250 msnm)',
    cuencaCercana: 'Quillcay (Shallap)',
    lat: -9.5240,
    lng: -77.3880,
    operador: 'Sin Cobertura Celular',
    tecnologia: 'Sin Señal',
    tieneWifiLibre: false,
    descripcion: 'Encajonamiento entre los nevados Huantsán y San Juan. Zona sin conectividad.',
    recomendacion: 'Toma la foto del agua naranja y registra el pH; la aplicación guardará todo con coordenadas satelitales GPS.',
    horario: 'Camino de montaña libre',
  },
  {
    id: 'pt-santacruz-11',
    nombre: 'Plaza Mayor de Caraz / Santa Cruz',
    tipo: 'wifi_libre',
    lugar: 'Valle Río Santa Cruz',
    cuencaCercana: 'Río Blanco / Santa Cruz',
    lat: -8.9800,
    lng: -77.7000,
    operador: 'Municipalidad Provincial de Huaylas / PRONATEL',
    tecnologia: '4G LTE',
    tieneWifiLibre: true,
    descripcion: 'Punto de alta conectividad y WiFi abierto en la plaza.',
    recomendacion: 'Revisa las alertas de cuencas vecinas antes de emprender trekking o labores agrícolas.',
    horario: 'Abierto 24 horas',
  },
  {
    id: 'pt-antena-rataquenua-12',
    nombre: 'Antena Repetidora Rataquenua (Cerro Mirador)',
    tipo: 'antena_movil',
    lugar: 'Mirador Rataquenua (Huaraz)',
    cuencaCercana: 'Quillcay / Río Santa',
    lat: -9.5400,
    lng: -77.5250,
    operador: 'Claro / Movistar / Entel / Bitel (Torre Multiservicio)',
    tecnologia: '4G LTE',
    tieneWifiLibre: false,
    descripcion: 'Estación base principal de telefonía celular que irradia señal hacia Huaraz, Unchus y la entrada de las quebradas.',
    recomendacion: 'Línea de vista directa desde cerros despejados para captar señal 4G.',
    horario: 'Transmisión continua 24/7',
  },
]

// Polígonos aproximados de las zonas de cobertura del valle y zonas de sombra en las quebradas glaciares
export const CONNECTIVITY_ZONES: ConnectivityZone[] = [
  {
    id: 'zone-4g-valle',
    nombre: 'Corredor Central Río Santa (Cobertura 4G Plena)',
    tipo: 'cobertura_4g',
    color: '#16a34a',
    fillColor: '#22c55e',
    descripcion: 'Cobertura celular 4G LTE y 3G continua de todos los operadores en el fondo de valle (Huaraz, Carhuaz, Recuay, Cátac).',
    coordenadas: [
      [-9.4500, -77.5600],
      [-9.4800, -77.5400],
      [-9.5200, -77.5300],
      [-9.5600, -77.5100],
      [-9.6500, -77.4900],
      [-9.7800, -77.4400],
      [-9.8100, -77.4200],
      [-9.8100, -77.4100],
      [-9.7600, -77.4200],
      [-9.6200, -77.4700],
      [-9.5300, -77.5000],
      [-9.4900, -77.5200],
      [-9.4500, -77.5400],
    ],
  },
  {
    id: 'zone-3g-laderas',
    nombre: 'Faldas y Laderas Rurales (Señal 3G/2G Moderada)',
    tipo: 'cobertura_3g',
    color: '#eab308',
    fillColor: '#facc15',
    descripcion: 'Poblados de ladera como Unchus, Llupa, Marian y Olleros alto. Señal móvil moderada; funciona envío ligero de reportes.',
    coordenadas: [
      [-9.4900, -77.5100],
      [-9.5100, -77.4750],
      [-9.5350, -77.4800],
      [-9.5500, -77.5000],
      [-9.5300, -77.5200],
      [-9.5000, -77.5200],
    ],
  },
  {
    id: 'zone-sombra-quillcay',
    nombre: 'Quebradas Quillcay / Cojup / Shallap (Zona Sombra Glaciar)',
    tipo: 'zona_sombra',
    color: '#dc2626',
    fillColor: '#ef4444',
    descripcion: 'Cañones glaciares profundos sin señal de celular. GlaciAgua activa automáticamente el modo Offline-First.',
    coordenadas: [
      [-9.4700, -77.4700],
      [-9.4200, -77.4200],
      [-9.4500, -77.3400],
      [-9.5400, -77.3600],
      [-9.5450, -77.4300],
      [-9.5150, -77.4600],
    ],
  },
  {
    id: 'zone-sombra-pastoruri',
    nombre: 'Quebrada Pachacoto Alta / Pastoruri (Zona Sombra Glaciar)',
    tipo: 'zona_sombra',
    color: '#dc2626',
    fillColor: '#ef4444',
    descripcion: 'Área alta del Parque Nacional Huascarán (4,500 - 5,200 msnm). Sin cobertura celular comercial.',
    coordenadas: [
      [-9.8300, -77.3200],
      [-9.8700, -77.2200],
      [-9.9600, -77.1900],
      [-9.9600, -77.2600],
      [-9.8900, -77.3500],
    ],
  },
]
