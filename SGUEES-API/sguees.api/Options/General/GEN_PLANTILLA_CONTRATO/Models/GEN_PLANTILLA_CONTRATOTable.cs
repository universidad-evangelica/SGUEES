// Qué hace: entidad de persistencia de plantilla de contrato.
// Cómo lo hace: mapea las columnas reales de la tabla GEN_PLANTILLA_CONTRATO y su auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: representa un registro de la tabla GEN_PLANTILLA_CONTRATO.
	// Cómo lo hace: expone empresa, correlativo, nombre, tipo de contratación y campos de auditoría.
	public class GEN_PLANTILLA_CONTRATOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PLANTILLA_CONTRATO { get; set; }
		public string NOMBRE_PLANTILLA { get; set; }
		public int CORR_TIPO_CONTRATACION { get; set; }
		public string CUERPO_PLANTILLA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}

