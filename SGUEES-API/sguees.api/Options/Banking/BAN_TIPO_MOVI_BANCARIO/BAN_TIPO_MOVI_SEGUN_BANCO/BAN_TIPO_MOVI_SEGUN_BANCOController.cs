using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using eFramework.Core;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class BAN_TIPO_MOVI_SEGUN_BANCOController : ControllerBase
	{
		private readonly IBAN_TIPO_MOVI_SEGUN_BANCARIAService _service;

		public BAN_TIPO_MOVI_SEGUN_BANCOController(IBAN_TIPO_MOVI_SEGUN_BANCARIAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		private int GetCorrEmpresa() =>
			int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_TIPO_MOVI_SEGUN_BANCOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpPost("Post")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|C")]
		public async Task<IActionResult> Post(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(
				Data,
				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Put")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|U")]
		public async Task<IActionResult> Put(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data)
		{
			this.ApplyQueryKeys(
				Data,
				nameof(BAN_TIPO_MOVI_SEGUN_BANCARIOTable.CORR_EMPRESA),
				nameof(BAN_TIPO_MOVI_SEGUN_BANCARIOTable.CORR_TIPO_MOVIMIENTO),
				nameof(BAN_TIPO_MOVI_SEGUN_BANCARIOTable.CORR_BANCO),
				nameof(BAN_TIPO_MOVI_SEGUN_BANCARIOTable.CODIGO_MOVIMIENTO));
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(
				Data,
				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete("Delete")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
