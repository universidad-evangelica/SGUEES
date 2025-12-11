using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_ACTIVIDAD_ECONOMICAParam: BaseParam
	{
		public string CORR_ACTIVIDAD_ECONOMICA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
