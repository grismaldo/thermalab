# ThermaLab — Auditoría de diseño (básica)

Fecha: 2026-07-17  
Alcance: UI/UX, layout, color, tipografía y diseño visual general.

## Resumen

ThermaLab tiene una base visual sólida para una consola educativa: tipografía propia (Rethink Sans + JetBrains Mono), tokens térmicos en OKLCH, diagramas SVG animados y navegación dual desktop/móvil. El producto se lee como laboratorio oscuro con acentos frío/calor/radiación. Los principales problemas son densidad de información en el dashboard, dependencia fuerte de tarjetas, contraste variable y un look genérico “dashboard dark” que compite con la marca.

## Fortalezas

- **Sistema de color temático:** frio (cyan), calor (naranja/rojo) y radiación (violeta) alineados con los tres mecanismos.
- **Tipografía con intención:** Rethink Sans para UI y JetBrains Mono para magnitudes — correcto para una herramienta científica.
- **Atmósfera:** gradientes radiales + rejilla sutil en `index.css` evitan un fondo plano.
- **Motion útil:** strip térmico animado, transiciones de vista (framer-motion), diagramas con flujo de calor; respeta `prefers-reduced-motion`.
- **Mobile:** bottom tab bar con targets ~58px; header sticky con blur.
- **Accesibilidad parcial:** `focus-visible`, `aria-current`, toasts con `aria-live`, iconos decorativos con `aria-hidden`.

## Hallazgos e mejoras

### 1. Dashboard sobrecargado (prioridad alta)

El primer viewport mezcla marca, CTAs, 3 stats, 3 pasos y 3 módulos. Compite con la marca y se siente como panel genérico.

**Mejora:** En la primera vista dejar solo marca + una frase + un CTA (o acceso a módulos). Mover stats/pasos más abajo o a una vista secundaria.

### 2. Uso excesivo de cards / paneles (prioridad media)

Casi todo vive en `lab-panel` / `Card` con borde + blur + glow. En un laboratorio interactivo tiene sentido para formularios y resultados, pero el hero y las listas de pasos no necesitan contenedor tipo tarjeta.

**Mejora:** Reservar paneles para controles e interacciones; dejar jerarquía tipográfica/espacio en contenido narrativo.

### 3. Branding débil fuera del nav (prioridad media)

El nombre “ThermaLab” aparece grande en el hero (bien), pero el resto del dashboard (stats + pasos + cards de módulo) podría pertenecer a cualquier lab app oscura si se quita el header.

**Mejora:** Reforzar identidad con un ancla visual real (diagrama térmico dominante, ilustración de pared/flujo) en el hero, no solo blurs abstractos.

### 4. Color: dark mode + glow + violet (prioridad baja–media)

El look se acerca a clichés de UI IA: dark slate, cyan glow, acento violeta en radiación. Funciona semánticamente, pero reduce diferenciación.

**Mejora:** Mantener semántica térmica, pero bajar glows; probar un acento radiativo menos “purple SaaS” (ámbar profundo o magenta desaturado) si se quiere más carácter propio.

### 5. Contraste y jerarquía tipográfica (prioridad media)

Mucho texto en `slate-400` / `slate-500` sobre fondos translúcidos. Los labels uppercase pequeños y el peso `font-black` en títulos crean un salto brusco.

**Mejora:** Subir contraste de body a ~slate-300; reducir `font-black` a `font-bold`/`extrabold` salvo marca; unificar escala (h1/h2/body/caption).

### 6. Layout de módulos densos (prioridad media)

Los módulos apilan sliders, selects, fórmulas, diagramas, charts y acciones de guardar/exportar en una columna larga. En móvil es usable; en desktop se pierde el “laboratorio” frente a un formulario largo.

**Mejora:** Layout de dos columnas en ≥lg: controles a la izquierda, diagrama + resultados sticky a la derecha.

### 7. Navegación móvil vs desktop (prioridad baja)

Desktop: iconos sin label hasta `lg`. Móvil: 5 tabs con labels truncados (`text-[11px]`).

**Mejora:** Labels cortos siempre visibles en desktop a partir de `md`; revisar truncado en tabs (p. ej. “Historial” → “Hist.” solo si hace falta).

### 8. Consistencia de componentes (prioridad baja)

`Card` usa `border-slate-700/50` + `shadow-glow`; `lab-panel` usa tokens CSS. Dos sistemas visuales paralelos.

**Mejora:** Unificar a tokens (`--thermal-*`) y una sola clase de superficie.

### 9. Controles de formulario (prioridad baja)

Sliders con `accent-cyan-400` nativo; el look varía por navegador. Errores en `orange-200` pueden confundirse con el tono “calor”.

**Mejora:** Slider custom o estilos webkit/moz; errores en rojo semántico (`red-300`) distinto del warm térmico.

### 10. Footer / crédito (prioridad baja)

El crédito del desarrollador está solo en una card del dashboard; el footer no lo menciona.

**Mejora:** Incluir “Grismaldo Bone” también en el footer para consistencia de atribución.

## Priorización sugerida

| Prioridad | Acción |
|-----------|--------|
| Alta | Simplificar primer viewport del dashboard |
| Media | Layout 2 columnas en módulos; unificar superficies; mejorar contraste |
| Baja | Refinar glow/violeta; sliders; labels de nav; footer con autor |

## Conclusión

El diseño ya comunica “lab térmico” mejor que una plantilla genérica, gracias a tipografía, tokens y diagramas. El siguiente salto de calidad no es más decoración, sino **menos ruido en el dashboard**, **más ancla visual del producto** y **layout de trabajo** (controles vs resultados) en los módulos.
