// Qué hace: DTO de lectura de plantilla de contrato.
// Cómo lo hace: proyecta las columnas de la vista V_GEN_PLANTILLA_CONTRATO incluyendo NOMBRE_TIPO_CONTRATACION.
using System;

namespace sguees.Models
{
	// Qué hace: representa una fila devuelta por la vista V_GEN_PLANTILLA_CONTRATO.
	// Cómo lo hace: expone los campos de la tabla y la descripción del tipo de contratación relacionado.
	public class GEN_PLANTILLA_CONTRATOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PLANTILLA_CONTRATO { get; set; }
		public string NOMBRE_PLANTILLA { get; set; }
		public int CORR_TIPO_CONTRATACION { get; set; }
		public string NOMBRE_TIPO_CONTRATACION { get; set; }
		public int? CORR_VERSION_ACTIVA { get; set; }
		public int? NUMERO_VERSION_ACTIVA { get; set; }
		public string NOMBRE_VERSION_ACTIVA { get; set; }
		public string CUERPO_PLANTILLA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}

