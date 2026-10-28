// Qué hace: endpoints REST del catálogo opciones socioeconómico.
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
	public class ACA_SE_OPCIONController : ControllerBase
	{
		private readonly IACA_SE_OPCIONService _service;

		public ACA_SE_OPCIONController(IACA_SE_OPCIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-se-opcion|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_SE_OPCIONParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-se-opcion|R")]
		public async Task<CResult> Get([FromQuery] ACA_SE_OPCIONParam Data)
			=> await _service.GetAsync(Data);

		// Qué hace: lookup de opciones activas para el cuestionario socioeconómico.
		// Cómo lo hace: GetLookUp arma GetCORR_OPCION_ACA_PROSPECTO_ECONOMICO; permiso de esa pantalla.
		[HttpGet("GetCORR_OPCION_ACA_PROSPECTO_ECONOMICO")]
		[Authorize(Policy = "/aca-prospecto-socioeconomico|R")]
		public async Task<CResult> GetCORR_OPCION_ACA_PROSPECTO_ECONOMICO()
			=> await _service.GetOpcionesActivasAsync();

		[HttpPost]
		[Authorize(Policy = "/aca-se-opcion|C")]
		public async Task<IActionResult> Post(ACA_SE_OPCIONTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/aca-se-opcion|U")]
		public async Task<IActionResult> Put(ACA_SE_OPCIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_OPCIONTable.CORR_OPCION));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/aca-se-opcion|D")]
		public async Task<IActionResult> Delete([FromQuery] ACA_SE_OPCIONTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/aca-se-opcion|U")]
		public async Task<IActionResult> ActivarInactivar(ACA_SE_OPCIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_OPCIONTable.CORR_OPCION));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
			=> User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		private void SetCreateAudit(ACA_SE_OPCIONTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO ??= true;
		}

		private void SetUpdateAudit(ACA_SE_OPCIONTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
