using eFramework.Data;

namespace sguees.Models
{
	public class CON_RUBROTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public string CODIGO_RUBRO { get; set; }
		public string NOMBRE_RUBRO { get; set; }
		public bool ES_DEBE { get; set; }
		public bool ES_HABER { get; set; }
		public string CLASE_RUBRO { get; set; }
	}
}
