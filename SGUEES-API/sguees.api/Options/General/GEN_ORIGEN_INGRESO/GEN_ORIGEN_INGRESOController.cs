// Qué hace: endpoints REST del catálogo origen ingreso.
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
	public class GEN_ORIGEN_INGRESOController : ControllerBase
	{
		private readonly IGEN_ORIGEN_INGRESOService _service;

		public GEN_ORIGEN_INGRESOController(IGEN_ORIGEN_INGRESOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-origen-ingreso|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_ORIGEN_INGRESOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-origen-ingreso|R")]
		public async Task<CResult> Get([FromQuery] GEN_ORIGEN_INGRESOParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-origen-ingreso|C")]
		public async Task<IActionResult> Post(GEN_ORIGEN_INGRESOTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-origen-ingreso|U")]
		public async Task<IActionResult> Put(GEN_ORIGEN_INGRESOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_ORIGEN_INGRESOTable.CORR_ORIGEN_INGRESO));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-origen-ingreso|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_ORIGEN_INGRESOTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-origen-ingreso|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_ORIGEN_INGRESOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_ORIGEN_INGRESOTable.CORR_ORIGEN_INGRESO));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_ORIGEN_INGRESO_GEN_EMPLEADO")]
		[Authorize(Policy = "/gen-empleado|R")]
		// Qué hace: entrega el catálogo de origen de ingreso para el tab Personales de empleado.
		// Cómo: llama a GetAllAsync del servicio.
		public async Task<CResult> GetCORR_ORIGEN_INGRESO_GEN_EMPLEADO([FromQuery] GEN_ORIGEN_INGRESOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAudit(GEN_ORIGEN_INGRESOTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO_ORIGEN_INGRESO ??= true;
		}

		private void SetUpdateAudit(GEN_ORIGEN_INGRESOTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (!Data.ACTIVO_ORIGEN_INGRESO.HasValue)
			{
				Data.ACTIVO_ORIGEN_INGRESO = true;
			}
		}
	}
}
