import { useEffect, useMemo, useState } from 'react';
import { Box, Circle, Cylinder, Layers, Save } from 'lucide-react';
import { ComparisonBarChart } from '../../components/charts/ComparisonBarChart';
import { TemperatureProfileChart } from '../../components/charts/TemperatureProfileChart';
import { ThermalDiagram } from '../../components/charts/ThermalDiagram';
import { Card } from '../../components/ui/Card';
import { CsvExportButton } from '../../components/ui/CsvExportButton';
import { ExportButton } from '../../components/ui/ExportButton';
import { FormulaDisplay } from '../../components/ui/FormulaDisplay';
import { InsightCard } from '../../components/ui/InsightCard';
import { ModuleShell } from '../../components/ui/ModuleShell';
import { PracticeBanner } from '../../components/ui/PracticeBanner';
import { PrintReportButton } from '../../components/ui/PrintReportButton';
import { ResultCard } from '../../components/ui/ResultCard';
import { SliderInput } from '../../components/ui/SliderInput';
import { WarningBanner } from '../../components/ui/WarningBanner';
import {
  calculateCylinderConduction,
  calculateFlatConduction,
  calculateMultilayerConduction,
  calculateSphereConduction,
  criticalInsulationRadius,
  formatNumber,
  insulationEffect,
  overallUFlat,
  temperatureGradientWarning,
  TYPICAL_AIR_H,
  validateCelsius,
  validatePositive,
  validateRadii,
  type ConductionGeometry,
  type Layer,
} from '../../lib/calculations';
import { getMaterial, MATERIALS } from '../../lib/materials';
import {
  INPUT_ERROR,
  INVALID,
  inputClass,
  kelvinHint,
  numberFrom,
  selectClass,
  stringFrom,
} from '../../lib/moduleHelpers';
import type { NewSimulation, SavedSimulation } from '../../types';
import { CYLINDER_PRACTICE } from './PracticeCylinder';
import { FLAT_PRACTICE } from './PracticeFlat';
import { MULTILAYER_PRACTICE } from './PracticeMultilayer';
import { SPHERE_PRACTICE } from './PracticeSphere';

interface ConductionModuleProps {
  loadedSimulation: SavedSimulation | null;
  onLoaded: () => void;
  onSave: (simulation: NewSimulation) => void;
}

type Mode = 'flat' | 'multilayer' | 'cylinder' | 'sphere';

const comparisonIds = ['copper', 'brick', 'fiberglass', 'polyurethane'];

const modeToGeometry = (mode: Mode): ConductionGeometry => {
  if (mode === 'cylinder') return 'cylinder';
  if (mode === 'sphere') return 'sphere';
  return 'flat';
};

export function ConductionModule({ loadedSimulation, onLoaded, onSave }: ConductionModuleProps) {
  const [mode, setMode] = useState<Mode>('flat');
  const [practice, setPractice] = useState(FLAT_PRACTICE.name);
  const [simulationName, setSimulationName] = useState('Conducción — pared plana');
  const [materialId, setMaterialId] = useState(FLAT_PRACTICE.materialId);
  const [length, setLength] = useState(FLAT_PRACTICE.length);
  const [area, setArea] = useState(FLAT_PRACTICE.area);
  const [hotC, setHotC] = useState(FLAT_PRACTICE.hotC);
  const [coldC, setColdC] = useState(FLAT_PRACTICE.coldC);
  const [innerRadius, setInnerRadius] = useState(CYLINDER_PRACTICE.innerRadius);
  const [outerRadius, setOuterRadius] = useState(CYLINDER_PRACTICE.outerRadius);
  const [axialLength, setAxialLength] = useState(CYLINDER_PRACTICE.length);
  const [layers, setLayers] = useState<Layer[]>(MULTILAYER_PRACTICE.layers);
  const [filmH, setFilmH] = useState(TYPICAL_AIR_H);

  useEffect(() => {
    if (loadedSimulation?.module !== 'conduction') return;
    const loadedMode = stringFrom(loadedSimulation.parameters.mode, 'flat') as Mode;
    setMode(['flat', 'multilayer', 'cylinder', 'sphere'].includes(loadedMode) ? loadedMode : 'flat');
    setPractice(loadedSimulation.practice);
    setSimulationName(loadedSimulation.name);
    setMaterialId(stringFrom(loadedSimulation.parameters.materialId, FLAT_PRACTICE.materialId));
    setLength(numberFrom(loadedSimulation.parameters.length, FLAT_PRACTICE.length));
    setArea(numberFrom(loadedSimulation.parameters.area, FLAT_PRACTICE.area));
    setHotC(numberFrom(loadedSimulation.parameters.hotC, FLAT_PRACTICE.hotC));
    setColdC(numberFrom(loadedSimulation.parameters.coldC, FLAT_PRACTICE.coldC));
    setInnerRadius(numberFrom(loadedSimulation.parameters.innerRadius, CYLINDER_PRACTICE.innerRadius));
    setOuterRadius(numberFrom(loadedSimulation.parameters.outerRadius, CYLINDER_PRACTICE.outerRadius));
    setAxialLength(numberFrom(loadedSimulation.parameters.axialLength, CYLINDER_PRACTICE.length));
    setLayers((current) =>
      current.map((layer, index) => ({
        ...layer,
        L: numberFrom(loadedSimulation.parameters[`layer${index + 1}L`], layer.L),
      })),
    );
    setFilmH(numberFrom(loadedSimulation.parameters.filmH, TYPICAL_AIR_H));
    onLoaded();
  }, [loadedSimulation, onLoaded]);

  const material = getMaterial(materialId);
  const errors = [
    validateCelsius('Temperatura caliente', hotC),
    validateCelsius('Temperatura fría', coldC),
    ...(mode === 'flat' || mode === 'multilayer'
      ? [
          validatePositive('Área', area),
          validatePositive('h de película', filmH),
          ...(mode === 'flat'
            ? [validatePositive('Espesor', length), validatePositive('Conductividad', material.k)]
            : []),
          ...(mode === 'multilayer' ? layers.map((layer) => validatePositive(`Espesor ${layer.name}`, layer.L)) : []),
        ]
      : [
          validatePositive('Conductividad', material.k),
          validatePositive('Radio interior', innerRadius),
          validatePositive('Radio exterior', outerRadius),
          validateRadii(innerRadius, outerRadius),
          ...(mode === 'cylinder' ? [validatePositive('Longitud axial', axialLength), validatePositive('h exterior', filmH)] : []),
        ]),
  ].filter((message): message is string => Boolean(message));

  const flatResult = useMemo(
    () => (errors.length === 0 && mode === 'flat' ? calculateFlatConduction(material.k, area, length, hotC, coldC) : null),
    [area, coldC, errors.length, hotC, length, material.k, mode],
  );

  const referenceQ = useMemo(
    () => (errors.length === 0 ? calculateFlatConduction(0.72, area, 0.2, hotC, coldC).q : 0),
    [area, coldC, errors.length, hotC],
  );

  const multilayerResult = useMemo(
    () =>
      errors.length === 0 && mode === 'multilayer'
        ? calculateMultilayerConduction(layers, area, hotC, coldC, referenceQ)
        : null,
    [area, coldC, errors.length, hotC, layers, mode, referenceQ],
  );

  const cylinderResult = useMemo(
    () =>
      errors.length === 0 && mode === 'cylinder'
        ? calculateCylinderConduction(material.k, axialLength, innerRadius, outerRadius, hotC, coldC)
        : null,
    [axialLength, coldC, errors.length, hotC, innerRadius, material.k, mode, outerRadius],
  );

  const sphereResult = useMemo(
    () =>
      errors.length === 0 && mode === 'sphere'
        ? calculateSphereConduction(material.k, innerRadius, outerRadius, hotC, coldC)
        : null,
    [coldC, errors.length, hotC, innerRadius, material.k, mode, outerRadius],
  );

  const gradientWarning = temperatureGradientWarning(hotC, coldC);
  const practiceMeta =
    mode === 'flat'
      ? FLAT_PRACTICE
      : mode === 'multilayer'
        ? MULTILAYER_PRACTICE
        : mode === 'cylinder'
          ? CYLINDER_PRACTICE
          : SPHERE_PRACTICE;

  const wallU =
    mode === 'flat' && errors.length === 0 ? overallUFlat(material.k, length, filmH, filmH) : null;
  const rCritical = mode === 'cylinder' ? criticalInsulationRadius(material.k, filmH) : null;
  const insulationHint =
    rCritical !== null ? insulationEffect(outerRadius, rCritical) : null;

  const qValue =
    mode === 'flat'
      ? flatResult?.q ?? 0
      : mode === 'multilayer'
        ? multilayerResult?.q ?? 0
        : mode === 'cylinder'
          ? cylinderResult?.q ?? 0
          : sphereResult?.q ?? 0;

  const resistanceValue =
    mode === 'flat'
      ? flatResult?.resistance ?? 0
      : mode === 'multilayer'
        ? multilayerResult?.totalResistance ?? 0
        : mode === 'cylinder'
          ? cylinderResult?.resistance ?? 0
          : sphereResult?.resistance ?? 0;

  const profile =
    mode === 'flat'
      ? flatResult?.profile ?? []
      : mode === 'multilayer'
        ? multilayerResult?.profile ?? []
        : mode === 'cylinder'
          ? cylinderResult?.profile ?? []
          : sphereResult?.profile ?? [];

  const comparisonData = useMemo(() => {
    if (errors.length > 0) return [];
    return comparisonIds.map((id) => {
      const item = getMaterial(id);
      if (mode === 'cylinder') {
        return {
          label: item.name,
          q: calculateCylinderConduction(item.k, axialLength, innerRadius, outerRadius, hotC, coldC).q,
        };
      }
      if (mode === 'sphere') {
        return {
          label: item.name,
          q: calculateSphereConduction(item.k, innerRadius, outerRadius, hotC, coldC).q,
        };
      }
      return {
        label: item.name,
        q: calculateFlatConduction(item.k, area, length, hotC, coldC).q,
      };
    });
  }, [area, axialLength, coldC, errors.length, hotC, innerRadius, length, mode, outerRadius]);

  const loadFlatPractice = () => {
    setMode('flat');
    setPractice(FLAT_PRACTICE.name);
    setSimulationName('Conducción — pared de ladrillo');
    setMaterialId(FLAT_PRACTICE.materialId);
    setLength(FLAT_PRACTICE.length);
    setArea(FLAT_PRACTICE.area);
    setHotC(FLAT_PRACTICE.hotC);
    setColdC(FLAT_PRACTICE.coldC);
  };

  const loadMultilayerPractice = () => {
    setMode('multilayer');
    setPractice(MULTILAYER_PRACTICE.name);
    setSimulationName('Conducción — aislamiento multicapa');
    setArea(MULTILAYER_PRACTICE.area);
    setHotC(MULTILAYER_PRACTICE.hotC);
    setColdC(MULTILAYER_PRACTICE.coldC);
    setLayers(MULTILAYER_PRACTICE.layers);
  };

  const loadCylinderPractice = () => {
    setMode('cylinder');
    setPractice(CYLINDER_PRACTICE.name);
    setSimulationName('Conducción — cilindro hueco');
    setMaterialId(CYLINDER_PRACTICE.materialId);
    setAxialLength(CYLINDER_PRACTICE.length);
    setInnerRadius(CYLINDER_PRACTICE.innerRadius);
    setOuterRadius(CYLINDER_PRACTICE.outerRadius);
    setHotC(CYLINDER_PRACTICE.hotC);
    setColdC(CYLINDER_PRACTICE.coldC);
  };

  const loadSpherePractice = () => {
    setMode('sphere');
    setPractice(SPHERE_PRACTICE.name);
    setSimulationName('Conducción — esfera hueca');
    setMaterialId(SPHERE_PRACTICE.materialId);
    setInnerRadius(SPHERE_PRACTICE.innerRadius);
    setOuterRadius(SPHERE_PRACTICE.outerRadius);
    setHotC(SPHERE_PRACTICE.hotC);
    setColdC(SPHERE_PRACTICE.coldC);
  };

  const updateLayerLength = (index: number, value: number) => {
    setLayers((current) => current.map((layer, layerIndex) => (layerIndex === index ? { ...layer, L: value } : layer)));
  };

  const exportData = {
    name: simulationName,
    module: 'conduction' as const,
    practice,
    parameters: {
      mode,
      materialId,
      k: material.k,
      length,
      area,
      hotC,
      coldC,
      innerRadius,
      outerRadius,
      axialLength,
      layer1L: layers[0]?.L ?? null,
      layer2L: layers[1]?.L ?? null,
      layer3L: layers[2]?.L ?? null,
      filmH,
    },
    results: {
      q: qValue,
      resistance: resistanceValue,
      efficiency: mode === 'multilayer' ? multilayerResult?.efficiency ?? null : null,
      heatFlux:
        mode === 'flat'
          ? flatResult?.heatFlux ?? null
          : mode === 'cylinder'
            ? cylinderResult?.heatFlux ?? null
            : mode === 'sphere'
              ? sphereResult?.heatFlux ?? null
              : null,
      overallU: wallU,
      rCritical,
    },
  };

  const formulaBlock =
    mode === 'flat'
      ? {
          title: 'Pared plana simple',
          formula: 'Q = (k · A · (T_caliente − T_fría)) / L',
          substituted: `Q = (${formatNumber(material.k)} · ${formatNumber(area)} · (${formatNumber(hotC)} − ${formatNumber(coldC)})) / ${formatNumber(length)} = ${errors.length ? 'valores no válidos' : `${formatNumber(qValue, 2)} W`}`,
          note: 'Con los valores de la práctica 1, la fórmula produce 432 W.',
        }
      : mode === 'multilayer'
        ? {
            title: 'Pared multicapa',
            formula: 'R_total = Σ(L_i / (k_i · A)); Q = (T_caliente − T_fría) / R_total',
            substituted: `R_total = ${formatNumber(resistanceValue, 4)} K/W; Q = ${errors.length ? 'valores no válidos' : `${formatNumber(qValue, 2)} W`}`,
            note: 'Las capas en serie suman sus resistencias térmicas.',
          }
        : mode === 'cylinder'
          ? {
              title: 'Cilindro hueco',
              formula: 'R = ln(r_o / r_i) / (2 π k L); Q = ΔT / R',
              substituted: `R = ln(${formatNumber(outerRadius)} / ${formatNumber(innerRadius)}) / (2π · ${formatNumber(material.k)} · ${formatNumber(axialLength)}) = ${formatNumber(resistanceValue, 5)} K/W; Q = ${errors.length ? 'valores no válidos' : `${formatNumber(qValue, 2)} W`}`,
              note: 'La resistencia crece con el logaritmo del cociente de radios.',
            }
          : {
              title: 'Esfera hueca',
              formula: 'R = (1/r_i − 1/r_o) / (4 π k); Q = ΔT / R',
              substituted: `R = (1/${formatNumber(innerRadius)} − 1/${formatNumber(outerRadius)}) / (4π · ${formatNumber(material.k)}) = ${formatNumber(resistanceValue, 5)} K/W; Q = ${errors.length ? 'valores no válidos' : `${formatNumber(qValue, 2)} W`}`,
              note: 'En esferas la resistencia depende solo de los radios y de k.',
            };

  const saveActiveSimulation = () => {
    onSave({
      name: simulationName.trim() || 'Simulación de conducción',
      module: 'conduction',
      practice,
      parameters: exportData.parameters,
      results: exportData.results,
    });
  };

  const modeButtons: Array<{ id: Mode; label: string }> = [
    { id: 'flat', label: 'Plana' },
    { id: 'multilayer', label: 'Multicapa' },
    { id: 'cylinder', label: 'Cilindro' },
    { id: 'sphere', label: 'Esfera' },
  ];

  return (
    <ModuleShell
      badge="Ley de Fourier"
      badgeTone="warm"
      title="Módulo de conducción"
      description="Pared plana, multicapa, cilindro y esfera: resistencias térmicas, perfiles de temperatura y comparación de materiales."
      practices={[
        { label: 'Práctica 1', onClick: loadFlatPractice, icon: <Box size={16} aria-hidden="true" />, tone: 'warm' },
        { label: 'Práctica 2', onClick: loadMultilayerPractice, icon: <Layers size={16} aria-hidden="true" />, tone: 'cold' },
        { label: 'Cilindro', onClick: loadCylinderPractice, icon: <Cylinder size={16} aria-hidden="true" />, tone: 'warm' },
        { label: 'Esfera', onClick: loadSpherePractice, icon: <Circle size={16} aria-hidden="true" />, tone: 'rad' },
      ]}
    >
      <PracticeBanner name={practiceMeta.name} objective={practiceMeta.objective} />
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

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {modeButtons.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`min-h-10 rounded-lg px-2 text-xs font-bold transition sm:text-sm ${
                    mode === item.id
                      ? 'bg-orange-400/20 text-orange-100 ring-1 ring-orange-300/50'
                      : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {(mode === 'flat' || mode === 'cylinder' || mode === 'sphere') && (
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Material</span>
                <select className={selectClass} value={materialId} onChange={(event) => setMaterialId(event.target.value)}>
                  {MATERIALS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — k={item.k} W/m·K
                    </option>
                  ))}
                </select>
              </label>
            )}

            {mode === 'flat' && (
              <SliderInput
                label="Espesor (L)"
                value={length}
                min={0.005}
                max={1}
                step={0.005}
                unit="m"
                onChange={setLength}
                error={validatePositive('Espesor', length)}
              />
            )}

            {mode === 'multilayer' && (
              <div className="space-y-3 rounded-lg border border-slate-700/70 p-3">
                <p className="text-sm font-bold text-slate-100">Capas en serie</p>
                {layers.map((layer, index) => (
                  <SliderInput
                    key={layer.name}
                    label={`${layer.name} (k=${layer.k} W/m·K)`}
                    value={layer.L}
                    min={0.005}
                    max={0.3}
                    step={0.005}
                    unit="m"
                    onChange={(value) => updateLayerLength(index, value)}
                    error={validatePositive(`Espesor ${layer.name}`, layer.L)}
                  />
                ))}
              </div>
            )}

            {(mode === 'cylinder' || mode === 'sphere') && (
              <>
                <SliderInput
                  label="Radio interior (rᵢ)"
                  value={innerRadius}
                  min={0.005}
                  max={0.5}
                  step={0.001}
                  unit="m"
                  onChange={setInnerRadius}
                  error={validatePositive('Radio interior', innerRadius) ?? validateRadii(innerRadius, outerRadius)}
                />
                <SliderInput
                  label="Radio exterior (rₒ)"
                  value={outerRadius}
                  min={0.01}
                  max={0.8}
                  step={0.001}
                  unit="m"
                  onChange={setOuterRadius}
                  error={validatePositive('Radio exterior', outerRadius) ?? validateRadii(innerRadius, outerRadius)}
                />
              </>
            )}

            {mode === 'cylinder' && (
              <>
                <SliderInput
                  label="Longitud axial (L)"
                  value={axialLength}
                  min={0.1}
                  max={10}
                  step={0.05}
                  unit="m"
                  onChange={setAxialLength}
                  error={validatePositive('Longitud axial', axialLength)}
                />
                <SliderInput
                  label="h exterior (aire)"
                  value={filmH}
                  min={1}
                  max={100}
                  step={0.5}
                  unit="W/m²·K"
                  onChange={setFilmH}
                  error={validatePositive('h exterior', filmH)}
                  hint="Para el radio crítico r_cr = k / h"
                />
              </>
            )}

            {(mode === 'flat' || mode === 'multilayer') && (
              <SliderInput
                label="h de película (ambos lados)"
                value={filmH}
                min={1}
                max={100}
                step={0.5}
                unit="W/m²·K"
                onChange={setFilmH}
                error={validatePositive('h de película', filmH)}
                hint="Para el coeficiente global U con convección"
              />
            )}

            {(mode === 'flat' || mode === 'multilayer') && (
              <SliderInput
                label="Área (A)"
                value={area}
                min={0.01}
                max={30}
                step={0.01}
                unit="m²"
                onChange={setArea}
                error={validatePositive('Área', area)}
              />
            )}

            <SliderInput
              label="Temperatura caliente"
              value={hotC}
              min={-50}
              max={500}
              step={1}
              unit="°C"
              onChange={setHotC}
              error={validateCelsius('Temperatura caliente', hotC)}
              hint={kelvinHint(hotC)}
            />
            <SliderInput
              label="Temperatura fría"
              value={coldC}
              min={-50}
              max={300}
              step={1}
              unit="°C"
              onChange={setColdC}
              error={validateCelsius('Temperatura fría', coldC)}
              hint={kelvinHint(coldC)}
            />

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={saveActiveSimulation}
                disabled={errors.length > 0}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-orange-300/40 bg-orange-500/18 px-3 py-2 text-sm font-semibold text-orange-100 transition hover:bg-orange-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save size={16} aria-hidden="true" />
                Guardar
              </button>
              <ExportButton filename="thermalab-conduccion.json" data={exportData} />
              <CsvExportButton
                filename="thermalab-conduccion.csv"
                records={[{ ...exportData.parameters, ...exportData.results, name: simulationName, practice }]}
              />
              <PrintReportButton
                title={simulationName}
                module="Conducción"
                practice={practice}
                parameters={exportData.parameters}
                results={exportData.results}
                formula={formulaBlock.formula}
                substituted={formulaBlock.substituted}
                interpretation={formulaBlock.note}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <WarningBanner message={gradientWarning} />
          <ThermalDiagram
            type="conduction"
            conduction={{
              hotC,
              coldC,
              q: errors.length ? 0 : qValue,
              length:
                mode === 'flat'
                  ? length
                  : mode === 'multilayer'
                    ? layers.reduce((total, layer) => total + layer.L, 0)
                    : mode === 'cylinder'
                      ? axialLength
                      : outerRadius - innerRadius,
              geometry: modeToGeometry(mode),
              innerRadius,
              outerRadius,
              layers: mode === 'multilayer' ? layers : undefined,
            }}
          />
          <div className={`grid gap-4 ${mode === 'multilayer' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            <ResultCard
              label="Calor transferido (Q)"
              value={errors.length ? INVALID : formatNumber(qValue, 2)}
              unit={errors.length ? undefined : 'W'}
              tone="warm"
              interpretation={
                errors.length
                  ? INPUT_ERROR
                  : `Equivale a ${formatNumber(Math.abs(qValue) / 1000, 3)} kW de potencia térmica.`
              }
            />
            <ResultCard
              label="Resistencia térmica (R)"
              value={errors.length ? INVALID : formatNumber(resistanceValue, 5)}
              unit={errors.length ? undefined : 'K/W'}
              tone="cold"
              interpretation="Si la pared frena más el calor, se transfiere menos con la misma diferencia de temperatura."
            />
            {mode === 'multilayer' && (
              <ResultCard
                label="Aislamiento"
                value={multilayerResult ? formatNumber(multilayerResult.efficiency, 2) : INVALID}
                unit={multilayerResult ? '%' : undefined}
                tone="rad"
                interpretation="Porcentaje de calor que deja de perderse al agregar aislamiento (respecto al ladrillo solo)."
              />
            )}
          </div>
          {mode === 'flat' && wallU !== null && (
            <InsightCard
              title="Coeficiente global U"
              value={formatNumber(wallU, 3)}
              unit="W/m²·K"
              note={`Pared + convección a ambos lados (h = ${formatNumber(filmH, 1)}). Q_U = U·A·ΔT = ${formatNumber(wallU * area * (hotC - coldC), 2)} W.`}
            />
          )}
          {mode === 'cylinder' && rCritical !== null && (
            <InsightCard
              title="Radio crítico de aislamiento"
              value={formatNumber(rCritical, 4)}
              unit="m"
              note={
                insulationHint === 'aumenta-perdida'
                  ? `r_o < r_cr: añadir aislante todavía aumenta la pérdida (más área).`
                  : insulationHint === 'critico'
                    ? 'Estás en el radio crítico: la pérdida es máxima.'
                    : 'r_o > r_cr: el aislamiento ya reduce la pérdida de calor.'
              }
            />
          )}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card
          title="Perfil de temperatura"
          subtitle={mode === 'cylinder' || mode === 'sphere' ? 'Temperatura vs radio' : 'Temperatura a lo largo de la pared'}
        >
          <TemperatureProfileChart
            data={profile}
            series={[{ dataKey: 'temperatura', name: 'Temperatura', color: '#f97316' }]}
            xLabel={mode === 'cylinder' || mode === 'sphere' ? 'Radio r (m)' : 'Posición x (m)'}
            yLabel="Temperatura (°C)"
          />
        </Card>
        <Card title="Comparación entre materiales" subtitle="Misma geometría, distinta conductividad (k)">
          <ComparisonBarChart data={comparisonData} dataKey="q" name="Q (W)" color="#38bdf8" />
        </Card>
      </div>

      <Card title="Fórmula activa" subtitle={formulaBlock.note}>
        <FormulaDisplay
          title={formulaBlock.title}
          formula={formulaBlock.formula}
          substituted={formulaBlock.substituted}
          note={formulaBlock.note}
        />
      </Card>
    </ModuleShell>
  );
}
