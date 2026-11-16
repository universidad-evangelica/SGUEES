// Qué hace: DTOs de entrada/salida auxiliares para asignar, regenerar, cambiar estado y consultar plantillas activas.
// Cómo lo hace: encapsula datos del formulario SPA, motivo de anulación y resumen de plantillas disponibles.
using System;

namespace sguees.Models
{
	public class GEN_EMPLEADO_CONTRATOAccionParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EMPLEADO_CONTRATO { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public int? CORR_UNIDAD { get; set; }
		public int? CORR_PUESTO { get; set; }
		public int CORR_PLANTILLA_CONTRATO_VERSION { get; set; }
		public DateTime FECHA_INICIO { get; set; }
		public DateTime? FECHA_FIN { get; set; }
		public DateTime? FECHA_FIRMA { get; set; }
		public string MOTIVO_ANULACION { get; set; }
		public bool REGENERAR_CONTENIDO { get; set; } = true;
		public string CUERPO_CONTRATO { get; set; }
	}

	// Qué hace: proyecta las plantillas con versión activa disponibles para asignar en el tab Contratos.
	// Cómo lo hace: une GEN_PLANTILLA_CONTRATO y GEN_PLANTILLA_CONTRATO_VERSION donde ES_VERSION_ACTIVA = 1.
	public class GEN_PLANTILLA_CONTRATO_ACTIVAView
	{
		public int CORR_PLANTILLA_CONTRATO { get; set; }
		public string NOMBRE_PLANTILLA { get; set; }
		public int CORR_TIPO_CONTRATACION { get; set; }
		public string NOMBRE_TIPO_CONTRATACION { get; set; }
		public int CORR_PLANTILLA_CONTRATO_VERSION { get; set; }
		public int NUMERO_VERSION { get; set; }
		public string NOMBRE_VERSION { get; set; }
	}
}

