using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: entidad de escritura de GEN_PARAMETRO_PLANTILLA.
	// Cómo lo hace: define las propiedades mapeadas a la tabla de base de datos.
	public class GEN_PARAMETRO_PLANTILLATable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARAMETRO_PLANTILLA { get; set; }
		public string CODIGO_PLANTILLA { get; set; }
		public string NOMBRE_PLANTILLA { get; set; }
		public string ASUNTO_PLANTILLA { get; set; }
		public string CUERPO_PLANTILLA { get; set; }
		public int CORR_PARAMETRO_SMTP { get; set; }
		public string CORREO_CC { get; set; }
		public string CORREO_CCO { get; set; }
		public bool ACTIVO_PLANTILLA { get; set; }
	}
}
