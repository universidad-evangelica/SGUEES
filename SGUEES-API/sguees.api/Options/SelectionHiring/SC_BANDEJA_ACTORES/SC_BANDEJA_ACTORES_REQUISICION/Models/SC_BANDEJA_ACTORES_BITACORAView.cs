using System;

namespace SGUEES.Models
{
	public class SC_BANDEJA_ACTORES_BITACORAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public string ESTADO_ORIGEN { get; set; }
		public string ESTADO_DESTINO { get; set; }
		public string NOMBRE_PASO { get; set; }
		public string COMENTARIO { get; set; }
		public DateTime FECHA_ACCION { get; set; }
	}
}
