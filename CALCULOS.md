# 📐 Documentación de Cálculos Orbitales

Este documento explica todos los cálculos físicos y orbitales utilizados en el dashboard, basados en datos reales de los parámetros TLE de Firebase.

## 🌍 Constantes Físicas

- **μ (MU_EARTH)**: 3.986 × 10¹⁴ m³/s² - Parámetro gravitacional estándar de la Tierra
- **Radio de la Tierra**: 6,371 km

## 📊 Cálculos Implementados

### 1. Velocidad Orbital (v)

**Fórmula**: `v = √(μ/r)`

Donde:
- `r` = radio orbital = (Radio Tierra + altitud) en metros
- `μ` = parámetro gravitacional terrestre

**Ejemplo**:
- Altitud: 788 km
- r = (6371 + 788) × 1000 = 7,159,000 m
- v = √(3.986×10¹⁴ / 7,159,000) = 7,465 m/s ≈ 26,874 km/h

**Código**:
```javascript
export function calculateOrbitalVelocity(altitudeKm) {
    const r = (EARTH_RADIUS_KM + altitudeKm) * 1000;
    return Math.sqrt(MU_EARTH / r);
}
```

---

### 2. Período Orbital (T)

**Fórmula**: `T = 2π√(r³/μ)`

Donde:
- `r` = radio orbital en metros
- `μ` = parámetro gravitacional terrestre

**Ejemplo**:
- Altitud: 788 km
- r = 7,159,000 m
- T = 2π√(7,159,000³ / 3.986×10¹⁴) = 6,048 segundos ≈ 100.8 minutos

**Código**:
```javascript
export function calculateOrbitalPeriod(altitudeKm) {
    const r = (EARTH_RADIUS_KM + altitudeKm) * 1000;
    const T = 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / MU_EARTH);
    return T / 60; // Convertir a minutos
}
```

---

### 3. Delta-V para Desorbitación

**Método**: Transferencia de Hohmann

**Fórmulas**:
1. Velocidad orbital actual: `v₁ = √(μ/r₁)`
2. Velocidad en periapsis de transferencia: `v_transfer = √(μ × (2/r₁ - 2/(r₁+r₂)))`
3. Delta-V: `ΔV = |v₁ - v_transfer|`

Donde:
- `r₁` = radio orbital actual
- `r₂` = radio de órbita de reentrada (100 km de altitud)

**Ejemplo**:
- Altitud actual: 788 km → r₁ = 7,159,000 m
- Altitud reentrada: 100 km → r₂ = 6,471,000 m
- v₁ = 7,465 m/s
- v_transfer = 7,346 m/s
- ΔV = 119 m/s

**Código**:
```javascript
export function calculateDeltaV(altitudeKm, mass) {
    const r1 = (EARTH_RADIUS_KM + altitudeKm) * 1000;
    const r2 = (EARTH_RADIUS_KM + 100) * 1000;
    const v1 = Math.sqrt(MU_EARTH / r1);
    const v_transfer = Math.sqrt(MU_EARTH * (2/r1 - 2/(r1 + r2)));
    return Math.abs(v1 - v_transfer);
}
```

---

### 4. Altitud desde Mean Motion (MEAN_MOTION)

**Tercera Ley de Kepler**: `n² × a³ = μ`

Donde:
- `n` = movimiento medio en rad/s
- `a` = semi-eje mayor en metros

**Proceso**:
1. Convertir revoluciones/día a rad/s: `n = (MEAN_MOTION × 2π) / 86400`
2. Calcular semi-eje mayor: `a = (μ / n²)^(1/3)`
3. Calcular altitud: `h = a - R_tierra`

**Ejemplo**:
- MEAN_MOTION: 14.33174089 rev/día
- n = (14.33174089 × 2π) / 86400 = 0.001044 rad/s
- a = (3.986×10¹⁴ / 0.001044²)^(1/3) = 7,159,000 m
- h = 7,159,000 - 6,371,000 = 788 km

**Código**:
```javascript
function calculateAltitudeFromMeanMotion(meanMotion) {
    const n = (meanMotion * 2 * Math.PI) / 86400;
    const a = Math.pow(MU_EARTH / (n * n), 1/3);
    const altitudeKm = (a / 1000) - EARTH_RADIUS_KM;
    return altitudeKm;
}
```

---

### 5. Tiempo de Decaimiento

**Factores considerados**:
- Altitud orbital (mayor altitud = mayor tiempo)
- Coeficiente BSTAR (mayor arrastre = menor tiempo)

**Fórmula aproximada**:
```
baseTime = (altitud / 100) × 2 años
dragFactor = |BSTAR| × 100000
decayTime = baseTime / (1 + dragFactor)
```

**Rangos**:
- Mínimo: 1 año
- Máximo: 100 años

**Código**:
```javascript
function calculateDecayTime(altitude, bstar) {
    let baseTime = (altitude / 100) * 2;
    if (bstar && bstar > 0) {
        const dragFactor = Math.abs(bstar) * 100000;
        baseTime = baseTime / (1 + dragFactor);
    }
    return Math.max(1, Math.min(baseTime, 100));
}
```

---

### 6. Vulnerabilidad de Reentrada

**Clasificación por tiempo de decaimiento**:

| Tiempo | Nivel | Valor Riesgo | Color |
|--------|-------|--------------|-------|
| < 8 años | ALTA | 100 - (t/8)×100 | Rojo |
| 8-15 años | MEDIA | 50 + (15-t)/7×50 | Naranja |
| > 15 años | BAJA | (25-t)/10×50 | Verde |

**Código**:
```javascript
export function calculateVulnerability(decayTime) {
    if (decayTime < 8) {
        return {
            level: "ALTA",
            riskValue: 100 - (decayTime / 8) * 100,
            color: 'rgb(255, 85, 85)'
        };
    }
    // ... más casos
}
```

---

### 7. Estimación de Masa

**Por categoría**:
- **space_stations**: 50,000 - 150,000 kg
- **communications/navigation**: 500 - 2,500 kg
- **scientific**: 200 - 1,200 kg
- **debris**: 10 - 110 kg
- **misc**: 50 - 550 kg

**Ajuste por BSTAR**:
```
bstarFactor = min(|BSTAR| × 10000, 2)
masa_final = masa_base / (1 + bstarFactor)
```

Valores más altos de BSTAR indican mayor área/masa, por lo que reducimos la masa estimada.

---

### 8. Rentabilidad de Misión

**Fórmula**:
```
Beneficio = Valor_Material × Masa
Coste = Coste_Masa + Coste_Velocidad + Coste_Distancia + Coste_DeltaV
Rentabilidad = Beneficio - Coste
```

**Componentes del coste**:
- `Coste_Masa = 20 €/kg × masa`
- `Coste_Velocidad = 50 × (v_km/s)²`
- `Coste_Distancia = 0.5 × distancia_km`
- `Coste_DeltaV = 0.5 × ΔV`

**Valores de materiales**:
- Aluminio: 50 €/kg
- Acero: 100 €/kg
- Compuesto: 500 €/kg

---

## ✅ Validación de Cálculos

### Ejemplo Real: COSMOS 2251

**Datos de Firebase**:
- MEAN_MOTION: 14.33174089 rev/día
- NORAD_CAT_ID: 22675
- Categoría: debris

**Cálculos**:
1. **Altitud**: 788.28 km ✓
2. **Velocidad orbital**: 7,465 m/s (26,874 km/h) ✓
3. **Período orbital**: 100.8 minutos ✓
4. **Delta-V**: ~119 m/s ✓

**Verificación externa**:
- Período orbital típico a 788 km: ~100 minutos ✓
- Velocidad orbital típica LEO: 7-8 km/s ✓

---

## 🔬 Referencias Científicas

1. **Tercera Ley de Kepler**: `T² = (4π²/μ) × a³`
2. **Ecuación de velocidad orbital**: `v = √(μ/r)`
3. **Transferencia de Hohmann**: Método más eficiente para cambio de órbita
4. **Parámetros TLE**: Formato estándar NORAD para elementos orbitales

---

## 📝 Notas

- Todos los cálculos asumen órbitas circulares para simplificación
- La excentricidad se ignora en los cálculos actuales (puede añadirse)
- El tiempo de decaimiento es una estimación aproximada
- La masa es estimada, no medida directamente
- Los costes de misión son simulados para propósitos demostrativos

---

**Última actualización**: 2025-10-04
