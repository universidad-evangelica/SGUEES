using eFramework.Data;

namespace sguees.Models
{
	public class CON_RUBRO_NIVELTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public string CODIGO_RUBRO { get; set; }
		public int NIVEL { get; set; }
		public int NUMERO_CARACTERES { get; set; }
	}
}
