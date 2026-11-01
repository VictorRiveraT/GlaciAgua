import React from 'react'
import { RiskLevel } from '../types'
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Droplet,
  Ban,
  Flame,
  Sprout,
  Users,
} from 'lucide-react'

export interface AccessibleRiskStyle {
  level: RiskLevel
  labelEs: string
  labelQu: string
  shapeNameEs: string
  shapeNameQu: string
  shortAdviceEs: string
  shortAdviceQu: string
  bgSolid: string
  textOnSolid: string
  bgSoft: string
  borderSoft: string
  textDark: string
  dotHex: string
  iconName: 'octagon' | 'triangle' | 'circle'
}

/**
 * Paleta de contraste reforzado WCAG AAA/AA y formas diferenciadas para daltónicos:
 * - Alto: Octágono / Mano de alto 🛑
 * - Medio: Triángulo de advertencia ⚠️
 * - Bajo: Círculo con checkmark ✓
 */
export const ACCESSIBLE_RISK_STYLES: Record<RiskLevel, AccessibleRiskStyle> = {
  Alto: {
    level: 'Alto',
    labelEs: 'Riesgo Alto',
    labelQu: 'Hukllay Rikuy (Alto)',
    shapeNameEs: 'Octágono rojo de alerta',
    shapeNameQu: 'Puka pukllana',
    shortAdviceEs: 'Esta quebrada puede tener acidez. Evita usarla y avisa a tu junta o municipio.',
    shortAdviceQu: 'Kay yakuqa poqoq kaykanman. Ama upyeytsu, jass-nikita willay.',
    bgSolid: 'bg-[#991b1b]',
    textOnSolid: 'text-white',
    bgSoft: 'bg-[#fef2f2]',
    borderSoft: 'border-[#b91c1c]',
    textDark: 'text-[#991b1b]',
    dotHex: '#991b1b',
    iconName: 'octagon',
  },
  Medio: {
    level: 'Medio',
    labelEs: 'Riesgo Medio',
    labelQu: 'Chawpi Rikuy (Medio)',
    shapeNameEs: 'Triángulo amarillo de cuidado',
    shapeNameQu: 'Qellu pukllana',
    shortAdviceEs: 'Agua en observación. Consulta con tu junta de agua antes de usarla.',
    shortAdviceQu: 'Yaku rikapaashqa kaykan. JASS-nikita tapukuy manaraq upyashpa.',
    bgSolid: 'bg-[#92400e]',
    textOnSolid: 'text-white',
    bgSoft: 'bg-[#fefce8]',
    borderSoft: 'border-[#b45309]',
    textDark: 'text-[#92400e]',
    dotHex: '#92400e',
    iconName: 'triangle',
  },
  Bajo: {
    level: 'Bajo',
    labelEs: 'Riesgo Bajo',
    labelQu: 'Uray Rikuy (Bajo)',
    shapeNameEs: 'Círculo verde de menor riesgo',
    shapeNameQu: 'Qomer pukllana',
    shortAdviceEs: 'Menor riesgo de acidez. Trata el agua según las indicaciones de tu JASS.',
    shortAdviceQu: 'Yakuqa allillam kaykan. JASS nishqanno altsay.',
    bgSolid: 'bg-[#166534]',
    textOnSolid: 'text-white',
    bgSoft: 'bg-[#f0fdf4]',
    borderSoft: 'border-[#15803d]',
    textDark: 'text-[#166534]',
    dotHex: '#166534',
    iconName: 'circle',
  },
}

/**
 * Aviso legal y sanitario permanente (Regla innegociable N° 4)
 */
export const DISCLAIMER_NOTE_ES =
  'Priorización y alerta temprana comunitaria. No certifica potabilidad. Consulta siempre a tu junta de agua o municipio.'

export const DISCLAIMER_NOTE_QU =
  'Willakuy yaku rikaypaq. Manam yakupa llumpaychu nintsu. JASS-nikita tapukuy.'

export function getRiskTheme(level: RiskLevel): AccessibleRiskStyle {
  return ACCESSIBLE_RISK_STYLES[level] || ACCESSIBLE_RISK_STYLES.Medio
}

