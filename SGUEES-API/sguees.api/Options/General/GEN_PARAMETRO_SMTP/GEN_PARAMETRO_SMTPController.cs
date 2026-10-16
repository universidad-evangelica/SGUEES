// Qué hace: endpoints REST para la configuración de parámetros SMTP.
// Cómo lo hace: expone operaciones GetAll, Get, Post, Put y Delete protegidas con políticas de seguridad basadas en claims.
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
	public class GEN_PARAMETRO_SMTPController : ControllerBase
	{
		private readonly IGEN_PARAMETRO_SMTPService _service;

		public GEN_PARAMETRO_SMTPController(IGEN_PARAMETRO_SMTPService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: lista los parámetros SMTP de la empresa actual.
		// Cómo lo hace: inyecta CORR_EMPRESA desde el token y consulta GetAllAsync.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-parametro-smtp|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PARAMETRO_SMTPParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		// Qué hace: obtiene un registro específico de parámetros SMTP.
		// Cómo lo hace: inyecta CORR_EMPRESA y consulta por clave.
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-parametro-smtp|R")]
		public async Task<CResult> Get([FromQuery] GEN_PARAMETRO_SMTPParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		// Qué hace: crea un nuevo registro de configuración SMTP.
		// Cómo lo hace: asigna empresa del usuario e inserta vía servicio con usuario y estación.
		[HttpPost]
		[Authorize(Policy = "/gen-parametro-smtp|C")]
		public async Task<IActionResult> Post(GEN_PARAMETRO_SMTPTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: actualiza la configuración SMTP existente.
		// Cómo lo hace: toma la clave de ruta/query si aplica, asigna empresa y actualiza vía servicio.
		[HttpPut]
		[Authorize(Policy = "/gen-parametro-smtp|U")]
		public async Task<IActionResult> Put(GEN_PARAMETRO_SMTPTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_PARAMETRO_SMTPTable.CORR_PARAMETRO_SMTP));
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: elimina una configuración SMTP.
		// Cómo lo hace: inyecta empresa y ejecuta eliminación por clave compuesta.
		[HttpDelete]
		[Authorize(Policy = "/gen-parametro-smtp|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_PARAMETRO_SMTPTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
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
