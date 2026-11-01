const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, '..')
const esPath = path.join(srcDir, 'i18n/es.json')
const quPath = path.join(srcDir, 'i18n/qu.json')

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
const keyOccurrences = {}

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8')
  let match
  while ((match = regex.exec(content)) !== null) {
    const key = match[1]
    usedKeys.add(key)
    if (!keyOccurrences[key]) keyOccurrences[key] = []
    keyOccurrences[key].push(path.relative(srcDir, file))
  }
})

console.log(`[i18n-check] Se encontraron ${usedKeys.size} claves usadas con t('...')`)

const missingInEs = []
const missingInQu = []

usedKeys.forEach((key) => {
  if (es[key] === undefined) {
    missingInEs.push(key)
  }
  if (qu[key] === undefined) {
    missingInQu.push(key)
  }
})

if (missingInEs.length > 0 || missingInQu.length > 0) {
  console.error('\n❌ ERROR: Faltan claves en los diccionarios i18n:')
  if (missingInEs.length > 0) {
    console.error('  Faltan en es.json:', missingInEs)
  }
  if (missingInQu.length > 0) {
    console.error('  Faltan en qu.json:', missingInQu)
  }
  process.exit(1)
} else {
  console.log('✓ Verificación de paridad i18n superada: 100% de claves sincronizadas en es.json y qu.json.')
}
