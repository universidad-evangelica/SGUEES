using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_EXPEDIENTE_ENTREVISTA { get; set; }
		public int CORR_ENTREVISTA_DOCUMENTO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
	}
}
