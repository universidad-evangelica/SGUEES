// Qué hace: endpoints REST para la configuración de plantillas de correo asociadas a parámetros SMTP.
// Cómo lo hace: expone operaciones GetAll, Get, Post, Put, Delete, GetParametrosDisponibles, GetModulos y GetOpcionesPorModulo protegidas bajo las políticas /gen-parametro-plantilla y /gen-parametro-smtp.
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
	public class GEN_PARAMETRO_PLANTILLAController : ControllerBase
	{
		private readonly IGEN_PARAMETRO_PLANTILLAService _service;

		public GEN_PARAMETRO_PLANTILLAController(IGEN_PARAMETRO_PLANTILLAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: lista las plantillas de correo de la empresa actual (opcionalmente filtradas por cuenta SMTP).
		// Cómo lo hace: inyecta CORR_EMPRESA del token de sesión y llama a GetAllAsync.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PARAMETRO_PLANTILLAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		// Qué hace: obtiene una plantilla de correo específica.
		// Cómo lo hace: inyecta CORR_EMPRESA y consulta por clave o código.
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|R")]
		public async Task<CResult> Get([FromQuery] GEN_PARAMETRO_PLANTILLAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		// Qué hace: registra una nueva plantilla de correo.
		// Cómo lo hace: inyecta CORR_EMPRESA y ejecuta CreateAsync con usuario y estación.
		[HttpPost]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|C")]
		public async Task<IActionResult> Post(GEN_PARAMETRO_PLANTILLATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: actualiza una plantilla de correo existente.
		// Cómo lo hace: toma llaves de query si aplica, inyecta CORR_EMPRESA y ejecuta UpdateAsync.
		[HttpPut]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|U")]
		public async Task<IActionResult> Put(GEN_PARAMETRO_PLANTILLATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_PARAMETRO_PLANTILLATable.CORR_PARAMETRO_PLANTILLA));
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: elimina una plantilla de correo.
		// Cómo lo hace: inyecta CORR_EMPRESA y ejecuta DeleteAsync por clave.
		[HttpDelete]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_PARAMETRO_PLANTILLATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// Qué hace: devuelve la lista unificada de parámetros dinámicos institucionales y del proceso seleccionado.
		// Cómo lo hace: llama a GetParametrosDisponiblesAsync del servicio bajo la política /gen-parametro-plantilla,/gen-parametro-smtp|R.
		[HttpGet("GetParametrosDisponibles")]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|R")]
		public async Task<IActionResult> GetParametrosDisponibles([FromQuery] string codigoOpcion, [FromQuery] string codigoSistema)
		{
			var resultado = await _service.GetParametrosDisponiblesAsync(codigoOpcion, codigoSistema);
			return resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		// Qué hace: obtiene la lista de módulos / sistemas registrados a los que el usuario tiene acceso.
		// Cómo lo hace: llama a GetModulosAsync pasando el LOGIN_SISTEMA de la sesión bajo la política /gen-parametro-plantilla,/gen-parametro-smtp|R.
		[HttpGet("GetModulos")]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|R")]
		public async Task<CResult> GetModulos()
		{
			return await _service.GetModulosAsync(GetUsuario());
		}

		// Qué hace: obtiene la lista de menús / opciones vinculados al módulo seleccionado permitidos para el usuario.
		// Cómo lo hace: llama a GetOpcionesPorModuloAsync filtrando por CODIGO_SISTEMA y LOGIN_SISTEMA bajo la política /gen-parametro-plantilla,/gen-parametro-smtp|R.
		[HttpGet("GetOpcionesPorModulo")]
		[Authorize(Policy = "/gen-parametro-plantilla,/gen-parametro-smtp|R")]
		public async Task<CResult> GetOpcionesPorModulo([FromQuery] string codigoSistema)
		{
			return await _service.GetOpcionesPorModuloAsync(codigoSistema, GetUsuario());
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
