using eFramework.Data;

namespace sguees.Models
{
	public class CON_UNIDAD_NEGOCIOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_UNIDAD_NEGOCIO { get; set; }
		public string NOMBRE_UNIDAD_NEGOCIO { get; set; }
		public string CODIGO_UNIDAD_NEGOCIO { get; set; }
		public string CLASE_UNIDAD_NEGOCIO { get; set; }
	}
}
