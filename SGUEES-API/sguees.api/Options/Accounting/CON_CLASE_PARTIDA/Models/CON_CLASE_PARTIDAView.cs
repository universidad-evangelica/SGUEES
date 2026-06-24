namespace sguees.Models
{
	public class CON_CLASE_PARTIDAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public string NOMBRE_CLASE_PARTIDA { get; set; }
		public string NOMBRE_CORTO_CLASE { get; set; }
		public int? CORR_LINEA_AUMENTA { get; set; }
		public int? CORR_LINEA_DISMINUYE { get; set; }
		public bool ACEPTA_MODIFICACION { get; set; }
		public bool? PARTIDA_CIERRE { get; set; }
		public string NOMBRE_REPORTE { get; set; }
	}
}
