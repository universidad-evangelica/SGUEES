using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SC_SOLICITUD_EMPLEOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
		/// <summary>Login de sesión: GetAll filtra por organigrama (PRAL_DATA_SC_SOLICITUD_EMPLEO).</summary>
		public string LOGIN_SISTEMA { get; set; }
	}
}
