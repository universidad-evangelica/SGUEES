using System;

namespace SGUEES.Models
{
	/// <summary>Fila de bitácora SEG_FLUJO para el movimiento.</summary>
	public class SC_MOVIMIENTO_PERSONAL_BITACORAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public string ESTADO_DESTINO { get; set; }
		public string COMENTARIO { get; set; }
		public DateTime? FECHA_ACCION { get; set; }
	}
}
