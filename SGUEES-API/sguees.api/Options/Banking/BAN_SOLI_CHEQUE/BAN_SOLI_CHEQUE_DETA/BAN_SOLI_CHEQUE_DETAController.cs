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
	public class BAN_SOLI_CHEQUE_DETAController : ControllerBase
	{
		private readonly IBAN_SOLI_CHEQUE_DETAService _service;

		public BAN_SOLI_CHEQUE_DETAController(IBAN_SOLI_CHEQUE_DETAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		private int GetCorrEmpresa() =>
			int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-soli-cheque|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_SOLI_CHEQUE_DETAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpPost("Post")]
		[Authorize(Policy = "/ban-soli-cheque|C")]
		public async Task<IActionResult> Post(BAN_SOLI_CHEQUE_DETATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(
				Data,
				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Put")]
		[Authorize(Policy = "/ban-soli-cheque|U")]
		public async Task<IActionResult> Put(BAN_SOLI_CHEQUE_DETATable Data)
		{
			this.ApplyQueryKeys(
				Data,
				nameof(BAN_SOLI_CHEQUE_DETATable.ANIO_PERIODO),
				nameof(BAN_SOLI_CHEQUE_DETATable.MES_PERIODO),
				nameof(BAN_SOLI_CHEQUE_DETATable.CORR_TIPO_MOVIMIENTO),
				nameof(BAN_SOLI_CHEQUE_DETATable.CORR_DOCUMENTO),
				nameof(BAN_SOLI_CHEQUE_DETATable.CORR_DOCUMENTO_DETA));
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(
				Data,
				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete("Delete")]
		[Authorize(Policy = "/ban-soli-cheque|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_SOLI_CHEQUE_DETATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
