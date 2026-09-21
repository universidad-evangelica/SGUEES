/* =============================================================================
   NOTA — Configuración de flujo SEG para SC_MOVIMIENTO_PERSONAL
   =============================================================================

   El SP PRAL_MTTO_SC_MOVIMIENTO_PERSONAL_AUTORIZA requiere:

   1) SEG_FLUJO_TIPO_DOCUMENTO
      - CODIGO_OPCION = 'SC_MOVIMIENTO_PERSONAL'
      - ACTIVO = 1
      - CORR_TIPO_DOCUMENTO = un correlativo nuevo (ej. 103; requisición usa 101)

   2) SEG_FLUJO_ESTADO (para ese tipo)
      - Borrador (ES_INICIAL = 1)
      - En Aprobación / Solicitada
      - Devuelta
      - Aprobada / Aprobado (ES_FINAL = 1)
      - Rechazada / Denegada (ES_FINAL = 1)

   3) SEG_FLUJO_PROCESO con ES_DEFECTO = 1

   4) SEG_FLUJO_PASO + SEG_FLUJO_PASO_ACCION_ESTADO
      - Mismos movimientos: 1=AVANZA 2=RETORNA 3=FINALIZA 4=MANTIENE
      - Actores: JEFE_UNIDAD / JEFE_INMEDIATO / MANUAL (como requisición)

   Recomendación: clonar la configuración de SC_REQUISICION (tipo 101) desde la
   pantalla de flujos SEG o scripts de Flujos/, cambiando solo CODIGO_OPCION y
   CORR_TIPO_DOCUMENTO.

   Hasta configurar el flujo:
   - CRUD y pantalla funcionan.
   - Botón "Enviar" fallará con mensaje claro del SP (-2 / -3).

   Bitácora en API usa CORR_TIPO_DOCUMENTO del tipo configurado.
   Ajuste temporal en Controller: constante TipoDocumentoMovimiento.
   ============================================================================= */
