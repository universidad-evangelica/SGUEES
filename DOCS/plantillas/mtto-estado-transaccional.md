# Plantilla — Estado transaccional (varchar / workflow)

**Versión:** 1.0 — junio 2026  
**Referencias:** `Shop/com-documento`, `Accounting/con-partida`

---

## Cuándo usar

Documentos, partidas, requisiciones, órdenes — estados con **significado de negocio** y transiciones controladas.

| Ejemplo | Campo | Valores |
|---------|-------|---------|
| Documento compra | `ESTADO_DOCUMENTO` varchar(2) | `DI`, `SO`, `AP`, … |
| Partida | `ESTADO_PARTIDA` varchar(2) | según módulo |

---

## Cuándo NO usar este patrón

Catálogo simple activo/inactivo → [mtto-a-plus-estado-catalogo.md](./mtto-a-plus-estado-catalogo.md) (`bit` + badge verde/rojo).

---

## Base de datos

- `ESTADO_<ENTIDAD>` **varchar(2)** o **varchar(3)** según catálogo de estados
- Vista: incluir `NOMBRE_ESTADO_*` o join a lista para mostrar en grid
- **No** convertir a `bit` en tablas transaccionales

---

## SPA

| Tema | Patrón |
|------|--------|
| Grid | Columna texto o badge con lookup de estados (no solo verde/rojo) |
| Editar / eliminar | Condicionado por estado (`ESTADO === 'DI'`) |
| Botones | Acciones de negocio: Aplicar, Anular, Autorizar — **no** Activar/Desactivar genérico. Configurar en **HTML** de `app-barra-data-mtto` (`btn1`…); TS solo textos. Ver [mtto-barra-patron.md](./mtto-barra-patron.md). |
| Form | Campos bloqueados según estado (`bloquear()` por `ESTADO`) |
| API | Métodos específicos por transición, validación en service |

---

## API

- **No** endpoints genéricos `Activar`/`Desactivar` salvo que el negocio sea literalmente binario
- Transiciones en service con reglas (ej. solo `DI` → `AP`)
- Permisos por acción si aplica (`/ruta|U` o endpoint dedicado)

---

## Grid — visual

- Lookup `GetESTADO_*` desde `*_LISTA` o nombre en vista
- Colores opcionales por estado (no reutilizar solo `.estado-badge--activo/inactivo` si hay &gt;2 estados)

---

## Checklist transaccional

- [ ] Estado varchar en BD/vista
- [ ] Lookup o nombre estado en grid
- [ ] `permiteEditar` / `permiteDele` condicionados por estado
- [ ] Sin `buildEstadoActionButtons` de catálogo
- [ ] Sin `ejecutarCambioEstado` bit flip
- [ ] Flujo documentado por pantalla (no plantilla CRUD genérica)

---

## Regla de decisión (equipo)

```
¿El registro solo se enciende o apaga?
  SÍ → Estado catálogo (bit)
  NO → Estado transaccional (varchar + flujo)
```
