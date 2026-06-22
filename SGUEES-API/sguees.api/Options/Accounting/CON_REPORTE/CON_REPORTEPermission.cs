using System.Linq;
using System.Security.Claims;

namespace sguees.Repositories
{
	internal static class CON_REPORTEPermission
	{
		private static string GetPermiso(ClaimsPrincipal user, string codigoReporte)
		{
			if (user == null || !CON_REPORTERegistry.TryGetUrlOpcion(codigoReporte, out var urlOpcion))
			{
				return null;
			}

			return user.Claims.FirstOrDefault(c => c.Type == urlOpcion)?.Value;
		}

		public static bool UserCanPrint(ClaimsPrincipal user, string codigoReporte)
		{
			var permiso = GetPermiso(user, codigoReporte);
			return !string.IsNullOrEmpty(permiso) && permiso.Contains('P');
		}

		public static bool UserCanRead(ClaimsPrincipal user, string codigoReporte)
		{
			var permiso = GetPermiso(user, codigoReporte);
			return !string.IsNullOrEmpty(permiso) && permiso.Contains('R');
		}
	}
}
