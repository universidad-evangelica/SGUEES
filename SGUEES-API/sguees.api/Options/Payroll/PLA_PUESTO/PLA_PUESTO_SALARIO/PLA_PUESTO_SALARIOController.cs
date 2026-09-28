// Qué hace: endpoints de salarios del puesto (tab Salarios de pla-puesto).
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class PLA_PUESTO_SALARIOController : ControllerBase
	{
		private readonly IPLA_PUESTO_SALARIOService _service;

		public PLA_PUESTO_SALARIOController(IPLA_PUESTO_SALARIOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/pla-puesto|R")]
		public async Task<CResult> GetAll([FromQuery] PLA_PUESTO_SALARIOParam Data)
		{
			return await _service.GetAllAsync(Data, GetCorrEmpresa());
		}

		[HttpPost]
		[Authorize(Policy = "/pla-puesto|U")]
		public async Task<IActionResult> Post(PLA_PUESTO_SALARIOTable Data)
		{
			var resultado = await _service.CreateAsync(
				Data,
				GetCorrEmpresa(),
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/pla-puesto|U")]
		public async Task<IActionResult> Put(PLA_PUESTO_SALARIOTable Data)
		{
			var resultado = await _service.UpdateAsync(
				Data,
				GetCorrEmpresa(),
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/pla-puesto|U")]
		public async Task<IActionResult> Delete([FromQuery] PLA_PUESTO_SALARIOTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetCorrEmpresa());
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}
	}
}
