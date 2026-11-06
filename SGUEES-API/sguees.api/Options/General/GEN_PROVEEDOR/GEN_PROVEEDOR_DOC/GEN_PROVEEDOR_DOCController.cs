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
	public class GEN_PROVEEDOR_DOCController : ControllerBase
	{
		private readonly IGEN_PROVEEDOR_DOCService _service;

		public GEN_PROVEEDOR_DOCController(IGEN_PROVEEDOR_DOCService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-proveedor|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PROVEEDOR_DOCParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-proveedor|R")]
		public async Task<CResult> Get([FromQuery] GEN_PROVEEDOR_DOCParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost("PostDoc")]
		[Authorize(Policy = "/gen-proveedor|C")]
		[RequestSizeLimit(11 * 1024 * 1024)]
		public async Task<IActionResult> PostDoc([FromForm] GEN_PROVEEDOR_DOCTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var usuario = GetUsuario();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.UploadAsync(Data, usuario, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-proveedor|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_PROVEEDOR_DOCTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetDoc")]
		[Authorize(Policy = "/gen-proveedor|R")]
		public async Task<IActionResult> GetDoc([FromQuery] GEN_PROVEEDOR_DOCParam Data, [FromQuery] bool download = false)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var stream = await _service.GetDocAsync(Data);
			if (stream == null)
			{
				return NotFound();
			}

			var fileName = string.IsNullOrWhiteSpace(Data.NOMBRE_ARCHIVO)
				? "documento"
				: System.IO.Path.GetFileName(Data.NOMBRE_ARCHIVO.Trim());
			var contentType = ProveedorDocumentoStorage.GetContentType(fileName);
			Response.RegisterForDispose(stream);

			if (download)
			{
				return File(stream, contentType, fileName);
			}

			Response.Headers.ContentDisposition = $"inline; filename=\"{fileName.Replace("\"", string.Empty)}\"";
			return File(stream, contentType);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private bool ValidateEmpresaSesion(out CResult resultado)
		{
			if (GetCorrEmpresa() > 0)
			{
				resultado = null;
				return true;
			}

			resultado = new CResult
			{
				Data = null,
				Result = false,
				ErrorCode = 4100,
				ErrorMessage = "No se pudo completar la operación porque su usuario no tiene una empresa asignada.",
				ErrorSource = "[GEN_PROVEEDOR_DOCController]",
				RowsAffected = 0,
			};
			return false;
		}

		private string GetUsuario() =>
			User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;
	}
}
