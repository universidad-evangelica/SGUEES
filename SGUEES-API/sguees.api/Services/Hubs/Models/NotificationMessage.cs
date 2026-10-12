using System;

namespace sguees.api.Services.Hubs
{
	/// <summary>
	/// Payload tipado para notificaciones en tiempo real vía SignalR.
	/// PropertyNamingPolicy = null: se serializa con estos nombres.
	/// </summary>
	public class NotificationMessage
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_NOTIFICACION { get; set; }
		public string TITULO { get; set; }
		public string MENSAJE { get; set; }
		public string URL_DESTINO { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public bool LEIDA { get; set; }
	}
}
