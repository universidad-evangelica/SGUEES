using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_ACTIVIDAD_ECONOMICATable: BaseEntity
	{
		public int CORR_ACTIVIDAD_ECONOMICA { get; set; }
		public string CODIGO_ACTIVIDAD_ECONOMICA { get; set; }
		public string NOMBRE_ACTIVIDAD_ECONOMICA { get; set; }
	}
}
