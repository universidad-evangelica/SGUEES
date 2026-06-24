using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class CON_REPORTEController : ControllerBase
	{
		private readonly ICON_REPORTEService _service;

		public CON_REPORTEController(ICON_REPORTEService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetDefiniciones")]
		[Authorize]
		public async Task<CResult> GetDefiniciones()
		{
			return await _service.GetDefinicionesAsync();
		}

		[HttpGet("GetConfiReportes")]
		[Authorize]
		public async Task<CResult> GetConfiReportes()
		{
			var corrEmpresa = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetConfiReportesAsync(corrEmpresa);
		}

		[HttpPost("Consultar")]
		[Authorize]
		public async Task<IActionResult> Consultar([FromBody] CON_REPORTEParam Data)
		{
			if (Data == null || string.IsNullOrWhiteSpace(Data.CODIGO_REPORTE))
			{
				return BadRequest(new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "Indique CODIGO_REPORTE.",
				});
			}

			if (!CON_REPORTEPermission.UserCanRead(User, Data.CODIGO_REPORTE))
			{
				return Forbid();
			}

			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.ConsultarAsync(Data);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPost("getPDF")]
		[Authorize]
		public async Task<IActionResult> GetPDF([FromBody] CON_REPORTEParam Data)
		{
			if (Data == null || string.IsNullOrWhiteSpace(Data.CODIGO_REPORTE))
			{
				return BadRequest(new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "Indique CODIGO_REPORTE.",
				});
			}

			if (!CON_REPORTEPermission.UserCanPrint(User, Data.CODIGO_REPORTE))
			{
				return Forbid();
			}

			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? "Admin";
			var pdf = await _service.GetPDFAsync(Data, login);

			if (pdf == null)
			{
				return BadRequest(new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "No fue posible generar el PDF del reporte.",
				});
			}

			Response.Headers.ContentType = "application/pdf";
			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(pdf);
			return File(pdf, "application/pdf");
		}
	}
}