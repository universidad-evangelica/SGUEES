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
	public class BAN_REPORTEController : ControllerBase
	{
		private readonly IBAN_REPORTEService _service;

		public BAN_REPORTEController(IBAN_REPORTEService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetDefiniciones")]
		[Authorize]
		public async Task<CResult> GetDefiniciones()
		{
			return await _service.GetDefinicionesAsync();
		}

		[HttpPost("Consultar")]
		[Authorize]
		public async Task<IActionResult> Consultar([FromBody] BAN_REPORTEParam data)
		{
			if (data == null || string.IsNullOrWhiteSpace(data.CODIGO_REPORTE))
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Indique CODIGO_REPORTE." });
			}

			if (!BAN_REPORTEPermission.UserCanRead(User, data.CODIGO_REPORTE))
			{
				return Forbid();
			}

			data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.ConsultarAsync(data);
			return resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPost("getPDF")]
		[Authorize]
		public async Task<IActionResult> GetPDF([FromBody] BAN_REPORTEParam data)
		{
			if (data == null || string.IsNullOrWhiteSpace(data.CODIGO_REPORTE))
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "Indique CODIGO_REPORTE." });
			}

			if (!BAN_REPORTEPermission.UserCanPrint(User, data.CODIGO_REPORTE))
			{
				return Forbid();
			}

			data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? "Admin";

			try
			{
				var pdf = await _service.GetPDFAsync(data, login);

				if (pdf == null)
				{
					return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "No fue posible generar el PDF del reporte." });
				}

				Response.Headers.ContentType = "application/pdf";
				Response.Headers.ContentDisposition = "inline";
				Response.RegisterForDispose(pdf);
				return File(pdf, "application/pdf");
			}
			catch (Exception ex)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = ex.Message });
			}
		}
	}
}
