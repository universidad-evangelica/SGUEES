using eFramework.Data;

namespace sguees.Models
{
	public class CON_UNIDAD_NEGOCIOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_UNIDAD_NEGOCIO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
