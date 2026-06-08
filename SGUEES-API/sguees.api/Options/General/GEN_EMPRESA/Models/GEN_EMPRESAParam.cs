using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_EMPRESAParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PAIS { get; set; }
		public int CORR_DEPTO { get; set; }
		public int CORR_MUNICIPIO { get; set; }
		public int CORR_SECTOR_ECONOMICO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
