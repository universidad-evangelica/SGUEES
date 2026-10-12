using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	/// <summary>
	/// Bandeja del usuario autenticado. No expone creación HTTP pública.
	/// Requiere desplegar SGUEES-DB/Scripts/DEPLOY_GEN_NOTIFICACION.sql antes de probar.
	/// </summary>
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class GEN_NOTIFICACIONController : ControllerBase
	{
		private readonly IGEN_NOTIFICACIONService _service;

		public GEN_NOTIFICACIONController(IGEN_NOTIFICACIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		/// <summary>
		/// Lista paginada de notificaciones de la empresa y usuario de sesión.
		/// Query: PAGE, PAGE_SIZE, SOLO_NO_LEIDAS (opcional).
		/// </summary>
		[HttpGet("GetAll")]
		public async Task<IActionResult> GetAll([FromQuery] GEN_NOTIFICACIONParam Data)
		{
			if (!TryGetSesion(out var corrEmpresa, out var loginSistema, out var error))
			{
				return BadRequest(error);
			}

			Data ??= new GEN_NOTIFICACIONParam();
			Data.CORR_EMPRESA = corrEmpresa;
			Data.LOGIN_SISTEMA = loginSistema;

			var resultado = await _service.GetAllAsync(Data);
			return resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		/// <summary>Total de notificaciones no leídas de la sesión.</summary>
		[HttpGet("CountPendientes")]
		public async Task<IActionResult> CountPendientes()
		{
			if (!TryGetSesion(out var corrEmpresa, out var loginSistema, out var error))
			{
				return BadRequest(error);
			}

			var resultado = await _service.CountPendientesAsync(corrEmpresa, loginSistema);
			return resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		/// <summary>
		/// Marca como leída una notificación propia.
		/// Query: CORR_NOTIFICACION
		/// </summary>
		[HttpPut("Leer")]
		public async Task<IActionResult> Leer([FromQuery] int CORR_NOTIFICACION)
		{
			if (!TryGetSesion(out var corrEmpresa, out var loginSistema, out var error))
			{
				return BadRequest(error);
			}

			if (CORR_NOTIFICACION <= 0)
			{
				return BadRequest(new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "CORR_NOTIFICACION es obligatorio.",
					ErrorSource = "[GEN_NOTIFICACIONController]"
				});
			}

			var resultado = await _service.MarcarLeidaAsync(
				corrEmpresa,
				loginSistema,
				CORR_NOTIFICACION,
				loginSistema,
				ClientInfoHelper.GetClientStation(HttpContext));

			if (resultado.ErrorCode == 404)
			{
				return NotFound(resultado);
			}

			return resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		private bool TryGetSesion(out int corrEmpresa, out string loginSistema, out CResult error)
		{
			corrEmpresa = 0;
			loginSistema = null;
			error = null;

			var loginClaim = User.Claims.FirstOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrWhiteSpace(loginClaim))
			{
				error = new CResult
				{
					Result = false,
					ErrorCode = 401,
					ErrorMessage = "No se pudo obtener el LOGIN_SISTEMA de la sesión.",
					ErrorSource = "[GEN_NOTIFICACIONController]"
				};
				return false;
			}

			// Conservar casing exacto del JWT (collation CS_AS / SignalR UserIdentifier).
			loginSistema = loginClaim;

			var empresaClaim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA")?.Value;
			if (string.IsNullOrWhiteSpace(empresaClaim) || !int.TryParse(empresaClaim, out corrEmpresa) || corrEmpresa <= 0)
			{
				error = new CResult
				{
					Result = false,
					ErrorCode = 4100,
					ErrorMessage = "No se pudo obtener CORR_EMPRESA válido de la sesión.",
					ErrorSource = "[GEN_NOTIFICACIONController]"
				};
				return false;
			}

			return true;
		}
	}
}
