// Qué hace: endpoints REST del catálogo Seguro Social.
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
	public class PLA_SEGURO_SOCIALController : ControllerBase
	{
		private readonly IPLA_SEGURO_SOCIALService _service;

		public PLA_SEGURO_SOCIALController(IPLA_SEGURO_SOCIALService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/pla-seguro-social|R")]
		public async Task<CResult> GetAll([FromQuery] PLA_SEGURO_SOCIALParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/pla-seguro-social|R")]
		public async Task<CResult> Get([FromQuery] PLA_SEGURO_SOCIALParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/pla-seguro-social|C")]
		public async Task<IActionResult> Post(PLA_SEGURO_SOCIALTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/pla-seguro-social|U")]
		public async Task<IActionResult> Put(PLA_SEGURO_SOCIALTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(PLA_SEGURO_SOCIALTable.CORR_SEGURO_SOCIAL));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/pla-seguro-social|D")]
		public async Task<IActionResult> Delete([FromQuery] PLA_SEGURO_SOCIALTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/pla-seguro-social|U")]
		public async Task<IActionResult> ActivarInactivar(PLA_SEGURO_SOCIALTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(PLA_SEGURO_SOCIALTable.CORR_SEGURO_SOCIAL));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAudit(PLA_SEGURO_SOCIALTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO_SEGURO_SOCIAL ??= true;
		}

		private void SetUpdateAudit(PLA_SEGURO_SOCIALTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (!Data.ACTIVO_SEGURO_SOCIAL.HasValue)
			{
				Data.ACTIVO_SEGURO_SOCIAL = true;
			}
		}
	}
}
