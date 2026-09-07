using System;

namespace SGUEES.Models
{
	public class PLA_TIPO_DOCUMENTO_ADJUNTOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOCUMENTO_ADJUNTO { get; set; }
		public string TIPO_DOCUMENTO { get; set; }
		public string DESCRIPCION_DOCUMENTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
