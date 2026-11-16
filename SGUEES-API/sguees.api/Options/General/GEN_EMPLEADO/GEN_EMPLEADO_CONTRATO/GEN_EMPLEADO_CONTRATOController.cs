// Qué hace: expone los endpoints HTTP del tab Contratos en /gen-empleado.
// Cómo lo hace: gestiona consulta, plantillas activas, borrador, transición de estado (Emitir/Finalizar/Anular) y subida/lectura del archivo firmado.
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Options.General.GEN_EMPLEADO.GEN_EMPLEADO_CONTRATO;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class GEN_EMPLEADO_CONTRATOController : ControllerBase
	{
		private readonly IGEN_EMPLEADO_CONTRATOService _service;
		private readonly IWebHostEnvironment _environment;

		public GEN_EMPLEADO_CONTRATOController(IGEN_EMPLEADO_CONTRATOService service, IWebHostEnvironment environment)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
			_environment = environment ?? throw new ArgumentNullException(nameof(environment));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_EMPLEADO_CONTRATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> Get([FromQuery] GEN_EMPLEADO_CONTRATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetPlantillasActivas")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetPlantillasActivas()
		{
			return await _service.GetPlantillasActivasAsync(GetCorrEmpresa());
		}

		[HttpPost("Preview")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<IActionResult> Preview([FromBody] GEN_EMPLEADO_CONTRATOAccionParam Data)
		{
			if (Data == null)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Datos inválidos." });
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.PreviewAsync(Data);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPost("Post")]
		[Authorize(Policy = "/gen-empleado|C")]
		public async Task<IActionResult> Post([FromBody] GEN_EMPLEADO_CONTRATOAccionParam Data)
		{
			if (Data == null)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Datos inválidos." });
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.AsignarBorradorAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Put")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> Put([FromBody] GEN_EMPLEADO_CONTRATOAccionParam Data)
		{
			if (Data == null)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Datos inválidos." });
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.ActualizarBorradorAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("Emitir")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> Emitir([FromBody] GEN_EMPLEADO_CONTRATOAccionParam Data)
		{
			if (Data == null)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Datos inválidos." });
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.EmitirAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("Finalizar")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> Finalizar([FromBody] GEN_EMPLEADO_CONTRATOAccionParam Data)
		{
			if (Data == null)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Datos inválidos." });
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.FinalizarAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("Anular")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> Anular([FromBody] GEN_EMPLEADO_CONTRATOAccionParam Data)
		{
			if (Data == null)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Datos inválidos." });
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.AnularAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPost("PostDoc")]
		[Authorize(Policy = "/gen-empleado|U")]
		[RequestSizeLimit(11 * 1024 * 1024)]
		public async Task<IActionResult> PostDoc([FromForm] int CORR_EMPLEADO_CONTRATO, [FromForm] IFormFile file)
		{
			var storage = new EmpleadoContratoStorage(_environment);
			var resultado = await _service.SubirDocumentoFirmadoAsync(
				GetCorrEmpresa(),
				CORR_EMPLEADO_CONTRATO,
				file,
				storage,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetDoc")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<IActionResult> GetDoc([FromQuery] GEN_EMPLEADO_CONTRATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var storage = new EmpleadoContratoStorage(_environment);
			var (stream, fileName) = await _service.GetDocumentoFirmadoAsync(Data, storage);
			if (stream == null)
			{
				return NotFound();
			}

			var safeName = string.IsNullOrWhiteSpace(fileName) ? "contrato_firmado.pdf" : fileName;
			var contentType = EmpleadoContratoStorage.GetContentType(safeName);
			Response.Headers.ContentType = contentType;
			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(stream);

			return File(stream, contentType);
		}

		[HttpDelete("Delete")]
		[Authorize(Policy = "/gen-empleado|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_EMPLEADO_CONTRATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var storage = new EmpleadoContratoStorage(_environment);
			var resultado = await _service.DeleteBorradorAsync(Data, storage);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}
	}
}

