using System;
using System.Collections.Generic;

namespace sguees.Models
{
	public class CON_PARTIDA_IMPORTParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public List<CON_PARTIDA_IMPORTRow> Rows { get; set; }
	}

	public class CON_PARTIDA_IMPORTRow
	{
		public DateTime FECHA_PARTIDA { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public int? CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_TRAN { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
	}
}
