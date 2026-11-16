// Qué hace: DTO de lectura de versiones de plantilla de contrato.
// Cómo lo hace: proyecta las columnas de V_GEN_PLANTILLA_CONTRATO_VERSION incluyendo NOMBRE_VERSION_PADRE.
using System;

namespace sguees.Models
{
	// Qué hace: representa una versión registrada de plantilla de contrato.
	// Cómo lo hace: expone correlativos, número y nombre de versión, padre, estado activo, cuerpo y auditoría.
	public class GEN_PLANTILLA_CONTRATO_VERSIONView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PLANTILLA_CONTRATO_VERSION { get; set; }
		public int CORR_PLANTILLA_CONTRATO { get; set; }
		public int NUMERO_VERSION { get; set; }
		public string NOMBRE_VERSION { get; set; }
		public int? CORR_VERSION_PADRE { get; set; }
		public string NOMBRE_VERSION_PADRE { get; set; }
		public string CUERPO_PLANTILLA { get; set; }
		public bool ES_VERSION_ACTIVA { get; set; }
		public string OBSERVACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}

