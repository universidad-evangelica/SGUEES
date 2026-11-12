// Qué hace: endpoints REST del catálogo plantillas de contrato.
// Cómo lo hace: expone GetAll, Get, Post, Put y Delete bajo la política /gen-plantilla-contrato y sella auditoría desde claims.
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
	public class GEN_PLANTILLA_CONTRATOController : ControllerBase
	{
		private readonly IGEN_PLANTILLA_CONTRATOService _service;

		public GEN_PLANTILLA_CONTRATOController(IGEN_PLANTILLA_CONTRATOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: lista todas las plantillas de contrato de la empresa en sesión.
		// Cómo lo hace: inyecta CORR_EMPRESA desde claims y llama a GetAllAsync.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-plantilla-contrato|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PLANTILLA_CONTRATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		// Qué hace: obtiene una plantilla de contrato por su correlativo.
		// Cómo lo hace: inyecta CORR_EMPRESA desde claims y llama a GetAsync.
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-plantilla-contrato|R")]
		public async Task<CResult> Get([FromQuery] GEN_PLANTILLA_CONTRATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		// Qué hace: registra una nueva plantilla de contrato.
		// Cómo lo hace: completa auditoría y empresa de sesión con SetCreateAudit y llama a CreateAsync.
		[HttpPost]
		[Authorize(Policy = "/gen-plantilla-contrato|C")]
		public async Task<IActionResult> Post(GEN_PLANTILLA_CONTRATOTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: actualiza una plantilla de contrato existente.
		// Cómo lo hace: copia la clave de query, sella auditoría con SetUpdateAudit y llama a UpdateAsync.
		[HttpPut]
		[Authorize(Policy = "/gen-plantilla-contrato|U")]
		public async Task<IActionResult> Put(GEN_PLANTILLA_CONTRATOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_PLANTILLA_CONTRATOTable.CORR_PLANTILLA_CONTRATO));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: elimina una plantilla de contrato.
		// Cómo lo hace: inyecta CORR_EMPRESA desde claims y llama a DeleteAsync.
		[HttpDelete]
		[Authorize(Policy = "/gen-plantilla-contrato|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_PLANTILLA_CONTRATOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// Qué hace: entrega el catálogo agrupado de parámetros disponibles para redactar contratos.
		// Cómo lo hace: llama a GetParametrosDisponibles del servicio bajo la política de lectura del módulo.
		[HttpGet("GetParametrosDisponibles")]
		[Authorize(Policy = "/gen-plantilla-contrato|R")]
		public CResult GetParametrosDisponibles()
		{
			return _service.GetParametrosDisponibles();
		}

		// Qué hace: obtiene el historial completo de versiones de una plantilla de contrato.
		// Cómo lo hace: inyecta CORR_EMPRESA desde claims y consulta GetVersionesAsync del servicio.
		[HttpGet("GetVersiones")]
		[Authorize(Policy = "/gen-plantilla-contrato|R")]
		public async Task<CResult> GetVersiones([FromQuery] GEN_PLANTILLA_CONTRATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetVersionesAsync(Data);
		}

		// Qué hace: crea una nueva versión v2+ a partir de v1 y la establece como versión activa.
		// Cómo lo hace: asigna empresa desde claims y delega en CrearVersionAsync con usuario y estación HTTP.
		[HttpPost("CrearVersion")]
		[Authorize(Policy = "/gen-plantilla-contrato|U")]
		public async Task<IActionResult> CrearVersion([FromBody] GEN_PLANTILLA_CONTRATO_VERSIONParam Data)
		{
			if (Data != null)
			{
				Data.CORR_EMPRESA = GetCorrEmpresa();
			}
			var resultado = await _service.CrearVersionAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: actualiza el contenido HTML de la versión v2+ activa.
		// Cómo lo hace: asigna empresa desde claims y delega en ActualizarVersionAsync con usuario y estación HTTP.
		[HttpPost("ActualizarVersion")]
		[Authorize(Policy = "/gen-plantilla-contrato|U")]
		public async Task<IActionResult> ActualizarVersion([FromBody] GEN_PLANTILLA_CONTRATO_VERSIONParam Data)
		{
			if (Data != null)
			{
				Data.CORR_EMPRESA = GetCorrEmpresa();
			}
			var resultado = await _service.ActualizarVersionAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// Qué hace: establece una versión histórica v2+ como versión activa de la plantilla.
		// Cómo lo hace: asigna empresa desde claims y delega en ActivarVersionAsync con usuario y estación HTTP.
		[HttpPost("ActivarVersion")]
		[Authorize(Policy = "/gen-plantilla-contrato|U")]
		public async Task<IActionResult> ActivarVersion([FromBody] GEN_PLANTILLA_CONTRATO_VERSIONParam Data)
		{
			if (Data != null)
			{
				Data.CORR_EMPRESA = GetCorrEmpresa();
			}
			var resultado = await _service.ActivarVersionAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// Qué hace: obtiene la bitácora cronológica de cambios de una plantilla de contrato.
		// Cómo lo hace: inyecta CORR_EMPRESA desde claims y consulta GetBitacoraAsync del servicio.
		[HttpGet("GetBitacora")]
		[Authorize(Policy = "/gen-plantilla-contrato|R")]
		public async Task<CResult> GetBitacora([FromQuery] GEN_PLANTILLA_CONTRATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetBitacoraAsync(Data);
		}

		// Qué hace: obtiene la empresa del usuario autenticado.
		// Cómo lo hace: lee y convierte el claim CORR_EMPRESA de la sesión.
		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		// Qué hace: obtiene el login del usuario autenticado.
		// Cómo lo hace: lee el claim NameIdentifier del token JWT.
		private string GetUsuario()
		{
			return User.Claims.FirstOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		// Qué hace: asigna empresa y campos de auditoría inicial en creación.
		// Cómo lo hace: toma usuario, estación HTTP y fecha/hora del servidor.
		private void SetCreateAudit(GEN_PLANTILLA_CONTRATOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}

		// Qué hace: asigna empresa y campos de auditoría de actualización.
		// Cómo lo hace: actualiza usuario, estación HTTP y fecha/hora del servidor.
		private void SetUpdateAudit(GEN_PLANTILLA_CONTRATOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}

