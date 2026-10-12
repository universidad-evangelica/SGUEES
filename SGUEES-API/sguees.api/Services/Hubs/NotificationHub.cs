using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;

namespace sguees.api.Services.Hubs
{
	[Authorize]
	public class NotificationHub : Hub
	{
		private readonly INotificationSignalRService _notificationSignalRService;
		private readonly IHostEnvironment _hostEnvironment;

		public NotificationHub(
			INotificationSignalRService notificationSignalRService,
			IHostEnvironment hostEnvironment)
		{
			_notificationSignalRService = notificationSignalRService;
			_hostEnvironment = hostEnvironment;
		}

		// Temporal (Development): autoenvío al conectar para probar ReceiveNotification.
		public override async Task OnConnectedAsync()
		{
			if (_hostEnvironment.IsDevelopment())
			{
				var loginSistema = Context.UserIdentifier;
				if (!string.IsNullOrWhiteSpace(loginSistema))
				{
					await _notificationSignalRService.SendToUserAsync(
						loginSistema,
						new NotificationMessage
						{
							TITULO = "Prueba SignalR",
							MENSAJE = "Conexión autenticada correctamente"
						});
				}
			}

			await base.OnConnectedAsync();
		}
	}
}
