import { describe, expect, it } from 'vitest';
import {
  biotNumber,
  calculateCylinderConduction,
  calculateFlatConduction,
  calculateForcedConvection,
  calculateMultilayerConduction,
  calculateNaturalConvectionAir,
  calculateRadiation,
  calculateSphereConduction,
  churchillBernsteinNu,
  coolingBiot,
  criticalInsulationRadius,
  insulationEffect,
  linearizedRadiationCoefficient,
  lumpedCapacitanceValid,
  overallUFlat,
  plateNusselt,
  SIGMA,
  temperatureGradientWarning,
  toKelvin,
  validateRadii,
  volumetricFlowRate,
  wienPeakWavelengthUm,
} from './calculations';
import type { Fluid } from '../types';

const air: Fluid = {
  id: 'air',
  name: 'Aire',
  rho: 1.184,
  mu: 1.849e-5,
  k: 0.02551,
  Pr: 0.7296,
};

describe('calculateFlatConduction', () => {
  it('reproduce el caso ladrillo de la práctica 1 (432 W)', () => {
    const result = calculateFlatConduction(0.72, 10, 0.2, 30, 18);
    expect(result.q).toBeCloseTo(432, 6);
    expect(result.resistance).toBeCloseTo(0.2 / (0.72 * 10), 8);
    expect(result.heatFlux).toBeCloseTo(43.2, 6);
    expect(result.profile).toHaveLength(21);
    expect(result.profile[0].temperatura).toBe(30);
    expect(result.profile[20].temperatura).toBeCloseTo(18, 6);
  });
});

describe('calculateMultilayerConduction', () => {
  it('suma resistencias en serie y reduce Q respecto a la referencia', () => {
    const layers = [
      { name: 'Ladrillo', k: 0.72, L: 0.2 },
      { name: 'Aislante', k: 0.04, L: 0.05 },
    ];
    const reference = calculateFlatConduction(0.72, 10, 0.2, 30, 18).q;
    const result = calculateMultilayerConduction(layers, 10, 30, 18, reference);
    expect(result.totalResistance).toBeGreaterThan(0.2 / (0.72 * 10));
    expect(result.q).toBeLessThan(reference);
    expect(result.efficiency).toBeGreaterThan(0);
    expect(result.profile.length).toBe(3);
  });
});

describe('radial conduction', () => {
  it('calcula cilindro hueco con R = ln(ro/ri)/(2πkL)', () => {
    const k = 15;
    const L = 2;
    const ri = 0.05;
    const ro = 0.08;
    const expectedR = Math.log(ro / ri) / (2 * Math.PI * k * L);
    const result = calculateCylinderConduction(k, L, ri, ro, 120, 40);
    expect(result.resistance).toBeCloseTo(expectedR, 10);
    expect(result.q).toBeCloseTo(80 / expectedR, 8);
    expect(result.geometry).toBe('cylinder');
  });

  it('calcula esfera hueca con R = (1/ri - 1/ro)/(4πk)', () => {
    const k = 0.72;
    const ri = 0.1;
    const ro = 0.15;
    const expectedR = (1 / ri - 1 / ro) / (4 * Math.PI * k);
    const result = calculateSphereConduction(k, ri, ro, 80, 25);
    expect(result.resistance).toBeCloseTo(expectedR, 10);
    expect(result.q).toBeCloseTo(55 / expectedR, 8);
    expect(result.geometry).toBe('sphere');
  });

  it('valida radios', () => {
    expect(validateRadii(0.05, 0.08)).toBeNull();
    expect(validateRadii(0.1, 0.1)).not.toBeNull();
  });
});

describe('convection', () => {
  it('calcula Re, Nu, h y caudal en placa', () => {
    const result = calculateForcedConvection(air, 2, 0.5, 0.25, 80, 25, 'plate');
    expect(result.re).toBeCloseTo((air.rho * 2 * 0.5) / air.mu, 6);
    expect(result.pr).toBe(air.Pr);
    expect(result.flowRate).toBeCloseTo(volumetricFlowRate(2, 0.25), 8);
    expect(result.h).toBeGreaterThan(0);
    expect(result.q).toBeCloseTo(result.h * 0.25 * 55, 6);
  });

  it('usa Churchill–Bernstein cuando geometry=cylinder', () => {
    const plate = calculateForcedConvection(air, 2, 0.05, 0.2, 80, 25, 'plate');
    const cylinder = calculateForcedConvection(air, 2, 0.05, 0.2, 80, 25, 'cylinder');
    expect(cylinder.geometry).toBe('cylinder');
    expect(cylinder.nu).not.toBe(plate.nu);
    expect(cylinder.nu).toBeCloseTo(churchillBernsteinNu(cylinder.re, air.Pr), 8);
  });

  it('usa capa límite mixta en placa cuando Re ≥ 5×10⁵', () => {
    const fast = calculateForcedConvection(air, 80, 0.5, 0.25, 80, 25, 'plate');
    expect(fast.re).toBeGreaterThan(5e5);
    expect(fast.nu).toBeCloseTo(plateNusselt(fast.re, air.Pr), 8);
    expect(fast.regime).not.toBe('Laminar');
  });

  it('calcula convección natural con Pr', () => {
    const result = calculateNaturalConvectionAir(air, 0.5, 0.25, 80, 25);
    expect(result.ra).toBeGreaterThan(0);
    expect(result.pr).toBe(air.Pr);
    expect(result.h).toBeGreaterThan(0);
  });
});

describe('radiation', () => {
  it('aplica Stefan-Boltzmann y balance energético', () => {
    const epsilon = 0.9;
    const area = 1;
    const surfaceC = 227;
    const ambientC = 27;
    const result = calculateRadiation(epsilon, area, surfaceC, ambientC);
    const Ts = toKelvin(surfaceC);
    const Ta = toKelvin(ambientC);
    expect(result.blackbodyPower).toBeCloseTo(SIGMA * Ts ** 4, 6);
    expect(result.emittedPower).toBeCloseTo(epsilon * SIGMA * Ts ** 4, 6);
    expect(result.absorbedPower).toBeCloseTo(epsilon * SIGMA * Ta ** 4, 6);
    expect(result.netFlux).toBeCloseTo(result.emittedPower - result.absorbedPower, 8);
    expect(result.q).toBeCloseTo(result.netFlux * area, 8);
  });

  it('calcula el pico de Wien y el coeficiente radiativo linealizado', () => {
    expect(wienPeakWavelengthUm(26.85)).toBeCloseTo(2897.772 / 300, 5);
    const hRad = linearizedRadiationCoefficient(0.9, 227, 27);
    const Ts = toKelvin(227);
    const Ta = toKelvin(27);
    expect(hRad).toBeCloseTo(0.9 * SIGMA * (Ts ** 2 + Ta ** 2) * (Ts + Ta), 8);
  });
});

describe('insights de laboratorio', () => {
  it('calcula radio crítico de aislamiento y el efecto sobre la pérdida', () => {
    const rCrit = criticalInsulationRadius(0.04, 10);
    expect(rCrit).toBeCloseTo(0.004, 10);
    expect(insulationEffect(0.003, rCrit)).toBe('aumenta-perdida');
    expect(insulationEffect(0.02, rCrit)).toBe('reduce-perdida');
  });

  it('calcula Biot, validez lumped y U global de pared plana', () => {
    expect(biotNumber(10, 0.0025, 16)).toBeCloseTo(0.0015625, 8);
    expect(lumpedCapacitanceValid(0.05)).toBe(true);
    expect(lumpedCapacitanceValid(0.2)).toBe(false);
    expect(coolingBiot(20)).toBeCloseTo(20 * 0.0025 / 16, 10);
    const u = overallUFlat(0.72, 0.2, 10, 10);
    expect(u).toBeCloseTo(1 / (0.1 + 0.2 / 0.72 + 0.1), 8);
  });

  it('advierte flujo inverso o nulo', () => {
    expect(temperatureGradientWarning(30, 18)).toBeNull();
    expect(temperatureGradientWarning(18, 30)).toMatch(/inverso/);
    expect(temperatureGradientWarning(20, 20)).toMatch(/diferencia/);
  });
});
