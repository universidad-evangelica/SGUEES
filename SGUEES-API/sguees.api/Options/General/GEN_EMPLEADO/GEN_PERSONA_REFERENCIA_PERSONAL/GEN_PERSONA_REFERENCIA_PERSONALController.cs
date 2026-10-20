// Qué hace: endpoints anidados de referencias personales (tab gen-empleado).
// Cómo lo hace: GetAll por persona; Put SaveAll con lista Table + CORR_PERSONA en query.
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
	public class GEN_PERSONA_REFERENCIA_PERSONALController : ControllerBase
	{
		private readonly IGEN_PERSONA_REFERENCIA_PERSONALService _service;

		public GEN_PERSONA_REFERENCIA_PERSONALController(IGEN_PERSONA_REFERENCIA_PERSONALService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: lista referencias personales de la persona.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PERSONA_REFERENCIA_PERSONALParam Data)
		{
			return await _service.GetAllAsync(Data, GetCorrEmpresa());
		}

		// Qué hace: guarda referencias personales (insert/update/delete sync de la lista).
		[HttpPut("SaveAll")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> SaveAll(
			[FromQuery] GEN_PERSONA_REFERENCIA_PERSONALParam filter,
			[FromBody] List<GEN_PERSONA_REFERENCIA_PERSONALTable> Data)
		{
			var corrPersona = filter?.CORR_PERSONA ?? 0;
			if (corrPersona <= 0 && Data != null)
			{
				corrPersona = Data.Where(x => x != null && x.CORR_PERSONA > 0)
					.Select(x => x.CORR_PERSONA)
					.FirstOrDefault();
			}

			var resultado = await _service.SaveAllAsync(
				corrPersona,
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
