using System;
using System.Collections.Generic;

namespace sguees.Models
{
	public class BAN_CONCILIA_BANCARIA_IMPORTParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public int CORR_CONCILIACION { get; set; }
		public int CORR_BANCO { get; set; }
		public List<BAN_CONCILIA_BANCARIA_IMPORTRow> Rows { get; set; }
	}

	public class BAN_CONCILIA_BANCARIA_IMPORTRow
	{
		public int CORR { get; set; }
		public DateTime FECHA_MOVIMIENTO { get; set; }
		public string NUMERO_REFERENCIA_BANCO { get; set; }
		public string CODIGO_TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_MOVIMIENTO { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
	}
}
