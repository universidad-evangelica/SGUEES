using System;

namespace sguees.Models
{
	public class BAN_TIPO_CHEQUEView
	{
		public int CORR_EMPRESA { get; set; }
		public string CLASE_TIPO_CHEQUE { get; set; }
		public int CORR_TIPO_CHEQUE { get; set; }
		public string NOMBRE_TIPO_CHEQUE { get; set; }
		public bool CONTABILIZAR_LUEGO_DE_IMPRIMIR { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string NOMBRE_CLASE_TIPO_CHEQUE { get; set; }
		public bool? ESTADO_TIPO_CHEQUE { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
