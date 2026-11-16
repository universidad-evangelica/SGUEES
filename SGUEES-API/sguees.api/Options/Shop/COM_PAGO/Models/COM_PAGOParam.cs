using System;
using eFramework.Data;

namespace eadmindevprojectmanagement.Models
{
	public class COM_PAGOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PAGO { get; set; }
		public DateTime FECHA_INICIAL { get; set; }
		public DateTime FECHA_FINAL { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
		public int TIPO_CONSULTA { get; set; } = 1;
		public int? CORR_ARCHIVO { get; set; }
	}
}
