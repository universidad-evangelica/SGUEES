import { ScDescriptorFuncionActividad } from '../../sc-descriptor-funcion-actividad/models/sc-descriptor-funcion-actividad';

// Función clave o secundaria del descriptor de puesto.
export interface ScDescriptorFuncion {
	CORR_EMPRESA?: number; // Empresa del registro.
	CORR_DESCRIPTOR_PUESTO?: number; // Descriptor al que pertenece la función.
	CORR_FUNCION: number; // Identificador de la función en base de datos.
	NOMBRE_FUNCION: string; // Nombre descriptivo de la función.
	TIPO_FUNCION: string; // Tipo: CLAVE o SECUNDARIA.
	CANT_ACTIVIDADES?: number; // Cantidad de actividades asociadas a la función.
	actividadesPendientes?: ScDescriptorFuncionActividad[]; // Actividades nuevas aún no persistidas.
	_marcadaEliminar?: boolean; // Marca interna para eliminar la función al guardar.
	_clientKey?: string | number; // Llave temporal del cliente para filas nuevas sin ID.
}
