// Qué hace: entidad de escritura de la tabla GEN_PARAMETRO_PLANTILLA_VERSION.
// Cómo lo hace: define las propiedades correspondientes a las columnas de base de datos heredando de BaseEntity.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PARAMETRO_PLANTILLA_VERSIONTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARAMETRO_PLANTILLA { get; set; }
		public int NUMERO_VERSION { get; set; }
		public string ASUNTO_PLANTILLA { get; set; }
		public string CUERPO_PLANTILLA { get; set; }
		public string CORREO_CC { get; set; }
		public string CORREO_CCO { get; set; }
		public bool ES_VERSION_ACTIVA { get; set; }
		public string MOTIVO_VERSION { get; set; }
	}
}
