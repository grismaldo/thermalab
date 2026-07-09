import { useEffect, useMemo, useState } from 'react';
import { Fan, Save, Wind } from 'lucide-react';
import { ComparisonBarChart } from '../../components/charts/ComparisonBarChart';
import { TemperatureProfileChart } from '../../components/charts/TemperatureProfileChart';
import { ThermalDiagram } from '../../components/charts/ThermalDiagram';
import { Card } from '../../components/ui/Card';
import { ExportButton } from '../../components/ui/ExportButton';
import { FormulaDisplay } from '../../components/ui/FormulaDisplay';
import { ModuleShell } from '../../components/ui/ModuleShell';
import { PrintReportButton } from '../../components/ui/PrintReportButton';
import { ResultCard } from '../../components/ui/ResultCard';
import { SliderInput } from '../../components/ui/SliderInput';
import {
  calculateForcedConvection,
  calculateNaturalConvectionAir,
  formatNumber,
  generateCoolingProfile,
  validateCelsius,
  validateNonNegative,
  validatePositive,
  velocityFromFlowRate,
  volumetricFlowRate,
  type ConvectionGeometry,
} from '../../lib/calculations';
import { FLUIDS, getFluid } from '../../lib/fluids';
import {
  INPUT_ERROR,
  INVALID,
  inputClass,
  numberFrom,
  selectClass,
  stringFrom,
} from '../../lib/moduleHelpers';
import type { NewSimulation, SavedSimulation } from '../../types';
import { COOLING_PRACTICE } from './PracticeCooling';
import { NATURAL_FORCED_PRACTICE } from './PracticeNaturalVsForced';

interface ConvectionModuleProps {
  loadedSimulation: SavedSimulation | null;
  onLoaded: () => void;
  onSave: (simulation: NewSimulation) => void;
}

export function ConvectionModule({ loadedSimulation, onLoaded, onSave }: ConvectionModuleProps) {
  const [practice, setPractice] = useState(COOLING_PRACTICE.name);
  const [simulationName, setSimulationName] = useState('Convección — placa metálica');
  const [fluidId, setFluidId] = useState(COOLING_PRACTICE.fluidId);
  const [geometry, setGeometry] = useState<ConvectionGeometry>('plate');
  const [velocity, setVelocity] = useState(COOLING_PRACTICE.velocity);
  const [length, setLength] = useState(COOLING_PRACTICE.length);
  const [area, setArea] = useState(COOLING_PRACTICE.area);
  const [surfaceC, setSurfaceC] = useState(COOLING_PRACTICE.surfaceC);
  const [fluidC, setFluidC] = useState(COOLING_PRACTICE.fluidC);
  const [flowInputMode, setFlowInputMode] = useState<'velocity' | 'flowRate'>('velocity');

  useEffect(() => {
    if (loadedSimulation?.module !== 'convection') return;
    setPractice(loadedSimulation.practice);
    setSimulationName(loadedSimulation.name);
    setFluidId(stringFrom(loadedSimulation.parameters.fluidId, COOLING_PRACTICE.fluidId));
    setGeometry(
      stringFrom(loadedSimulation.parameters.geometry, 'plate') === 'cylinder' ? 'cylinder' : 'plate',
    );
    setVelocity(numberFrom(loadedSimulation.parameters.velocity, COOLING_PRACTICE.velocity));
    setLength(numberFrom(loadedSimulation.parameters.length, COOLING_PRACTICE.length));
    setArea(numberFrom(loadedSimulation.parameters.area, COOLING_PRACTICE.area));
    setSurfaceC(numberFrom(loadedSimulation.parameters.surfaceC, COOLING_PRACTICE.surfaceC));
    setFluidC(numberFrom(loadedSimulation.parameters.fluidC, COOLING_PRACTICE.fluidC));
    onLoaded();
  }, [loadedSimulation, onLoaded]);

  const fluid = getFluid(fluidId);
  const air = getFluid('air');
  const flowRate = volumetricFlowRate(velocity, area);

  const errors = [
    validateNonNegative('Velocidad', velocity),
    validatePositive('Longitud característica', length),
    validatePositive('Área', area),
    validateCelsius('Temperatura superficial', surfaceC),
    validateCelsius('Temperatura del fluido', fluidC),
  ].filter((message): message is string => Boolean(message));

  const forcedResult = useMemo(
    () =>
      errors.length === 0
        ? calculateForcedConvection(fluid, velocity, length, area, surfaceC, fluidC, geometry)
        : null,
    [area, errors.length, fluid, fluidC, geometry, length, surfaceC, velocity],
  );

  const naturalResult = useMemo(
    () => (errors.length === 0 ? calculateNaturalConvectionAir(air, length, area, surfaceC, fluidC) : null),
    [air, area, errors.length, fluidC, length, surfaceC],
  );

  const coolingProfile = useMemo(
    () =>
      forcedResult ? generateCoolingProfile(surfaceC, fluidC, Math.max(forcedResult.h, 0.001), area) : [],
    [area, fluidC, forcedResult, surfaceC],
  );

  const comparisonData = useMemo(() => {
    if (errors.length > 0) return [];
    return ['air', 'water', 'ethanol', 'oil'].map((id) => {
      const item = getFluid(id);
      return {
        label: item.name,
        q: calculateForcedConvection(item, Math.max(velocity, 0.001), length, area, surfaceC, fluidC, geometry)
          .q,
      };
    });
  }, [area, errors.length, fluidC, geometry, length, surfaceC, velocity]);

  const loadCoolingPractice = () => {
    setPractice(COOLING_PRACTICE.name);
    setSimulationName('Convección — placa con aire');
    setGeometry('plate');
    setFluidId(COOLING_PRACTICE.fluidId);
    setVelocity(COOLING_PRACTICE.velocity);
    setLength(COOLING_PRACTICE.length);
    setArea(COOLING_PRACTICE.area);
    setSurfaceC(COOLING_PRACTICE.surfaceC);
    setFluidC(COOLING_PRACTICE.fluidC);
    setFlowInputMode('velocity');
  };

  const loadNaturalForcedPractice = () => {
    setPractice(NATURAL_FORCED_PRACTICE.name);
    setSimulationName('Convección — natural vs forzada');
    setGeometry('plate');
    setFluidId(NATURAL_FORCED_PRACTICE.fluidId);
    setVelocity(NATURAL_FORCED_PRACTICE.velocity);
    setLength(NATURAL_FORCED_PRACTICE.length);
    setArea(NATURAL_FORCED_PRACTICE.area);
    setSurfaceC(NATURAL_FORCED_PRACTICE.surfaceC);
    setFluidC(NATURAL_FORCED_PRACTICE.fluidC);
  };

  const handleFlowRateChange = (value: number) => {
    setVelocity(velocityFromFlowRate(value, area));
  };

  const forcedQ = forcedResult?.q ?? 0;
  const exportData = {
    name: simulationName,
    module: 'convection' as const,
    practice,
    parameters: {
      fluidId,
      geometry,
      velocity,
      flowRate,
      length,
      area,
      surfaceC,
      fluidC,
      rho: fluid.rho,
      mu: fluid.mu,
      Pr: fluid.Pr,
    },
    results: {
      q: forcedResult?.q ?? null,
      re: forcedResult?.re ?? null,
      nu: forcedResult?.nu ?? null,
      h: forcedResult?.h ?? null,
      pr: forcedResult?.pr ?? null,
      regime: forcedResult?.regime ?? null,
      naturalH: naturalResult?.h ?? null,
      naturalQ: naturalResult?.q ?? null,
      ra: naturalResult?.ra ?? null,
    },
  };

  const formula = {
    title: geometry === 'cylinder' ? 'Cilindro en flujo cruzado' : 'Convección forzada en placa plana',
    formula:
      'Re = (ρ · v · L) / μ; Nu = C · Reⁿ · Pr^(1/3); h = Nu · k / L; Q = h · A · (T_s − T_f); Qᵥ = v · A',
    substituted: `Re = ${formatNumber(forcedResult?.re ?? 0, 2)}; Nu = ${formatNumber(
      forcedResult?.nu ?? 0,
      2,
    )}; Pr = ${formatNumber(fluid.Pr, 3)}; h = ${formatNumber(forcedResult?.h ?? 0, 3)}; Qᵥ = ${formatNumber(
      flowRate,
      4,
    )} m³/s; Q = ${errors.length ? 'valores no válidos' : `${formatNumber(forcedQ, 2)} W`}`,
    note: forcedResult?.validity ?? 'Completa los valores para ver el cálculo.',
  };

  const saveActiveSimulation = () => {
    onSave({
      name: simulationName.trim() || 'Simulación de convección',
      module: 'convection',
      practice,
      parameters: exportData.parameters,
      results: exportData.results,
    });
  };

  return (
    <ModuleShell
      badge="Ley de Newton"
      badgeTone="cold"
      title="Módulo de convección"
      description="Placa o cilindro, caudal volumétrico, números de Reynolds, Nusselt y Prandtl, y comparación natural vs forzada."
      practices={[
        {
          label: 'Práctica 1',
          onClick: loadCoolingPractice,
          icon: <Wind size={16} aria-hidden="true" />,
          tone: 'cold',
        },
        {
          label: 'Práctica 2',
          onClick: loadNaturalForcedPractice,
          icon: <Fan size={16} aria-hidden="true" />,
          tone: 'warm',
        },
      ]}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]">
        <Card title="Variables de entrada" subtitle={practice}>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">Nombre de la simulación</span>
              <input
                className={inputClass}
                value={simulationName}
                onChange={(event) => setSimulationName(event.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGeometry('plate')}
                className={`min-h-10 rounded-lg px-3 text-sm font-bold transition ${
                  geometry === 'plate'
                    ? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-300/50'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Placa
              </button>
              <button
                type="button"
                onClick={() => setGeometry('cylinder')}
                className={`min-h-10 rounded-lg px-3 text-sm font-bold transition ${
                  geometry === 'cylinder'
                    ? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-300/50'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Cilindro
              </button>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-200">Fluido</span>
              <select className={selectClass} value={fluidId} onChange={(event) => setFluidId(event.target.value)}>
                {FLUIDS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — Pr={item.Pr}, k={item.k} W/m·K
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFlowInputMode('velocity')}
                className={`min-h-9 rounded-lg px-2 text-xs font-bold transition ${
                  flowInputMode === 'velocity'
                    ? 'bg-slate-700 text-slate-100 ring-1 ring-slate-500'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                Velocidad
              </button>
              <button
                type="button"
                onClick={() => setFlowInputMode('flowRate')}
                className={`min-h-9 rounded-lg px-2 text-xs font-bold transition ${
                  flowInputMode === 'flowRate'
                    ? 'bg-slate-700 text-slate-100 ring-1 ring-slate-500'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                Caudal Qᵥ
              </button>
            </div>

            {flowInputMode === 'velocity' ? (
              <SliderInput
                label="Velocidad del fluido"
                value={velocity}
                min={0}
                max={20}
                step={0.1}
                unit="m/s"
                onChange={setVelocity}
                error={validateNonNegative('Velocidad', velocity)}
              />
            ) : (
              <SliderInput
                label="Caudal volumétrico"
                value={flowRate}
                min={0}
                max={Math.max(area * 20, 0.1)}
                step={0.001}
                unit="m³/s"
                onChange={handleFlowRateChange}
                error={validateNonNegative('Caudal', flowRate)}
              />
            )}

            <p className="font-mono-num text-xs text-slate-400">
              {flowInputMode === 'velocity'
                ? `Qᵥ = v · A = ${formatNumber(flowRate, 4)} m³/s`
                : `v = Qᵥ / A = ${formatNumber(velocity, 3)} m/s`}
            </p>

            <SliderInput
              label={geometry === 'cylinder' ? 'Diámetro del cilindro (D)' : 'Tamaño de la placa (longitud)'}
              value={length}
              min={0.01}
              max={2}
              step={0.01}
              unit="m"
              onChange={setLength}
              error={validatePositive('Longitud característica', length)}
            />
            <SliderInput
              label={geometry === 'cylinder' ? 'Área de transferencia' : 'Área de la placa'}
              value={area}
              min={0.01}
              max={5}
              step={0.01}
              unit="m²"
              onChange={setArea}
              error={validatePositive('Área', area)}
            />
            <SliderInput
              label="Temperatura superficial"
              value={surfaceC}
              min={-50}
              max={600}
              step={1}
              unit="°C"
              onChange={setSurfaceC}
              error={validateCelsius('Temperatura superficial', surfaceC)}
            />
            <SliderInput
              label="Temperatura del fluido"
              value={fluidC}
              min={-50}
              max={300}
              step={1}
              unit="°C"
              onChange={setFluidC}
              error={validateCelsius('Temperatura del fluido', fluidC)}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={saveActiveSimulation}
                disabled={errors.length > 0}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-500/18 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save size={16} aria-hidden="true" />
                Guardar
              </button>
              <ExportButton filename="thermalab-conveccion.json" data={exportData} />
              <PrintReportButton
                title={simulationName}
                module="Convección"
                practice={practice}
                parameters={exportData.parameters}
                results={exportData.results}
                formula={formula.formula}
                substituted={formula.substituted}
                interpretation={formula.note}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <ThermalDiagram
            type="convection"
            convection={{
              surfaceC,
              fluidC,
              velocity,
              h: forcedResult?.h ?? 0,
              q: forcedResult?.q ?? 0,
              regime: forcedResult?.regime ?? 'Sin datos',
              geometry,
              flowRate,
            }}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ResultCard
              label="Calor transferido (Q)"
              value={errors.length ? INVALID : formatNumber(forcedQ, 2)}
              unit={errors.length ? undefined : 'W'}
              tone="cold"
              interpretation={
                errors.length
                  ? INPUT_ERROR
                  : `Esta tasa equivale a ${formatNumber(Math.abs(forcedQ) / 1000, 3)} kW hacia el fluido.`
              }
            />
            <ResultCard
              label="Coeficiente h"
              value={errors.length ? INVALID : formatNumber(forcedResult?.h ?? 0, 3)}
              unit={errors.length ? undefined : 'W/m²·K'}
              tone="warm"
              interpretation="Cuanto mayor es h, más rápido se transfiere el calor."
            />
            <ResultCard
              label="Prandtl (Pr)"
              value={formatNumber(fluid.Pr, 3)}
              tone="rad"
              interpretation="Relaciona viscosidad cinemática y difusividad térmica del fluido."
            />
            <ResultCard
              label="Régimen"
              value={errors.length ? INVALID : forcedResult?.regime ?? 'Sin datos'}
              tone="cold"
              interpretation={
                errors.length
                  ? INPUT_ERROR
                  : `Re = ${formatNumber(forcedResult?.re ?? 0, 2)} · Nu = ${formatNumber(forcedResult?.nu ?? 0, 2)}`
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Perfil de enfriamiento" subtitle="Estimación para placa de acero de 5 mm">
          <TemperatureProfileChart
            data={coolingProfile}
            series={[{ dataKey: 'temperatura', name: 'Temperatura', color: '#38bdf8' }]}
            xLabel="Tiempo"
            yLabel="Temperatura (°C)"
          />
        </Card>
        <Card title="Comparación entre fluidos" subtitle="Misma geometría, velocidad y temperaturas">
          <ComparisonBarChart data={comparisonData} dataKey="q" name="Q (W)" color="#f97316" />
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Natural vs forzada" subtitle="Correlación natural con aire y geometría vertical">
          <div className="grid gap-4 md:grid-cols-2">
            <ResultCard
              label="Sin ventilación (natural)"
              value={errors.length ? INVALID : formatNumber(naturalResult?.h ?? 0, 3)}
              unit={errors.length ? undefined : 'W/m²·K'}
              tone="cold"
              interpretation={naturalResult?.validity ?? 'Completa los valores para calcular.'}
            />
            <ResultCard
              label="Con ventilación (forzada)"
              value={errors.length ? INVALID : formatNumber(forcedResult?.h ?? 0, 3)}
              unit={errors.length ? undefined : 'W/m²·K'}
              tone="warm"
              interpretation={forcedResult?.validity ?? 'Completa los valores para calcular.'}
            />
          </div>
        </Card>
        <Card title="Fórmula activa" subtitle={practice}>
          <FormulaDisplay
            title={formula.title}
            formula={formula.formula}
            substituted={formula.substituted}
            note={formula.note}
          />
        </Card>
      </div>
    </ModuleShell>
  );
}
