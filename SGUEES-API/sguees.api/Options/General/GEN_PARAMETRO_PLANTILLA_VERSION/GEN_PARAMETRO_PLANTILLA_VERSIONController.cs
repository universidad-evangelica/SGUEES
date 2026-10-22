// Qué hace: endpoints REST para gestionar el versionamiento de plantillas de correo.
// Cómo lo hace: expone GetAll, Get, CrearVersion y ActivarVersion bajo las políticas de autorización /gen-parametro-plantilla y /gen-parametro-smtp.
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
	public class GEN_PARAMETRO_PLANTILLA_VERSIONController : ControllerBase
	{
		private readonly IGEN_PARAMETRO_PLANTILLA_VERSIONService _service;

		public GEN_PARAMETRO_PLANTILLA_VERSIONController(IGEN_PARAMETRO_PLANTILLA_VERSIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: obtiene todas las versiones de una plantilla de correo.
		// Cómo lo hace: toma CORR_EMPRESA del usuario en sesión y consulta el servicio.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PARAMETRO_PLANTILLA_VERSIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		// Qué hace: obtiene una versión específica de la plantilla de correo.
		// Cómo lo hace: consulta por empresa, plantilla y número de versión.
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|R")]
		public async Task<CResult> Get([FromQuery] GEN_PARAMETRO_PLANTILLA_VERSIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		// Qué hace: registra una nueva versión para una plantilla de correo existente.
		// Cómo lo hace: asigna CORR_EMPRESA, usuario y estación del cliente, y delega la creación al servicio.
		[HttpPost("CrearVersion")]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|C")]
		public async Task<IActionResult> CrearVersion(GEN_PARAMETRO_PLANTILLA_VERSIONTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: activa una versión específica de la plantilla desactivando las demás.
		// Cómo lo hace: toma la versión y plantilla seleccionadas e invoca ActivarVersionAsync en el servicio.
		[HttpPost("ActivarVersion")]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|U")]
		public async Task<IActionResult> ActivarVersion([FromBody] GEN_PARAMETRO_PLANTILLA_VERSIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.ActivarVersionAsync(Data.CORR_EMPRESA, Data.CORR_PARAMETRO_PLANTILLA, Data.NUMERO_VERSION, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private int GetCorrEmpresa()
		{
			return int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
		}

		private string GetUsuario()
		{
			return User.Claims.SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}
	}
}
