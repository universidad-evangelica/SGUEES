// Qué hace: DTO de lectura de bitácora para plantillas de contrato.
// Cómo lo hace: proyecta las columnas de la vista V_GEN_PLANTILLA_CONTRATO_BITACORA.
using System;

namespace sguees.Models
{
	// Qué hace: representa un movimiento registrado en GEN_PLANTILLA_CONTRATO_BITACORA.
	// Cómo lo hace: expone plantilla, versión, tipo de evento, detalle, fecha de acción y auditoría.
	public class GEN_PLANTILLA_CONTRATO_BITACORAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_BITACORA { get; set; }
		public int CORR_PLANTILLA_CONTRATO { get; set; }
		public string NOMBRE_PLANTILLA { get; set; }
		public int? CORR_PLANTILLA_CONTRATO_VERSION { get; set; }
		public string NOMBRE_VERSION { get; set; }
		public string TIPO_EVENTO { get; set; }
		public string DETALLE { get; set; }
		public DateTime FECHA_ACCION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
	}
}

