// Qué hace: endpoints REST del catálogo AFP.
// Cómo lo hace: CRUD + ActivarInactivar con auditoría por claims (sin empresa).
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class PLA_AFPController : ControllerBase
	{
		private readonly IPLA_AFPService _service;

		public PLA_AFPController(IPLA_AFPService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/pla-afp|R")]
		public async Task<CResult> GetAll([FromQuery] PLA_AFPParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/pla-afp|R")]
		public async Task<CResult> Get([FromQuery] PLA_AFPParam Data)
		{
			return await _service.GetAsync(Data);
		}

		// Qué hace: lookup AFP activo para gen-empleado (Personales).
		[HttpGet("GetCORR_AFP_GEN_EMPLEADO")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetCORR_AFP_GEN_EMPLEADO([FromQuery] PLA_AFPParam Data)
		{
			var resultado = await _service.GetAllAsync(Data ?? new PLA_AFPParam());
			if (resultado.Result && resultado.Data is System.Collections.IEnumerable rows)
			{
				var activos = rows.Cast<PLA_AFPView>().Where(x => x.ACTIVO_AFP == true).ToList();
				resultado.Data = activos;
				resultado.RowsAffected = activos.Count;
			}
			return resultado;
		}

		[HttpPost]
		[Authorize(Policy = "/pla-afp|C")]
		public async Task<IActionResult> Post(PLA_AFPTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/pla-afp|U")]
		public async Task<IActionResult> Put(PLA_AFPTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(PLA_AFPTable.CORR_AFP));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/pla-afp|D")]
		public async Task<IActionResult> Delete([FromQuery] PLA_AFPTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/pla-afp|U")]
		public async Task<IActionResult> ActivarInactivar(PLA_AFPTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(PLA_AFPTable.CORR_AFP));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAudit(PLA_AFPTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.INCLUYE_SEPP ??= false;
			Data.ACTIVO_AFP ??= true;
		}

		private void SetUpdateAudit(PLA_AFPTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			Data.INCLUYE_SEPP ??= false;
			if (!Data.ACTIVO_AFP.HasValue)
			{
				Data.ACTIVO_AFP = true;
			}
		}
	}
}
