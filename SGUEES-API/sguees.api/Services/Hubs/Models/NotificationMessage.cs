namespace sguees.api.Services.Hubs
{
	/// <summary>
	/// Payload tipado para notificaciones en tiempo real vía SignalR.
	/// PropertyNamingPolicy = null en Program.cs: se serializa con estos nombres.
	/// </summary>
	public class NotificationMessage
	{
		public string TITULO { get; set; }
		public string MENSAJE { get; set; }
	}
}
