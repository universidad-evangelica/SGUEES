using System.Threading.Tasks;

namespace sguees.api.Services.Hubs
{
	public interface INotificationSignalRService
	{
		/// <summary>
		/// Envía una notificación al usuario conectado identificado por LOGIN_SISTEMA (Context.UserIdentifier).
		/// </summary>
		Task SendToUserAsync(string loginSistema, NotificationMessage notification);
	}
}
