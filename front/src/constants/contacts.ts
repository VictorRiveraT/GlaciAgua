export interface CommunityContact {
  id: string
  name: string
  role: string
  displayPhone: string
  rawPhone: string
  isUnconfirmed: boolean
}

/**
 * Directorio de teléfonos de ayuda y autoridades locales (Huaraz, Áncash).
 * NOTA: Los números actuales son referenciales de las entidades locales y
 * se muestran con la etiqueta "Número por confirmar" hasta su validación comunitaria en campo.
 */
export const EMERGENCY_CONTACTS: CommunityContact[] = [
  {
    id: 'contact-jass',
    name: 'JASS / Junta de Regantes',
    role: 'Atención local y control de bocatomas',
    displayPhone: '(043) 42-1234',
    rawPhone: '043421234',
    isUnconfirmed: true,
  },
  {
    id: 'contact-diresa',
    name: 'Centro de Salud / DIRESA Huaraz',
    role: 'Salud ambiental y emergencias médicas',
    displayPhone: '(043) 42-2020',
    rawPhone: '043422020',
    isUnconfirmed: true,
  },
  {
    id: 'contact-municipio',
    name: 'Defensa Civil / Municipio Huaraz',
    role: 'Gestión de riesgos de desastres y apoyo cisterna',
    displayPhone: '(043) 42-1661',
    rawPhone: '043421661',
    isUnconfirmed: true,
  },
]
