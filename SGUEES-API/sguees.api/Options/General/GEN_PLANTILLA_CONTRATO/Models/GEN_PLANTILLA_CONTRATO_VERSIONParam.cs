// Qué hace: DTO de entrada para operaciones sobre versiones de plantilla de contrato.
// Cómo lo hace: transporta empresa, correlativos de plantilla/versión, cuerpo HTML editado y observación del cambio.
namespace sguees.Models
{
	// Qué hace: encapsula los parámetros requeridos para crear o activar una versión de contrato.
	// Cómo lo hace: expone los identificadores y el contenido HTML enviado desde el editor SPA.
	public class GEN_PLANTILLA_CONTRATO_VERSIONParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PLANTILLA_CONTRATO { get; set; }
		public int CORR_PLANTILLA_CONTRATO_VERSION { get; set; }
		public string CUERPO_PLANTILLA { get; set; }
		public string OBSERVACION { get; set; }
	}
}

