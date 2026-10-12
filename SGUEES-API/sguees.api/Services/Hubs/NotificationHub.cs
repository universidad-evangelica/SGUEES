using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace sguees.api.Services.Hubs
{
	[Authorize]
	public class NotificationHub : Hub
	{
	}
}
