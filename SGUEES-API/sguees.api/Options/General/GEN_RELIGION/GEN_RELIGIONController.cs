// Qué hace: endpoints REST del catálogo religión.
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
	public class GEN_RELIGIONController : ControllerBase
	{
		private readonly IGEN_RELIGIONService _service;

		public GEN_RELIGIONController(IGEN_RELIGIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-religion|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_RELIGIONParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-religion|R")]
		public async Task<CResult> Get([FromQuery] GEN_RELIGIONParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetCORR_RELIGION_ACA_PROSPECTO")]
		[Authorize(Policy = "/aca-prospecto|R")]
		// Qué hace: religiones para la edición de datos personales del prospecto.
		// Cómo: llama a GetAllAsync del servicio.
		public async Task<CResult> GetCORR_RELIGION_ACA_PROSPECTO([FromQuery] GEN_RELIGIONParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-religion|C")]
		public async Task<IActionResult> Post(GEN_RELIGIONTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-religion|U")]
		public async Task<IActionResult> Put(GEN_RELIGIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_RELIGIONTable.CORR_RELIGION));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-religion|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_RELIGIONTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-religion|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_RELIGIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_RELIGIONTable.CORR_RELIGION));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAudit(GEN_RELIGIONTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO_RELIGION ??= true;
		}

		private void SetUpdateAudit(GEN_RELIGIONTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (!Data.ACTIVO_RELIGION.HasValue)
			{
				Data.ACTIVO_RELIGION = true;
			}
		}
	}
}
