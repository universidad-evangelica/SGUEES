using System;
using eFramework.Data;

namespace sguees.Models
{
	public class CON_PARTIDAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public DateTime? FECHA_PARTIDA { get; set; }
		public DateTime? FECHA_INICIAL { get; set; }
		public DateTime? FECHA_FINAL { get; set; }
		public int OPCION_CONSULTA { get; set; }
	}
}
