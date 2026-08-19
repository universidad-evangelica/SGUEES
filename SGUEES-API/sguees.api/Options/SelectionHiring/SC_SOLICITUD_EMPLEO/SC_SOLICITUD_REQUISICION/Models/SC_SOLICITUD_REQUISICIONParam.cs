using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SC_SOLICITUD_REQUISICIONParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_SOLICITUD_REQUISICION { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
