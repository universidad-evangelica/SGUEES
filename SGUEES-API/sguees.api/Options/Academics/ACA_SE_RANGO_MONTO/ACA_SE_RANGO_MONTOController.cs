// Qué hace: endpoints REST del catálogo rangos de monto SE (ingresos/egresos).
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
	public class ACA_SE_RANGO_MONTOController : ControllerBase
	{
		private readonly IACA_SE_RANGO_MONTOService _service;

		public ACA_SE_RANGO_MONTOController(IACA_SE_RANGO_MONTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-se-rango-monto|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_SE_RANGO_MONTOParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-se-rango-monto|R")]
		public async Task<CResult> Get([FromQuery] ACA_SE_RANGO_MONTOParam Data)
			=> await _service.GetAsync(Data);

		[HttpPost]
		[Authorize(Policy = "/aca-se-rango-monto|C")]
		public async Task<IActionResult> Post(ACA_SE_RANGO_MONTOTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/aca-se-rango-monto|U")]
		public async Task<IActionResult> Put(ACA_SE_RANGO_MONTOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_RANGO_MONTOTable.CORR_RANGO_MONTO));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/aca-se-rango-monto|D")]
		public async Task<IActionResult> Delete([FromQuery] ACA_SE_RANGO_MONTOTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/aca-se-rango-monto|U")]
		public async Task<IActionResult> ActivarInactivar(ACA_SE_RANGO_MONTOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_RANGO_MONTOTable.CORR_RANGO_MONTO));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
			=> User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		private void SetCreateAudit(ACA_SE_RANGO_MONTOTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO ??= true;
			if (Data.CORR_EMPRESA <= 0) Data.CORR_EMPRESA = 1;
			if (!string.IsNullOrWhiteSpace(Data.DESCRIPCION)) Data.DESCRIPCION = Data.DESCRIPCION.Trim();
		}

		private void SetUpdateAudit(ACA_SE_RANGO_MONTOTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (!string.IsNullOrWhiteSpace(Data.DESCRIPCION)) Data.DESCRIPCION = Data.DESCRIPCION.Trim();
		}
	}
}
