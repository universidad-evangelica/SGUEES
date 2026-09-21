// Qué hace: endpoints anidados de documentos de identidad (tab Documentos de gen-empleado).
// Cómo lo hace: GetAll merge; Put SaveAll con lista Table + CORR_PERSONA en query (estándar).
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
	public class GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADController : ControllerBase
	{
		private readonly IGEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADService _service;

		public GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADController(IGEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: lista tipos activos + valor de la persona.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADParam Data)
		{
			return await _service.GetAllAsync(Data, GetCorrEmpresa());
		}

		// Qué hace: guarda documentos de identidad (insert/update/delete vacío).
		// Cómo: body = List<Table>; CORR_PERSONA en query (sin DTO Save especial).
		[HttpPut("SaveAll")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> SaveAll(
			[FromQuery] GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADParam filter,
			[FromBody] List<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADTable> Data)
		{
			var resultado = await _service.SaveAllAsync(
				filter?.CORR_PERSONA ?? 0,
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
