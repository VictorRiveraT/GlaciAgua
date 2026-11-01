const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, '..')
const rootFront = path.join(srcDir, '..')
const illustrationsDir = path.join(rootFront, 'public/illustrations')
const esPath = path.join(srcDir, 'i18n/es.json')
const quPath = path.join(srcDir, 'i18n/qu.json')
const apiPath = path.join(srcDir, 'services/api.ts')
const contactsPath = path.join(srcDir, 'constants/contacts.ts')

let totalTests = 0
let passedTests = 0
let failedTests = 0

function runTest(testName, fn) {
  totalTests++
  try {
    fn()
    console.log(`  ✓ PASS: ${testName}`)
    passedTests++
  } catch (err) {
    console.error(`  ❌ FAIL: ${testName}`)
    console.error(`     Error: ${err.message}`)
    failedTests++
  }
}

console.log('\n======================================================')
console.log('🧪 EJECUTANDO SUITE DE TESTS - GLACIAGUA FRONTEND')
console.log('======================================================\n')

// ---------------------------------------------------------------------
// TEST 1: Paridad y Sincronización i18n
// ---------------------------------------------------------------------
runTest('i18n: Todas las llamadas t(\'...\') existen en es.json y qu.json', () => {
  const es = JSON.parse(fs.readFileSync(esPath, 'utf8'))
  const qu = JSON.parse(fs.readFileSync(quPath, 'utf8'))

  function walk(dir) {
    let results = []
    const list = fs.readdirSync(dir)
    list.forEach((file) => {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath))
      } else if (file.endsWith('.tsx') || (file.endsWith('.ts') && !file.endsWith('.d.ts'))) {
        results.push(fullPath)
      }
    })
    return results
  }

  const files = walk(srcDir)
  const regex = /\bt\(\s*['"]([a-zA-Z0-9_\-]+)['"]/g
  const usedKeys = new Set()

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')
    let match
    while ((match = regex.exec(content)) !== null) {
      usedKeys.add(match[1])
    }
  })

  const missingInEs = []
  const missingInQu = []

  usedKeys.forEach((key) => {
    if (es[key] === undefined) missingInEs.push(key)
    if (qu[key] === undefined) missingInQu.push(key)
  })

  if (missingInEs.length > 0) {
    throw new Error(`Faltan ${missingInEs.length} claves en es.json: ${missingInEs.join(', ')}`)
  }
  if (missingInQu.length > 0) {
    throw new Error(`Faltan ${missingInQu.length} claves en qu.json: ${missingInQu.join(', ')}`)
  }
})

runTest('i18n: Todas las claves de es.json tienen contraparte en qu.json', () => {
  const es = JSON.parse(fs.readFileSync(esPath, 'utf8'))
  const qu = JSON.parse(fs.readFileSync(quPath, 'utf8'))
  const missingInQu = Object.keys(es).filter((k) => qu[k] === undefined)
  if (missingInQu.length > 0) {
    throw new Error(`Hay ${missingInQu.length} claves en es.json que faltan en qu.json: ${missingInQu.slice(0, 5).join(', ')}...`)
  }
})

// ---------------------------------------------------------------------
// TEST 2: Auditoría Sanitaria de No-Potabilidad (Reglas Innegociables)
// ---------------------------------------------------------------------
runTest('Aviso Sanitario: Leyenda obligatoria de no-potabilidad presente en diccionarios y temas', () => {
  const es = JSON.parse(fs.readFileSync(esPath, 'utf8'))
  const qu = JSON.parse(fs.readFileSync(quPath, 'utf8'))

  const disclaimerShort = es['disclaimer_short'] || ''
  if (!disclaimerShort.toLowerCase().includes('no certifica potabilidad')) {
    throw new Error('disclaimer_short en es.json no contiene la leyenda obligatoria "No certifica potabilidad"')
  }

  const themeContent = fs.readFileSync(path.join(srcDir, 'utils/accessibleTheme.ts'), 'utf8')
  if (!themeContent.includes('No certifica potabilidad')) {
    throw new Error('accessibleTheme.ts no contiene "No certifica potabilidad"')
  }
})

runTest('Aviso Sanitario: Cero afirmaciones prohibidas de potabilidad o pureza absoluta', () => {
  const esContent = fs.readFileSync(esPath, 'utf8').toLowerCase()
  const forbiddenPhrases = [
    'agua de glaciar limpia',
    'excelente para riego',
    'agua pura para ganado',
    'apta para el hogar',
    'agua 100% pura',
    'agua segura para consumo',
  ]

  for (const phrase of forbiddenPhrases) {
    if (esContent.includes(phrase)) {
      throw new Error(`Se encontró frase prohibida en es.json: "${phrase}"`)
    }
  }
})

// ---------------------------------------------------------------------
// TEST 3: Integridad del Contrato de API (Retrocompatibilidad)
// ---------------------------------------------------------------------
runTest('Contrato API: Preservación de endpoints y métodos de GlaciAguaApi', () => {
  const apiCode = fs.readFileSync(apiPath, 'utf8')
  const requiredMethods = [
    'checkHealth',
    'getMLSalud',
    'getMLModeloInfo',
    'getCuencas',
    'getMediciones',
    'simularRiesgo',
    'enviarReporte',
  ]

  for (const method of requiredMethods) {
    if (!apiCode.includes(`static async ${method}`) && !apiCode.includes(`${method}(`)) {
      throw new Error(`El método "${method}" no fue encontrado en GlaciAguaApi en api.ts`)
    }
  }

  const requiredRoutes = ['/cuencas', '/mediciones', '/simular', '/reportes', '/ml/salud', '/ml/modelo']
  for (const route of requiredRoutes) {
    if (!apiCode.includes(route)) {
      throw new Error(`La ruta contractual "${route}" no está presente en api.ts`)
    }
  }
})

// ---------------------------------------------------------------------
// TEST 4: Presupuesto y Existencia de Activos Visuales
// ---------------------------------------------------------------------
runTest('Activos Visuales: Todas las 8 ilustraciones WebP existen y pesan <= 60 KB', () => {
  const requiredIllustrations = [
    'hacer_avisar.webp',
    'hacer_otra_fuente.webp',
    'hacer_guardar.webp',
    'evitar_beber_quebrada.webp',
    'evitar_hervir.webp',
    'evitar_animales_riego.webp',
    'oficio_documento.webp',
    'guia_ayuda.webp',
  ]

  for (const filename of requiredIllustrations) {
    const fullPath = path.join(illustrationsDir, filename)
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Ilustración requerida no existe: ${filename}`)
    }
    const stat = fs.statSync(fullPath)
    const sizeKb = stat.size / 1024
    if (sizeKb > 60) {
      throw new Error(`Ilustración ${filename} excede el presupuesto de 60 KB: ${sizeKb.toFixed(1)} KB`)
    }
  }
})

runTest('Activos Visuales: El componente Illustration.tsx define fallbacks para todas las ilustraciones', () => {
  const illustrationCode = fs.readFileSync(path.join(srcDir, 'components/Illustration.tsx'), 'utf8')
  const requiredIllustrations = [
    'hacer_avisar',
    'hacer_otra_fuente',
    'hacer_guardar',
    'evitar_beber_quebrada',
    'evitar_hervir',
    'evitar_animales_riego',
    'oficio_documento',
    'guia_ayuda',
  ]

  for (const name of requiredIllustrations) {
    if (!illustrationCode.includes(name)) {
      throw new Error(`Illustration.tsx no incluye soporte para la ilustración: "${name}"`)
    }
  }
})

// ---------------------------------------------------------------------
// TEST 5: Directorio de Contactos de Emergencia
// ---------------------------------------------------------------------
runTest('Contactos: Archivo constants/contacts.ts exporta directorio de emergencias válido', () => {
  if (!fs.existsSync(contactsPath)) {
    throw new Error('No existe front/src/constants/contacts.ts')
  }
  const content = fs.readFileSync(contactsPath, 'utf8')
  if (!content.includes('EMERGENCY_CONTACTS')) {
    throw new Error('contacts.ts no exporta EMERGENCY_CONTACTS')
  }
  if (!content.includes('isUnconfirmed')) {
    throw new Error('contacts.ts debe incluir la propiedad isUnconfirmed')
  }
})

// ---------------------------------------------------------------------
// RESULTADOS FINALES
// ---------------------------------------------------------------------
console.log('\n------------------------------------------------------')
console.log(`TOTAL: ${totalTests} tests | PASADOS: ${passedTests} | FALLIDOS: ${failedTests}`)
console.log('------------------------------------------------------\n')

if (failedTests > 0) {
  console.error(`❌ Los exámenes fallaron con ${failedTests} error(es).\n`)
  process.exit(1)
} else {
  console.log('✅ TODOS LOS EXÁMENES DE GLACIAGUA PASARON CON ÉXITO.\n')
  process.exit(0)
}
