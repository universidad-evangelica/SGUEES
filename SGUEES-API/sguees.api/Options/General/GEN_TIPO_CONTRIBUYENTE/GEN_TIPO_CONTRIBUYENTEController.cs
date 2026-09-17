// Qué hace: endpoints REST del catálogo tipo contribuyente.
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
	public class GEN_TIPO_CONTRIBUYENTEController : ControllerBase
	{
		private readonly IGEN_TIPO_CONTRIBUYENTEService _service;

		public GEN_TIPO_CONTRIBUYENTEController(IGEN_TIPO_CONTRIBUYENTEService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-tipo-contribuyente|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_TIPO_CONTRIBUYENTEParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-tipo-contribuyente|R")]
		public async Task<CResult> Get([FromQuery] GEN_TIPO_CONTRIBUYENTEParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-tipo-contribuyente|C")]
		public async Task<IActionResult> Post(GEN_TIPO_CONTRIBUYENTETable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-tipo-contribuyente|U")]
		public async Task<IActionResult> Put(GEN_TIPO_CONTRIBUYENTETable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_TIPO_CONTRIBUYENTETable.CORR_TIPO_CONTRIBUYENTE));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-tipo-contribuyente|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_TIPO_CONTRIBUYENTETable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-tipo-contribuyente|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_TIPO_CONTRIBUYENTETable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_TIPO_CONTRIBUYENTETable.CORR_TIPO_CONTRIBUYENTE));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAudit(GEN_TIPO_CONTRIBUYENTETable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO_TIPO_CONTRIBUYENTE ??= true;
		}

		private void SetUpdateAudit(GEN_TIPO_CONTRIBUYENTETable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (!Data.ACTIVO_TIPO_CONTRIBUYENTE.HasValue)
			{
				Data.ACTIVO_TIPO_CONTRIBUYENTE = true;
			}
		}
	}
}
