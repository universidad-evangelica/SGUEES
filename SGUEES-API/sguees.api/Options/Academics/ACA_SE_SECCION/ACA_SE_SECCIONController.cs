// Qué hace: endpoints REST de secciones SE (embebidas en mantenimiento de versión).
// Cómo lo hace: CRUD + ActivarInactivar con policy de /aca-se-version.
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
	public class ACA_SE_SECCIONController : ControllerBase
	{
		private readonly IACA_SE_SECCIONService _service;

		public ACA_SE_SECCIONController(IACA_SE_SECCIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-se-version|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_SE_SECCIONParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-se-version|R")]
		public async Task<CResult> Get([FromQuery] ACA_SE_SECCIONParam Data)
			=> await _service.GetAsync(Data);

		// Qué hace: lookup de secciones para asociar pregunta a versión+sección.
		// Cómo lo hace: GetLookUp arma GetCORR_SECCION_SE_ACA_SE_VERSION_PREGUNTA; policy de esa pantalla.
		[HttpGet("GetCORR_SECCION_SE_ACA_SE_VERSION_PREGUNTA")]
		[Authorize(Policy = "/aca-se-version-pregunta|R")]
		public async Task<CResult> GetCORR_SECCION_SE_ACA_SE_VERSION_PREGUNTA()
			=> await _service.GetSeccionesLookUpAsync();

		// Qué hace: lookup de secciones RANGO_MONTO para el catálogo de rangos.
		// Cómo lo hace: GetLookUp arma GetCORR_SECCION_SE_ACA_SE_RANGO_MONTO; filtra TIPO_EVALUACION.
		[HttpGet("GetCORR_SECCION_SE_ACA_SE_RANGO_MONTO")]
		[Authorize(Policy = "/aca-se-rango-monto|R")]
		public async Task<CResult> GetCORR_SECCION_SE_ACA_SE_RANGO_MONTO()
			=> await _service.GetSeccionesRangoMontoLookUpAsync();

		[HttpPost]
		[Authorize(Policy = "/aca-se-version|C")]
		public async Task<IActionResult> Post(ACA_SE_SECCIONTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/aca-se-version|U")]
		public async Task<IActionResult> Put(ACA_SE_SECCIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_SECCIONTable.CORR_SECCION_SE));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/aca-se-version|D")]
		public async Task<IActionResult> Delete([FromQuery] ACA_SE_SECCIONTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/aca-se-version|U")]
		public async Task<IActionResult> ActivarInactivar(ACA_SE_SECCIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(ACA_SE_SECCIONTable.CORR_SECCION_SE));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
			=> User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		private void SetCreateAudit(ACA_SE_SECCIONTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO ??= true;
			if (Data.CORR_EMPRESA <= 0) Data.CORR_EMPRESA = 1;
			if (string.IsNullOrWhiteSpace(Data.DESCRIPCION)) Data.DESCRIPCION = null;
			if (!string.IsNullOrWhiteSpace(Data.CODIGO)) Data.CODIGO = Data.CODIGO.Trim();
			if (!string.IsNullOrWhiteSpace(Data.NOMBRE_SECCION)) Data.NOMBRE_SECCION = Data.NOMBRE_SECCION.Trim();
			Data.TIPO_EVALUACION = string.IsNullOrWhiteSpace(Data.TIPO_EVALUACION)
				? "PREGUNTA"
				: Data.TIPO_EVALUACION.Trim().ToUpperInvariant();
		}

		private void SetUpdateAudit(ACA_SE_SECCIONTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (string.IsNullOrWhiteSpace(Data.DESCRIPCION)) Data.DESCRIPCION = null;
			if (!string.IsNullOrWhiteSpace(Data.CODIGO)) Data.CODIGO = Data.CODIGO.Trim();
			if (!string.IsNullOrWhiteSpace(Data.NOMBRE_SECCION)) Data.NOMBRE_SECCION = Data.NOMBRE_SECCION.Trim();
			if (!string.IsNullOrWhiteSpace(Data.TIPO_EVALUACION))
				Data.TIPO_EVALUACION = Data.TIPO_EVALUACION.Trim().ToUpperInvariant();
		}
	}
}
