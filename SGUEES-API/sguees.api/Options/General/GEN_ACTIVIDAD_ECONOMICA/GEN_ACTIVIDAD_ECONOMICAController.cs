// Qué hace: endpoints REST del catálogo actividad económica.
// Cómo lo hace: CRUD + ActivarInactivar con auditoría por claims; conserva lookups de otros módulos.
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
	public class GEN_ACTIVIDAD_ECONOMICAController : ControllerBase
	{
		private readonly IGEN_ACTIVIDAD_ECONOMICAService _service;

		public GEN_ACTIVIDAD_ECONOMICAController(IGEN_ACTIVIDAD_ECONOMICAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-actividad-economica|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-actividad-economica|R")]
		public async Task<CResult> Get([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-actividad-economica|C")]
		public async Task<IActionResult> Post(GEN_ACTIVIDAD_ECONOMICATable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-actividad-economica|U")]
		public async Task<IActionResult> Put(GEN_ACTIVIDAD_ECONOMICATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_ACTIVIDAD_ECONOMICATable.CORR_ACTIVIDAD_ECONOMICA));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-actividad-economica|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_ACTIVIDAD_ECONOMICATable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-actividad-economica|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_ACTIVIDAD_ECONOMICATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_ACTIVIDAD_ECONOMICATable.CORR_ACTIVIDAD_ECONOMICA));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// Lookups usados por otros módulos (se mantienen).
		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO")]
		[Authorize(Policy = "/ven-documento|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_DONA")]
		[Authorize(Policy = "/ven-documento-dona|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_DONA([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_COM_DOCUMENTO")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_COM_DOCUMENTO([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DONANTE")]
		[Authorize(Policy = "/ven-donante|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DONANTE([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_NCR")]
		[Authorize(Policy = "/ven-documento-ncr|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_NCR([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_COM_JSON")]
		[Authorize(Policy = "/com-json|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_COM_JSON([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_EXPOR")]
		[Authorize(Policy = "/ven-documento-expor|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_EXPOR([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_NRE")]
		[Authorize(Policy = "/ven-documento-nre|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_NRE([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
			=> await _service.GetAllAsync(Data);

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAudit(GEN_ACTIVIDAD_ECONOMICATable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO_ACTIVIDAD_ECONOMICA ??= true;
		}

		private void SetUpdateAudit(GEN_ACTIVIDAD_ECONOMICATable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (!Data.ACTIVO_ACTIVIDAD_ECONOMICA.HasValue)
			{
				Data.ACTIVO_ACTIVIDAD_ECONOMICA = true;
			}
		}
	}
}
