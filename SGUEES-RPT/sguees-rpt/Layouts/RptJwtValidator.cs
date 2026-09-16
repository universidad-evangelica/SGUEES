using System;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Threading;
using System.Web;
using Microsoft.IdentityModel.Tokens;

namespace sgueesRpt.Layouts
{
	/// <summary>
	/// Valida JWT RPT desde querystring (?token=) o header Authorization (Bearer).
	/// </summary>
	public static class RptJwtValidator
	{
		public static bool TryValidate(HttpRequest request, out string errorMessage)
		{
			errorMessage = null;
			var token = request.QueryString["token"];
			if (string.IsNullOrWhiteSpace(token))
			{
				var auth = request.Headers["Authorization"];
				if (!string.IsNullOrWhiteSpace(auth) && auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
				{
					token = auth.Substring(7).Trim();
				}
			}

			if (string.IsNullOrWhiteSpace(token))
			{
				errorMessage = "Token de autorización requerido.";
				return false;
			}

			try
			{
				var secretKey = ConfigurationManager.AppSettings["JWT_SECRET_KEY"];
				var audienceToken = ConfigurationManager.AppSettings["JWT_AUDIENCE_TOKEN"];
				var issuerToken = ConfigurationManager.AppSettings["JWT_ISSUER_TOKEN"];
				var securityKey = new SymmetricSecurityKey(Encoding.Default.GetBytes(secretKey));

				var tokenHandler = new JwtSecurityTokenHandler();
				var validationParameters = new TokenValidationParameters
				{
					ValidAudience = audienceToken,
					ValidIssuer = issuerToken,
					ValidateLifetime = true,
					ValidateIssuerSigningKey = true,
					IssuerSigningKey = securityKey,
					LifetimeValidator = (notBefore, expires, st, parameters) =>
						expires != null && DateTime.UtcNow < expires
				};

				SecurityToken validatedToken;
				var principal = tokenHandler.ValidateToken(token, validationParameters, out validatedToken);
				Thread.CurrentPrincipal = principal;
				if (HttpContext.Current != null)
				{
					HttpContext.Current.User = principal;
				}
				return true;
			}
			catch (Exception ex)
			{
				errorMessage = "Token inválido o expirado. " + ex.Message;
				return false;
			}
		}
	}
}
