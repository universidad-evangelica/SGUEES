// Qué hace: endpoints anidados de puestos (tab Puestos de gen-empleado).
using System;
using System.Collections.Generic;
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
	public class GEN_EMPLEADO_PUESTOController : ControllerBase
	{
		private readonly IGEN_EMPLEADO_PUESTOService _service;

		public GEN_EMPLEADO_PUESTOController(IGEN_EMPLEADO_PUESTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_EMPLEADO_PUESTOParam Data)
		{
			return await _service.GetAllAsync(Data, GetCorrEmpresa());
		}

		[HttpPut("SaveAll")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> SaveAll(
			[FromQuery] GEN_EMPLEADO_PUESTOParam filter,
			[FromBody] List<GEN_EMPLEADO_PUESTOTable> Data)
		{
			var corrEmpleado = filter?.CORR_EMPLEADO ?? 0;
			if (corrEmpleado <= 0 && Data != null)
			{
				corrEmpleado = Data.Where(x => x != null && x.CORR_EMPLEADO > 0)
					.Select(x => x.CORR_EMPLEADO)
					.FirstOrDefault();
			}

			var resultado = await _service.SaveAllAsync(
				corrEmpleado,
				Data,
				GetCorrEmpresa(),
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
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
