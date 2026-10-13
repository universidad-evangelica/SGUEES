using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace sguees.api.Services.Hubs
{
	/// <summary>
	/// UserIdentifier de SignalR = LOGIN_SISTEMA del JWT (NameIdentifier / nameid / sub).
	/// Garantiza que Clients.User(login) coincida con Context.UserIdentifier.
	/// </summary>
	public sealed class LoginSistemaUserIdProvider : IUserIdProvider
	{
		public string GetUserId(HubConnectionContext connection)
		{
			var user = connection?.User;
			if (user == null)
			{
				return null;
			}

			return user.FindFirst(ClaimTypes.NameIdentifier)?.Value
				?? user.FindFirst("nameid")?.Value
				?? user.FindFirst("sub")?.Value;
		}
	}
}
