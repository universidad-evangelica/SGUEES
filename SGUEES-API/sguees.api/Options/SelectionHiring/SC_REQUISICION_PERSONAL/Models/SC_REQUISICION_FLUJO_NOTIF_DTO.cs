using System.Collections.Generic;

namespace SGUEES.Models
{
	/// <summary>
	/// DTO para mapear SEG_FLUJO → GEN_NOTIFICACION (SignalR) tras Autoriza.
	/// Título = NOMBRE_TIPO + " #" + CORR + " - " + NOMBRE_ESTADO; Mensaje = DESCRIPCION_ESTADO.
	/// URL con CORR_REQUISICION_PERSONAL vía ResolverUrlDestinoAsync.
	/// </summary>
	public class SC_REQUISICION_FLUJO_NOTIF_DTO
	{
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public string NOMBRE_TIPO { get; set; }
		public string NOMBRE_ESTADO { get; set; }
		public string DESCRIPCION_ESTADO { get; set; }
		public string LOGIN_CREADOR { get; set; }
		public List<string> LOGINS_PENDIENTES { get; set; } = new List<string>();
	}
}
