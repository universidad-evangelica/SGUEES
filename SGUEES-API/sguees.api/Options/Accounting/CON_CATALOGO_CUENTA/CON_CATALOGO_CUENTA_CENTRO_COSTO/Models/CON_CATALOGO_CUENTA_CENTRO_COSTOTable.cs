using eFramework.Data;

namespace sguees.Models
{
	public class CON_CATALOGO_CUENTA_CENTRO_COSTOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
	}
}
