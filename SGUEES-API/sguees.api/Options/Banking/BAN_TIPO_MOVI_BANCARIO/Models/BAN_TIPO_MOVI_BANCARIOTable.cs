using eFramework.Data;

namespace sguees.Models
{
	public class BAN_TIPO_MOVI_BANCARIOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int SUMA_RESTA { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public string NOMBRE_REPORTE { get; set; }
		public string CLASE_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_CORTO { get; set; }
		public string CUENTA_CONTABLE_GASTO { get; set; }
		public bool USA_CHEQUE_PROPIO { get; set; }
		public int CORR_LINEA { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public bool? ESTADO_TIPO_MOVIMIENTO { get; set; } = true;
	}
}
