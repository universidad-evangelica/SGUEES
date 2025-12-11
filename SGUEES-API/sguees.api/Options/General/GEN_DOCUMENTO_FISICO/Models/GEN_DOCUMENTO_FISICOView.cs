using System;

namespace sguees.Models
{
	public class GEN_DOCUMENTO_FISICOView
	{
		public int CORR_SUSCRIPCION { get; set; }
		public int CORR_CONFI_PAIS { get; set; }
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public string NOMBRE_DOCUMENTO { get; set; }
		public string DESCRIPCION_DOCUMENTO { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; }
		public string NOMBRE_TIPO_DOCUMENTO { get; set; }
		public string RUTA_DOCUMENTO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public string CODIGO_SUITE { get; set; }
		public int CORR_DOCUMENTO_DOC { get; set; }

	}
}
