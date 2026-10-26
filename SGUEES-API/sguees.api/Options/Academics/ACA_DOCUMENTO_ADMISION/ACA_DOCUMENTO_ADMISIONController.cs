// Qué hace: endpoints REST del catálogo de documentos de admisión.
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
	public class ACA_DOCUMENTO_ADMISIONController : ControllerBase
	{
		private readonly IACA_DOCUMENTO_ADMISIONService _service;

		public ACA_DOCUMENTO_ADMISIONController(IACA_DOCUMENTO_ADMISIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-documento-admision|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_DOCUMENTO_ADMISIONParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-documento-admision|R")]
		public async Task<CResult> Get([FromQuery] ACA_DOCUMENTO_ADMISIONParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/aca-documento-admision|C")]
		public async Task<IActionResult> Post(ACA_DOCUMENTO_ADMISIONTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/aca-documento-admision|U")]
		public async Task<IActionResult> Put(ACA_DOCUMENTO_ADMISIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_DOCUMENTO_ADMISIONTable.CORR_DOCUMENTO_ADMISION));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/aca-documento-admision|D")]
		public async Task<IActionResult> Delete([FromQuery] ACA_DOCUMENTO_ADMISIONTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/aca-documento-admision|U")]
		public async Task<IActionResult> ActivarInactivar(ACA_DOCUMENTO_ADMISIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_DOCUMENTO_ADMISIONTable.CORR_DOCUMENTO_ADMISION));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAudit(ACA_DOCUMENTO_ADMISIONTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO ??= true;
			Data.OBLIGATORIO ??= false;
			if (Data.TAMANO_MAXIMO_MB < 1 || Data.TAMANO_MAXIMO_MB > 25)
				Data.TAMANO_MAXIMO_MB = 10;
			if (string.IsNullOrWhiteSpace(Data.FORMATOS_PERMITIDOS))
				Data.FORMATOS_PERMITIDOS = "PDF,JPG,PNG";
		}

		private void SetUpdateAudit(ACA_DOCUMENTO_ADMISIONTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
