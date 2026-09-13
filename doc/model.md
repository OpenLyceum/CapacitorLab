# Capacitor Lab Model

Capacitor Lab models ideal parallel-plate capacitors. Students can investigate how plate geometry,
battery voltage, dielectric material, and circuit topology affect capacitance, charge, electric field,
and stored energy. Model values stay in SI units; the view converts them to practical display units.

## Quantities and ranges

| Quantity | Symbol | Unit | Range/default |
|---|---:|---:|---:|
| Battery voltage | V | V | −1.5 to 1.5; default 0 |
| Square plate side | L | m | 0.010 to 0.020; default 0.010 |
| Plate area | A | m² | L² |
| Plate separation | d | m | 0.005 to 0.010; default 0.010 |
| Dielectric offset | x | m | 0 to 0.020; default 0.010 |
| Direct capacitance control | C | F | 1×10⁻¹³ to 3×10⁻¹³ |
| Custom relative permittivity | εᵣ | 1 | 1 to 5; default 5 |

The fixed material constants are glass 4.7, paper 3.5, teflon 2.1, and air 1.0. Air is deliberately
treated as vacuum so it produces no visible polarization field.

## One capacitor

For a fully air-filled or fully dielectric-filled ideal capacitor,

```text
C = εᵣ ε₀ A / d
```

where `ε₀ = 8.854×10⁻¹² F/m`. When the slab is partly withdrawn, the plate is split into two side-by-
side regions that behave as capacitors in parallel:

```text
A_dielectric = max(L − |x|, 0) L
A_air        = A − A_dielectric
C_air        = ε_air ε₀ A_air / d
C_dielectric = εᵣ ε₀ A_dielectric / d
C_total      = C_air + C_dielectric
```

With the battery connected, the voltage is fixed and each region follows `Q = CV`. Total plate charge
and stored energy are

```text
Q_total = C_total V
U       = ½ C_total V²
```

After disconnecting the battery, plate charge is held fixed. Geometry or dielectric changes therefore
change the voltage according to `V = Q/C`.

## Electric fields and dielectric charge

The uniform effective field between the plates is

```text
E_effective = V / d
```

For either plate region, surface charge density is `σ = Q/A`. The field attributed to the free plate
charge and the opposing polarization field are

```text
E_plates     = σ / ε₀ = εᵣ V / d
E_dielectric = E_plates − E_effective
```

Signs follow the battery polarity. The excess bound charge displayed on a dielectric face is

```text
Q_excess = ((εᵣ − 1) / εᵣ) C_dielectric V
```

The electric-field detector reports these as Plate, Dielectric, and Sum vectors. It reports zero when
its probe is outside every capacitor gap.

## Multiple-capacitor networks

Parallel capacitors share voltage and add directly:

```text
C_total = Σ Cᵢ
Q_total = C_total V
```

Series capacitors carry the same charge and divide the voltage:

```text
1 / C_total = Σ (1 / Cᵢ)
Qᵢ = Q_total
Vᵢ = Q_total / Cᵢ
```

The two combination circuits reduce their series and parallel branches with these same rules. Each
capacitor can have a different value; the view realizes that value by changing plate separation at a
fixed plate size.

## Idealizations

Plates and wires are perfect conductors. Fields are uniform between finite-looking plates; fringing,
leakage, dielectric breakdown, resistance, inductance, temperature effects, and frequency dependence
are omitted. Circuit changes are electrically instantaneous. Animated current arrows visualize
`dQ/dt` between frames and are qualitative rather than a transient circuit solution.

## References

- PhET Java Capacitor Lab `doc/model.txt` and `model/Capacitor.java` (authoritative).
- `veillette/simulations/capacitor-lab`, an earlier Backbone/PixiJS web port.
- PhET Capacitor Lab: Basics for the overlapping vacuum-capacitor model and modern presentation.
