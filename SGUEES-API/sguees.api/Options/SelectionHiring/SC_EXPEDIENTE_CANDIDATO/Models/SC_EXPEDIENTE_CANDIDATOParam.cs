using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_EXPEDIENTE_CANDIDATOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
		public int CORR_PERSONA_DATOS { get; set; }
		/// <summary>Login de sesión: GetAll filtra por organigrama (PRAL_DATA_SC_EXPEDIENTE_CANDIDATO).</summary>
		public string LOGIN_SISTEMA { get; set; }
	}
}
