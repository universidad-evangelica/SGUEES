// Qué hace: endpoints REST del catálogo bandas socioeconómico.
// Cómo lo hace: CRUD + ActivarInactivar; auditoría solo de creación (sin columnas ACTU); trunca usuario/estación a 30.
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
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class ACA_SE_BANDAController : ControllerBase
	{
		private readonly IACA_SE_BANDAService _service;

		public ACA_SE_BANDAController(IACA_SE_BANDAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-se-banda|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_SE_BANDAParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-se-banda|R")]
		public async Task<CResult> Get([FromQuery] ACA_SE_BANDAParam Data)
			=> await _service.GetAsync(Data);

		[HttpPost]
		[Authorize(Policy = "/aca-se-banda|C")]
		public async Task<IActionResult> Post(ACA_SE_BANDATable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/aca-se-banda|U")]
		public async Task<IActionResult> Put(ACA_SE_BANDATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_BANDATable.CORR_BANDA));
			// Qué hace: no setea auditoría de actualización.
			// Cómo lo hace: la tabla no tiene USUARIO_ACTU / ESTACION_ACTU / FECHA_ACTU.
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/aca-se-banda|D")]
		public async Task<IActionResult> Delete([FromQuery] ACA_SE_BANDATable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/aca-se-banda|U")]
		public async Task<IActionResult> ActivarInactivar(ACA_SE_BANDATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_BANDATable.CORR_BANDA));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
			=> User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		private void SetCreateAudit(ACA_SE_BANDATable Data)
		{
			Data.USUARIO_CREA = Truncate(GetUsuario(), 30);
			Data.ESTACION_CREA = Truncate(ClientInfoHelper.GetClientStation(HttpContext), 30);
			Data.FECHA_CREA = DateTime.Now;
			Data.ACTIVO ??= true;
			if (Data.CORR_EMPRESA <= 0) Data.CORR_EMPRESA = 1;
			if (!string.IsNullOrWhiteSpace(Data.CODIGO_REGLA))
			{
				Data.CODIGO_REGLA = Data.CODIGO_REGLA.Trim();
			}
		}

		private static string Truncate(string value, int maxLen)
		{
			if (string.IsNullOrEmpty(value))
			{
				return value ?? string.Empty;
			}
			return value.Length > maxLen ? value.Substring(0, maxLen) : value;
		}
	}
}
