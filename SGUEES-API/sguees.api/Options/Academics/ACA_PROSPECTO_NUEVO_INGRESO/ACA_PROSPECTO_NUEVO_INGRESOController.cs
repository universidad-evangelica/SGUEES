using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using System.Security.Claims;
using sguees.api.Shared;

namespace sguees.Controllers
{
	// Qué hace: API de la solicitud de nuevo ingreso.
	// Cómo lo hace: usa el mismo servicio y la vista V_ACA_PROSPECTO que ya está en la base. No crea otra vista.
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class ACA_PROSPECTO_NUEVO_INGRESOController : ControllerBase
	{
		private readonly IACA_PROSPECTOService _service;

		public ACA_PROSPECTO_NUEVO_INGRESOController(IACA_PROSPECTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso,/aca-prospecto-academico|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso,/aca-prospecto-academico|R")]
		public async Task<CResult> Get([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetCORR_CARRERA_ACA_PROSPECTO")]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso,/aca-prospecto-academico|R")]
		public async Task<CResult> GetCORR_CARRERA_ACA_PROSPECTO([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetCORR_CARRERA_ACA_PROSPECTOAsync(Data);
		}

		[HttpGet("GetCORR_MODALIDAD_ACA_PROSPECTO")]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso,/aca-prospecto-academico|R")]
		public async Task<CResult> GetCORR_MODALIDAD_ACA_PROSPECTO([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetCORR_MODALIDAD_ACA_PROSPECTOAsync(Data);
		}

		[HttpGet("GetCICLO_ACA_PROSPECTO")]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso,/aca-prospecto-academico|R")]
		public async Task<CResult> GetCICLO_ACA_PROSPECTO([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetCICLO_ACA_PROSPECTOAsync(Data);
		}

		[HttpGet("GetVALIDAR_CAMBIO_ACA_PROSPECTO")]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso,/aca-prospecto-academico|U")]
		public async Task<CResult> GetVALIDAR_CAMBIO_ACA_PROSPECTO([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetVALIDAR_CAMBIO_ACA_PROSPECTOAsync(Data);
		}

		[HttpPut]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso,/aca-prospecto-academico|U")]
		public async Task<IActionResult> Put(ACA_PROSPECTOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_PROSPECTOTable.CORR_PROSPECTO));
			SetUpdateAudit(Data);

			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
		}

		private void SetUpdateAudit(ACA_PROSPECTOTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
