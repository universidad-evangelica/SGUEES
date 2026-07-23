using eFramework.Data;

namespace sguees.Models
{
	public class BAN_CONCILIA_BANCARIA_DETAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public int CORR_CONCILIACION { get; set; }
		public int CORR_CONCILIACION_DETA { get; set; }
	}
}
