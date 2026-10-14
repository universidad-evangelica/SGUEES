// Qué hace: firma guardada de un descriptor de puesto.
// Cómo lo hace: nombre, actor y unidad quedan en texto desde que el descriptor quedó Activo.
export interface ScDescriptorPuestoFirma {
	CORR_FIRMAS?: number;
	CORR_DESCRIPTOR_PUESTO?: number;
	NOMBRE_COMPLETO?: string;
	TIPO_JEFE?: string;
	TIPO_ACTOR?: string;
	FECHA_FIRMA?: string | Date | null;
}
