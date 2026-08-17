export interface GlossaryTerm {
  term: string;
  symbol?: string;
  body: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Ley de Fourier',
    symbol: 'Q = k A ΔT / L',
    body: 'El calor conducido es proporcional a la conductividad, al área y al salto de temperatura, e inversamente proporcional al espesor.',
  },
  {
    term: 'Resistencia térmica',
    symbol: 'R',
    body: 'Analogía eléctrica: Q = ΔT / R. En serie, las resistencias de cada capa se suman.',
  },
  {
    term: 'Conductividad térmica',
    symbol: 'k',
    body: 'Capacidad del material para transportar calor por conducción. Metales altos; aislantes bajos.',
  },
  {
    term: 'Ley de Newton',
    symbol: 'Q = h A (T_s − T_f)',
    body: 'El calor convectivo depende del coeficiente h, del área y de la diferencia superficie–fluido.',
  },
  {
    term: 'Reynolds',
    symbol: 'Re',
    body: 'Inercia vs viscosidad. En placa plana, Re < 5×10⁵ suele ser laminar.',
  },
  {
    term: 'Nusselt',
    symbol: 'Nu = h L / k_fluido',
    body: 'Convección adimensional. Correlaciones empíricas lo relacionan con Re y Pr.',
  },
  {
    term: 'Prandtl',
    symbol: 'Pr = ν / α',
    body: 'Compara difusión de cantidad de movimiento y de calor en el fluido. Agua ≈ 7; aire ≈ 0,7.',
  },
  {
    term: 'Rayleigh',
    symbol: 'Ra',
    body: 'Motor de la convección natural. La correlación usada aquí vale aproximadamente entre 10⁴ y 10⁹.',
  },
  {
    term: 'Número de Biot',
    symbol: 'Bi = h L / k_sólido',
    body: 'Si Bi < 0,1, la temperatura del sólido es casi uniforme (capacidad lumped válida).',
  },
  {
    term: 'Radio crítico',
    symbol: 'r_cr = k / h',
    body: 'En un cilindro, añadir aislamiento por debajo de r_cr puede aumentar la pérdida de calor (más área).',
  },
  {
    term: 'Stefan-Boltzmann',
    symbol: 'E_b = σ T⁴',
    body: 'Un cuerpo negro emite con la cuarta potencia de la temperatura absoluta (kelvin).',
  },
  {
    term: 'Emisividad',
    symbol: 'ε',
    body: 'Fracción emitida respecto al cuerpo negro (0 a 1). Superficie gris: α = ε.',
  },
  {
    term: 'Ley de Wien',
    symbol: 'λ_max T = 2898 μm·K',
    body: 'Longitud de onda del máximo de emisión. A 27 °C el pico está en el infrarrojo lejano (~10 μm).',
  },
  {
    term: 'Coeficiente U',
    symbol: 'U',
    body: 'Transmitancia global de una pared con convección a ambos lados: 1/U = 1/h_i + L/k + 1/h_o.',
  },
];

export const KEYBOARD_SHORTCUTS = [
  { keys: '1 – 5', action: 'Ir a Panel, Conducción, Convección, Radiación o Historial' },
  { keys: '?', action: 'Abrir o cerrar esta guía' },
  { keys: 'Esc', action: 'Cerrar la guía' },
];
