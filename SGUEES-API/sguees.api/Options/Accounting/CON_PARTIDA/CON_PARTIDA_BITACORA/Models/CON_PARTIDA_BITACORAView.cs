namespace sguees.Models
{
	// Qué hace: DTO de lectura de V_CON_PARTIDA_BITACORA.
	// Cómo lo hace: incluye nombres amigables de estado anterior/nuevo.
	public class CON_PARTIDA_BITACORAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARTIDA_BITACORA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public string TIPO_EVENTO { get; set; }
		public System.DateTime? FECHA_EVENTO { get; set; }
		public string ESTADO_ANTERIOR { get; set; }
		public string NOMBRE_ESTADO_ANTERIOR { get; set; }
		public string ESTADO_NUEVO { get; set; }
		public string NOMBRE_ESTADO_NUEVO { get; set; }
		public string OBSERVACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
	}
}
