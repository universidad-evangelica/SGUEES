using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace sguees.api.Services.Hubs
{
	public class NotificationSignalRService : INotificationSignalRService
	{
		public const string ClientMethodName = "ReceiveNotification";

		private readonly IHubContext<NotificationHub> _hubContext;

		public NotificationSignalRService(IHubContext<NotificationHub> hubContext)
		{
			_hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
		}

		public async Task SendToUserAsync(string loginSistema, NotificationMessage notification)
		{
			if (string.IsNullOrWhiteSpace(loginSistema))
			{
				throw new ArgumentException("El LOGIN_SISTEMA destinatario es obligatorio.", nameof(loginSistema));
			}

			if (notification == null)
			{
				throw new ArgumentNullException(nameof(notification));
			}

			await _hubContext.Clients.User(loginSistema).SendAsync(ClientMethodName, notification);
		}
	}
}
