using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models.Socioeconomico;
using sguees.Services.Socioeconomico;
using System.Security.Claims;
using sguees.api.Shared;

namespace sguees.Controllers.Socioeconomico
{
	// Qué hace: encabezado ACA_PROSPECTO de la solicitud socioeconómica.
	// Cómo lo hace: lee y actualiza V_ACA_PROSPECTO / ACA_PROSPECTO. La ruta sigue siendo ACA_PROSPECTO_ECONOMICO, que es la que llama la pantalla.
	[Authorize]
	[Route("ACA_PROSPECTO_ECONOMICO")]
	[ApiController]
	public class ACA_PROSPECTOController : ControllerBase
	{
		private readonly IACA_PROSPECTOService _service;

		public ACA_PROSPECTOController(IACA_PROSPECTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-prospecto-socioeconomico|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-prospecto-socioeconomico|R")]
		public async Task<CResult> Get([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetCORR_CARRERA_ACA_PROSPECTO_ECONOMICO")]
		[Authorize(Policy = "/aca-prospecto-socioeconomico|R")]
		public async Task<CResult> GetCORR_CARRERA_ACA_PROSPECTO_ECONOMICO([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetCORR_CARRERA_ACA_PROSPECTOAsync(Data);
		}

		[HttpGet("GetCORR_MODALIDAD_ACA_PROSPECTO_ECONOMICO")]
		[Authorize(Policy = "/aca-prospecto-socioeconomico|R")]
		public async Task<CResult> GetCORR_MODALIDAD_ACA_PROSPECTO_ECONOMICO([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetCORR_MODALIDAD_ACA_PROSPECTOAsync(Data);
		}

		[HttpGet("GetCICLO_ACA_PROSPECTO_ECONOMICO")]
		[Authorize(Policy = "/aca-prospecto-socioeconomico|R")]
		public async Task<CResult> GetCICLO_ACA_PROSPECTO_ECONOMICO([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetCICLO_ACA_PROSPECTOAsync(Data);
		}

		// Qué hace: consecuencias de cambiar ciclo o carrera antes de guardar.
		// Cómo lo hace: el mismo servicio del encabezado, con el permiso de esta pantalla.
		[HttpGet("GetVALIDAR_CAMBIO_ACA_PROSPECTO_ECONOMICO")]
		[Authorize(Policy = "/aca-prospecto-socioeconomico|U")]
		public async Task<CResult> GetVALIDAR_CAMBIO_ACA_PROSPECTO_ECONOMICO([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetVALIDAR_CAMBIO_ACA_PROSPECTOAsync(Data);
		}

		[HttpPut]
		[Authorize(Policy = "/aca-prospecto-socioeconomico|U")]
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
