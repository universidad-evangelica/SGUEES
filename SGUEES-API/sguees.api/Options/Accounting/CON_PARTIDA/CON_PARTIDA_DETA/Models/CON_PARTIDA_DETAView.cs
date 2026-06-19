namespace sguees.Models
{
	public class CON_PARTIDA_DETAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public int CORR_PARTIDA_DETA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public int? CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_CENTRO { get; set; }
		public string NOMBRE_TRAN { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public bool? ESTA_CONCILIA { get; set; }
		public int? CORR_AUXILIAR { get; set; }
		public string NOMBRE_AUXILIAR { get; set; }
		public decimal? MONTO_CARGO_FORANEA { get; set; }
		public decimal? MONTO_ABONO_FORANEA { get; set; }
	}
}
