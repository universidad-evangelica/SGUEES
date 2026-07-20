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
	public class BAN_CONCILIA_BANCARIA_DETAController : ControllerBase
	{
		private readonly IBAN_CONCILIA_BANCARIA_DETAService _service;

		public BAN_CONCILIA_BANCARIA_DETAController(IBAN_CONCILIA_BANCARIA_DETAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		private int GetCorrEmpresa() =>
			int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-concilia-bancaria|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_CONCILIA_BANCARIA_DETAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpPost("Post")]
		[Authorize(Policy = "/ban-concilia-bancaria|C")]
		public async Task<IActionResult> Post(BAN_CONCILIA_BANCARIA_DETATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(
				Data,
				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Put")]
		[Authorize(Policy = "/ban-concilia-bancaria|U")]
		public async Task<IActionResult> Put(BAN_CONCILIA_BANCARIA_DETATable Data)
		{
			this.ApplyQueryKeys(
				Data,
				nameof(BAN_CONCILIA_BANCARIA_DETATable.CORR_EMPRESA),
				nameof(BAN_CONCILIA_BANCARIA_DETATable.CORR_CUENTA_BANCO),
				nameof(BAN_CONCILIA_BANCARIA_DETATable.CORR_CONCILIACION),
				nameof(BAN_CONCILIA_BANCARIA_DETATable.CORR_CONCILIACION_DETA));
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(
				Data,
				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete("Delete")]
		[Authorize(Policy = "/ban-concilia-bancaria|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_CONCILIA_BANCARIA_DETATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
