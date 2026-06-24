using eFramework.Data;

namespace sguees.Models
{
	public class CON_TIPO_CENTRO_COSTOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_CENTRO_COSTO { get; set; }
		public string NOMBRE_TIPO_CENTRO_COSTO { get; set; }
		public string CLASE_CENTRO_COSTO { get; set; }
	}
}
