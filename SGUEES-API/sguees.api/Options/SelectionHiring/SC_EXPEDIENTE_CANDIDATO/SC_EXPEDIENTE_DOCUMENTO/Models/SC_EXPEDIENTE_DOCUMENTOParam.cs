using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_EXPEDIENTE_DOCUMENTOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_EXPEDIENTE_DOCUMENTO { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
	}
}
