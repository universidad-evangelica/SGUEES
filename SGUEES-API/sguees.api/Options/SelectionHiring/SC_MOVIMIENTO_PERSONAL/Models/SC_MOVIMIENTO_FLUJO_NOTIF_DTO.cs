using System.Collections.Generic;

namespace SGUEES.Models
{
	/// <summary>
	/// DTO para mapear SEG_FLUJO → GEN_NOTIFICACION tras Autoriza (origen DIRECTO).
	/// </summary>
	public class SC_MOVIMIENTO_FLUJO_NOTIF_DTO
	{
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }
		public string NOMBRE_TIPO { get; set; }
		public string NOMBRE_ESTADO { get; set; }
		public string DESCRIPCION_ESTADO { get; set; }
		public string LOGIN_CREADOR { get; set; }
		public List<string> LOGINS_PENDIENTES { get; set; } = new List<string>();
	}
}
