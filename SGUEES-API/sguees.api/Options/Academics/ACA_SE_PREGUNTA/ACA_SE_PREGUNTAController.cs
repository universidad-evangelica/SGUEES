// Qué hace: endpoints REST del catálogo preguntas socioeconómico.
// Cómo lo hace: CRUD + ActivarInactivar con auditoría por claims (sin empresa). Lookup de tipo en GEN_SE_TIPO_PREGUNTA.
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
	public class ACA_SE_PREGUNTAController : ControllerBase
	{
		private readonly IACA_SE_PREGUNTAService _service;

		public ACA_SE_PREGUNTAController(IACA_SE_PREGUNTAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-se-pregunta|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_SE_PREGUNTAParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-se-pregunta|R")]
		public async Task<CResult> Get([FromQuery] ACA_SE_PREGUNTAParam Data)
			=> await _service.GetAsync(Data);

		// Qué hace: lookup de preguntas activas para el mantenimiento preguntas por versión.
		// Cómo lo hace: GetLookUp arma GetCORR_PREGUNTA_ACA_SE_VERSION_PREGUNTA; permiso de esa pantalla.
		[HttpGet("GetCORR_PREGUNTA_ACA_SE_VERSION_PREGUNTA")]
		[Authorize(Policy = "/aca-se-version-pregunta|R")]
		public async Task<CResult> GetCORR_PREGUNTA_ACA_SE_VERSION_PREGUNTA()
			=> await _service.GetPreguntasActivasAsync();

		[HttpPost]
		[Authorize(Policy = "/aca-se-pregunta|C")]
		public async Task<IActionResult> Post(ACA_SE_PREGUNTATable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/aca-se-pregunta|U")]
		public async Task<IActionResult> Put(ACA_SE_PREGUNTATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_PREGUNTATable.CORR_PREGUNTA));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/aca-se-pregunta|D")]
		public async Task<IActionResult> Delete([FromQuery] ACA_SE_PREGUNTATable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/aca-se-pregunta|U")]
		public async Task<IActionResult> ActivarInactivar(ACA_SE_PREGUNTATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_PREGUNTATable.CORR_PREGUNTA));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
			=> User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		private void SetCreateAudit(ACA_SE_PREGUNTATable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO ??= true;
			if (string.IsNullOrWhiteSpace(Data.AYUDA))
			{
				Data.AYUDA = null;
			}
		}

		private void SetUpdateAudit(ACA_SE_PREGUNTATable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (string.IsNullOrWhiteSpace(Data.AYUDA))
			{
				Data.AYUDA = null;
			}
		}
	}
}
