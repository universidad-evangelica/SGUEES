using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_EXPEDIENTE_SOLICITUDParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_EXPEDIENTE_SOLICITUD { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
	}
}
