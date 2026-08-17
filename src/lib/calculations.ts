import type { ChartPoint, Fluid } from '../types';

export const SIGMA = 5.670374419e-8;
export const ABSOLUTE_ZERO_C = -273.15;

export type ConductionGeometry = 'flat' | 'cylinder' | 'sphere';
export type ConvectionGeometry = 'plate' | 'cylinder';

export interface Layer {
  name: string;
  k: number;
  L: number;
}

export interface FlatConductionResult {
  q: number;
  resistance: number;
  heatFlux: number;
  profile: ChartPoint[];
}

export interface MultilayerConductionResult {
  q: number;
  totalResistance: number;
  efficiency: number;
  profile: ChartPoint[];
}

export interface RadialConductionResult {
  q: number;
  resistance: number;
  heatFlux: number;
  profile: ChartPoint[];
  geometry: ConductionGeometry;
}

export interface ForcedConvectionResult {
  q: number;
  re: number;
  nu: number;
  h: number;
  pr: number;
  flowRate: number;
  regime: 'Laminar' | 'Transición' | 'Turbulento';
  validity: string;
  geometry: ConvectionGeometry;
}

export interface NaturalConvectionResult {
  q: number;
  ra: number;
  nu: number;
  h: number;
  pr: number;
  validity: string;
}

export interface RadiationResult {
  q: number;
  blackbodyPower: number;
  emittedPower: number;
  absorbedPower: number;
  netFlux: number;
}

export const toKelvin = (temperatureC: number): number => temperatureC + 273.15;

export const formatNumber = (value: number, digits = 3): string => {
  if (!Number.isFinite(value)) return '0';
  if (Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(2);
  }
  return new Intl.NumberFormat('es-EC', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
};

export const validatePositive = (label: string, value: number): string | null =>
  value > 0 ? null : `${label} debe ser mayor que cero.`;

export const validateNonNegative = (label: string, value: number): string | null =>
  value >= 0 ? null : `${label} no puede ser negativo.`;

export const validateCelsius = (label: string, value: number): string | null =>
  value >= ABSOLUTE_ZERO_C ? null : `${label} no puede ser menor que -273,15 °C.`;

export const validateEmissivity = (value: number): string | null =>
  value >= 0 && value <= 1 ? null : 'La emisividad debe estar entre 0 y 1.';

export const validateRadii = (innerRadius: number, outerRadius: number): string | null =>
  outerRadius > innerRadius ? null : 'El radio exterior debe ser mayor que el interior.';

export const calculateFlatConduction = (
  k: number,
  area: number,
  length: number,
  hotC: number,
  coldC: number,
): FlatConductionResult => {
  const deltaT = hotC - coldC;
  const resistance = length / (k * area);
  const q = (k * area * deltaT) / length;
  const heatFlux = q / area;
  const profile = Array.from({ length: 21 }, (_, index) => {
    const x = (length * index) / 20;
    const temperature = hotC - deltaT * (x / length);
    return { label: x.toFixed(3), temperatura: temperature, x };
  });

  return { q, resistance, heatFlux, profile };
};

export const calculateMultilayerConduction = (
  layers: Layer[],
  area: number,
  hotC: number,
  coldC: number,
  referenceQ: number,
): MultilayerConductionResult => {
  const totalResistance = layers.reduce((total, layer) => total + layer.L / (layer.k * area), 0);
  const q = (hotC - coldC) / totalResistance;
  const totalLength = layers.reduce((total, layer) => total + layer.L, 0);
  const profile: ChartPoint[] = [{ label: '0.000', temperatura: hotC, x: 0 }];
  let position = 0;
  let temperature = hotC;

  layers.forEach((layer) => {
    const drop = q * (layer.L / (layer.k * area));
    position += layer.L;
    temperature -= drop;
    profile.push({
      label: position.toFixed(3),
      temperatura: temperature,
      x: position,
      capa: layer.name,
      fraccion: position / totalLength,
    });
  });

  const efficiency = referenceQ === 0 ? 0 : (1 - q / referenceQ) * 100;
  return { q, totalResistance, efficiency, profile };
};

/** Cilindro hueco: R = ln(ro/ri) / (2 π k L), L = longitud axial */
export const calculateCylinderConduction = (
  k: number,
  length: number,
  innerRadius: number,
  outerRadius: number,
  hotC: number,
  coldC: number,
): RadialConductionResult => {
  const resistance = Math.log(outerRadius / innerRadius) / (2 * Math.PI * k * length);
  const q = (hotC - coldC) / resistance;
  const meanArea = (2 * Math.PI * length * (outerRadius - innerRadius)) / Math.log(outerRadius / innerRadius);
  const heatFlux = q / meanArea;
  const profile = Array.from({ length: 21 }, (_, index) => {
    const r = innerRadius + ((outerRadius - innerRadius) * index) / 20;
    const temperature = hotC - (q * Math.log(r / innerRadius)) / (2 * Math.PI * k * length);
    return { label: r.toFixed(3), temperatura: temperature, x: r };
  });

  return { q, resistance, heatFlux, profile, geometry: 'cylinder' };
};

/** Esfera hueca: R = (1/ri - 1/ro) / (4 π k) */
export const calculateSphereConduction = (
  k: number,
  innerRadius: number,
  outerRadius: number,
  hotC: number,
  coldC: number,
): RadialConductionResult => {
  const resistance = (1 / innerRadius - 1 / outerRadius) / (4 * Math.PI * k);
  const q = (hotC - coldC) / resistance;
  const meanArea = 4 * Math.PI * innerRadius * outerRadius;
  const heatFlux = q / meanArea;
  const profile = Array.from({ length: 21 }, (_, index) => {
    const r = innerRadius + ((outerRadius - innerRadius) * index) / 20;
    const temperature = hotC - (q * (1 / innerRadius - 1 / r)) / (4 * Math.PI * k);
    return { label: r.toFixed(3), temperatura: temperature, x: r };
  });

  return { q, resistance, heatFlux, profile, geometry: 'sphere' };
};

export const RE_PLATE_TRANSITION = 5e5;
export const WIEN_DISPLACEMENT_UM_K = 2897.772;
export const STEEL_SOLID = { k: 16, rho: 7850, cp: 500, thickness: 0.005 } as const;
export const TYPICAL_AIR_H = 10;

export const reynoldsRegime = (re: number, geometry: ConvectionGeometry = 'plate'): ForcedConvectionResult['regime'] => {
  if (geometry === 'cylinder') {
    if (re < 20) return 'Laminar';
    if (re < 1e4) return 'Transición';
    return 'Turbulento';
  }
  if (re < RE_PLATE_TRANSITION) return 'Laminar';
  if (re < 1e7) return 'Transición';
  return 'Turbulento';
};

export const volumetricFlowRate = (velocity: number, area: number): number => velocity * area;

export const velocityFromFlowRate = (flowRate: number, area: number): number =>
  area > 0 ? flowRate / area : 0;

/** Churchill–Bernstein para cilindro en flujo cruzado (Re Pr > 0.2). */
export const churchillBernsteinNu = (re: number, pr: number): number => {
  const safeRe = Math.max(re, 1e-9);
  const safePr = Math.max(pr, 1e-9);
  const numerator = 0.62 * Math.pow(safeRe, 0.5) * Math.pow(safePr, 1 / 3);
  const denominator = Math.pow(1 + Math.pow(0.4 / safePr, 2 / 3), 0.25);
  const highRe = Math.pow(1 + Math.pow(safeRe / 282000, 5 / 8), 4 / 5);
  return 0.3 + (numerator / denominator) * highRe;
};

/** Placa plana: laminar o capa límite mixta (transición en Re = 5×10⁵). */
export const plateNusselt = (re: number, pr: number): number => {
  const pr13 = Math.pow(Math.max(pr, 1e-9), 1 / 3);
  if (re < RE_PLATE_TRANSITION) {
    return 0.664 * Math.pow(Math.max(re, 0), 0.5) * pr13;
  }
  return (0.037 * Math.pow(re, 0.8) - 871) * pr13;
};

export const calculateForcedConvection = (
  fluid: Fluid,
  velocity: number,
  length: number,
  area: number,
  surfaceC: number,
  fluidC: number,
  geometry: ConvectionGeometry = 'plate',
): ForcedConvectionResult => {
  const characteristicLength = length;
  const re = (fluid.rho * velocity * characteristicLength) / fluid.mu;
  const regime = reynoldsRegime(re, geometry);
  let nu: number;
  let validity: string;

  if (geometry === 'cylinder') {
    nu = churchillBernsteinNu(re, fluid.Pr);
    validity =
      re * fluid.Pr > 0.2
        ? 'Churchill–Bernstein para cilindro en flujo cruzado (Re·Pr > 0,2).'
        : 'Re·Pr < 0,2: la correlación de Churchill–Bernstein queda fuera de rango; resultado orientativo.';
  } else {
    nu = plateNusselt(re, fluid.Pr);
    validity =
      regime === 'Laminar'
        ? 'Capa límite laminar en placa plana (Re < 5×10⁵): Nu = 0,664 Re½ Pr⅓.'
        : 'Capa límite mixta en placa (transición en 5×10⁵): Nu = (0,037 Re⁰·⁸ − 871) Pr⅓.';
  }

  const h = characteristicLength > 0 ? (nu * fluid.k) / characteristicLength : 0;
  const q = h * area * (surfaceC - fluidC);
  const flowRate = volumetricFlowRate(velocity, area);

  return { q, re, nu, h, pr: fluid.Pr, flowRate, regime, validity, geometry };
};

export const calculateNaturalConvectionAir = (
  air: Fluid,
  length: number,
  area: number,
  surfaceC: number,
  fluidC: number,
): NaturalConvectionResult => {
  const cpAir = 1005;
  const filmK = toKelvin((surfaceC + fluidC) / 2);
  const beta = 1 / filmK;
  const nuKinematic = air.mu / air.rho;
  const alpha = air.k / (air.rho * cpAir);
  const deltaT = surfaceC - fluidC;
  const ra = (9.81 * beta * Math.abs(deltaT) * Math.pow(length, 3)) / (nuKinematic * alpha);
  const nu = 0.59 * Math.pow(ra, 0.25);
  const h = (nu * air.k) / length;
  const q = h * area * deltaT;
  const validity =
    ra >= 1e4 && ra <= 1e9
      ? 'Correlación natural válida para 10⁴ < Ra < 10⁹.'
      : 'Ra fuera del rango recomendado (10⁴ a 10⁹); resultado orientativo.';

  return { q, ra, nu, h, pr: air.Pr, validity };
};

export const generateCoolingProfile = (
  initialC: number,
  fluidC: number,
  h: number,
  area: number,
  durationSeconds = 600,
): ChartPoint[] => {
  const mass = STEEL_SOLID.rho * area * STEEL_SOLID.thickness;
  const capacitance = Math.max(mass * STEEL_SOLID.cp, 1);

  return Array.from({ length: 21 }, (_, index) => {
    const time = (durationSeconds * index) / 20;
    const temperature = fluidC + (initialC - fluidC) * Math.exp((-h * area * time) / capacitance);
    return { label: `${Math.round(time)} s`, temperatura: temperature, tiempo: time };
  });
};

export const coolingBiot = (h: number): number =>
  biotNumber(h, STEEL_SOLID.thickness / 2, STEEL_SOLID.k);

export const calculateRadiation = (
  epsilon: number,
  area: number,
  surfaceC: number,
  ambientC: number,
): RadiationResult => {
  const surfaceK = toKelvin(surfaceC);
  const ambientK = toKelvin(ambientC);
  const blackbodyPower = SIGMA * Math.pow(surfaceK, 4);
  const emittedPower = epsilon * blackbodyPower;
  const absorbedPower = epsilon * SIGMA * Math.pow(ambientK, 4);
  const netFlux = emittedPower - absorbedPower;
  const q = netFlux * area;
  return { q, blackbodyPower, emittedPower, absorbedPower, netFlux };
};

export const generateRadiationTemperatureCurve = (
  ambientC: number,
  area: number,
  emissivities: number[],
  minC = 100,
  maxC = 500,
): ChartPoint[] => {
  return Array.from({ length: 17 }, (_, index) => {
    const temperature = minC + ((maxC - minC) * index) / 16;
    const point: ChartPoint = { label: `${Math.round(temperature)} C`, temperatura: temperature };
    emissivities.forEach((epsilon) => {
      point[`e${String(epsilon).replace('.', '_')}`] = calculateRadiation(
        epsilon,
        area,
        temperature,
        ambientC,
      ).q;
    });
    return point;
  });
};

export const generateEmissivityCurve = (
  area: number,
  surfaceC: number,
  ambientC: number,
): ChartPoint[] =>
  Array.from({ length: 11 }, (_, index) => {
    const epsilon = index / 10;
    return {
      label: epsilon.toFixed(1),
      emisividad: epsilon,
      q: calculateRadiation(epsilon, area, surfaceC, ambientC).q,
    };
  });

export const wienPeakWavelengthUm = (temperatureC: number): number => {
  const kelvin = toKelvin(temperatureC);
  return kelvin > 0 ? WIEN_DISPLACEMENT_UM_K / kelvin : Number.POSITIVE_INFINITY;
};

export const linearizedRadiationCoefficient = (
  epsilon: number,
  surfaceC: number,
  ambientC: number,
): number => {
  const surfaceK = toKelvin(surfaceC);
  const ambientK = toKelvin(ambientC);
  return epsilon * SIGMA * (surfaceK ** 2 + ambientK ** 2) * (surfaceK + ambientK);
};

export const criticalInsulationRadius = (k: number, h: number): number =>
  h > 0 ? k / h : Number.POSITIVE_INFINITY;

export const insulationEffect = (
  outerRadius: number,
  criticalRadius: number,
): 'aumenta-perdida' | 'reduce-perdida' | 'critico' => {
  if (!Number.isFinite(criticalRadius)) return 'reduce-perdida';
  if (Math.abs(outerRadius - criticalRadius) < 1e-6) return 'critico';
  return outerRadius < criticalRadius ? 'aumenta-perdida' : 'reduce-perdida';
};

export const biotNumber = (h: number, characteristicLength: number, solidK: number): number =>
  solidK > 0 ? (h * characteristicLength) / solidK : Number.POSITIVE_INFINITY;

export const fourierNumber = (alpha: number, time: number, characteristicLength: number): number =>
  characteristicLength > 0 ? (alpha * time) / characteristicLength ** 2 : 0;

export const overallUFlat = (k: number, length: number, hInner: number, hOuter: number): number => {
  const resistance = 1 / Math.max(hInner, 1e-12) + length / Math.max(k, 1e-12) + 1 / Math.max(hOuter, 1e-12);
  return 1 / resistance;
};

export const heatFlux = (q: number, area: number): number => (area > 0 ? q / area : 0);

export const temperatureGradientWarning = (hotC: number, coldC: number): string | null =>
  hotC === coldC
    ? 'Sin diferencia de temperatura no hay flujo de calor.'
    : hotC < coldC
      ? 'T_caliente < T_fría: el calor fluye en sentido inverso (Q negativo).'
      : null;

export const lumpedCapacitanceValid = (bi: number): boolean => bi < 0.1;
