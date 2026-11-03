// Qué hace: endpoints REST del catálogo puntajes socioeconómico.
// Cómo lo hace: CRUD + ActivarInactivar con auditoría por claims; CORR_EMPRESA=1 si <=0.
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
	public class ACA_SE_PUNTAJEController : ControllerBase
	{
		private readonly IACA_SE_PUNTAJEService _service;

		public ACA_SE_PUNTAJEController(IACA_SE_PUNTAJEService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-se-puntaje|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_SE_PUNTAJEParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-se-puntaje|R")]
		public async Task<CResult> Get([FromQuery] ACA_SE_PUNTAJEParam Data)
			=> await _service.GetAsync(Data);

		[HttpPost]
		[Authorize(Policy = "/aca-se-puntaje|C")]
		public async Task<IActionResult> Post(ACA_SE_PUNTAJETable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/aca-se-puntaje|U")]
		public async Task<IActionResult> Put(ACA_SE_PUNTAJETable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_PUNTAJETable.CORR_PUNTAJE));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/aca-se-puntaje|D")]
		public async Task<IActionResult> Delete([FromQuery] ACA_SE_PUNTAJETable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/aca-se-puntaje|U")]
		public async Task<IActionResult> ActivarInactivar(ACA_SE_PUNTAJETable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_PUNTAJETable.CORR_PUNTAJE));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
			=> User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		private void SetCreateAudit(ACA_SE_PUNTAJETable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO ??= true;
			if (Data.CORR_EMPRESA <= 0) Data.CORR_EMPRESA = 1;
			if (Data.CORR_OPCION == null || Data.CORR_OPCION <= 0) Data.CORR_OPCION = null;
		}

		private void SetUpdateAudit(ACA_SE_PUNTAJETable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (Data.CORR_OPCION == null || Data.CORR_OPCION <= 0) Data.CORR_OPCION = null;
		}
	}
}
