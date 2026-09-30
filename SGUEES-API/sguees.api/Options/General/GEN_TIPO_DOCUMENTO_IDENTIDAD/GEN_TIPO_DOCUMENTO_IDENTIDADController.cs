// Qué hace: endpoints REST del catálogo tipo documento identidad.
// Cómo lo hace: CRUD + ActivarInactivar con auditoría por claims (sin empresa).
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
	public class GEN_TIPO_DOCUMENTO_IDENTIDADController : ControllerBase
	{
		private readonly IGEN_TIPO_DOCUMENTO_IDENTIDADService _service;

		public GEN_TIPO_DOCUMENTO_IDENTIDADController(IGEN_TIPO_DOCUMENTO_IDENTIDADService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-tipo-documento-identidad|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_TIPO_DOCUMENTO_IDENTIDADParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-tipo-documento-identidad|R")]
		public async Task<CResult> Get([FromQuery] GEN_TIPO_DOCUMENTO_IDENTIDADParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-tipo-documento-identidad|C")]
		public async Task<IActionResult> Post(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-tipo-documento-identidad|U")]
		public async Task<IActionResult> Put(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_TIPO_DOCUMENTO_IDENTIDADTable.CORR_TIPO_DOCUMENTO_IDENTIDAD));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-tipo-documento-identidad|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_TIPO_DOCUMENTO_IDENTIDADTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-tipo-documento-identidad|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_TIPO_DOCUMENTO_IDENTIDADTable.CORR_TIPO_DOCUMENTO_IDENTIDAD));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAudit(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO_TIPO_DOCUMENTO_IDENTIDAD ??= true;
			Data.ACTIVO_CARACTERES ??= false;
			Data.NUMERO_CARACTERES ??= 0;
			Data.FORMATO_CARACTERES ??= string.Empty;
			Data.APLICA_PARA ??= string.Empty;
		}

		private void SetUpdateAudit(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (!Data.ACTIVO_TIPO_DOCUMENTO_IDENTIDAD.HasValue)
			{
				Data.ACTIVO_TIPO_DOCUMENTO_IDENTIDAD = true;
			}
			if (!Data.ACTIVO_CARACTERES.HasValue)
			{
				Data.ACTIVO_CARACTERES = false;
			}
			if (!Data.NUMERO_CARACTERES.HasValue)
			{
				Data.NUMERO_CARACTERES = 0;
			}
			Data.FORMATO_CARACTERES ??= string.Empty;
			Data.APLICA_PARA ??= string.Empty;
		}
	}
}
