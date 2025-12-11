using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using System.Security.Claims;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class COM_JSONController : ControllerBase
	{
		private readonly ICOM_JSONService _service;
		
		public COM_JSONController(ICOM_JSONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpPost("COM_JSON_GENERAR_CCFE")]
		[Authorize(Policy = "/com-documento|C")]
		public async Task<IActionResult> COM_JSON_GENERAR_CCFE(COM_JSON_DTE_CCFE Data)
		{
			var CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.COM_JSON_GENERAR_CCFE(Data,CORR_EMPRESA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpPost("COM_JSON_GENERAR_FE")]
		[Authorize(Policy = "/com-documento|C")]
		public async Task<IActionResult> COM_JSON_GENERAR_FE(COM_JSON_DTE_FE Data)
		{
			var CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.COM_JSON_GENERAR_FE(Data,CORR_EMPRESA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpPost("PostPDF")]
		[Authorize(Policy = "/com-documento|C")]
		public async Task<IActionResult> PostPDF([FromForm] COM_JSON_DOC_PDFTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			// Data.CODIGO_SUITE = User.Claims.ToList().SingleOrDefault(e => e.Type == "CODIGO_SUITE").Value;
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			var resultado = await _service.PostPDFAsync(Data,Data.CORR_EMPRESA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpGet("getDoc")]
		[Authorize(Policy = "/com-documento|P")]
		public async Task<Stream> getDoc([FromQuery] COM_JSON_DOCParam Data)
		{
			Stream vDoc = null;
			vDoc = await _service.GetDocAsync(Data);

			// Determinar el contenido
			Response.Headers.ContentType = "application/pdf";
			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(vDoc);

			return vDoc;
		}

		[HttpPost("PostDoc")]
		[Authorize(Policy = "/com-documento|C")]
		public async Task<IActionResult> PostDoc([FromForm] COM_JSON_DOC_PDFTable Data)
		{
			Data.CORR_SUSCRIPCION = 8;
			Data.CORR_CONFI_PAIS = 1;
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;

			var resultado = await _service.CreateDocAsync(Data, Data.USUARIO_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return StatusCode(202, resultado);
			}
		}
		
		[HttpPost("COM_JSON_GENERAR_DCLE")]
		[Authorize(Policy = "/com-documento|C")]
		public async Task<IActionResult> COM_JSON_GENERAR_DCLE(COM_JSON_DTE_DCLE Data)
		{
			var CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.COM_JSON_GENERAR_DCLE(Data, CORR_EMPRESA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
	}
}
