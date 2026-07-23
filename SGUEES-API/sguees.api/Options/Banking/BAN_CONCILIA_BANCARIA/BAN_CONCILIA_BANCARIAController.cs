using System;
using System.Linq;
using System.Security.Claims;
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
	public class BAN_CONCILIA_BANCARIAController : ControllerBase
	{
		private readonly IBAN_CONCILIA_BANCARIAService _service;

		public BAN_CONCILIA_BANCARIAController(IBAN_CONCILIA_BANCARIAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		private int GetCorrEmpresa() =>
			int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);

		private string GetLogin() =>
			User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;

		private string GetEstacion() => ClientInfoHelper.GetClientStation(HttpContext);

		private void ApplyAuditActu(BAN_CONCILIA_BANCARIATable data)
		{
			data.USUARIO_ACTU = GetLogin().ToLower();
			data.FECHA_ACTU = DateTime.Now;
			data.ESTACION_ACTU = GetEstacion();
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-concilia-bancaria|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_CONCILIA_BANCARIAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/ban-concilia-bancaria|R")]
		public async Task<CResult> Get([FromQuery] BAN_CONCILIA_BANCARIAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost("Post")]
		[Authorize(Policy = "/ban-concilia-bancaria|C")]
		public async Task<IActionResult> Post(BAN_CONCILIA_BANCARIATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(Data, GetLogin(), GetEstacion());
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Put")]
		[Authorize(Policy = "/ban-concilia-bancaria|U")]
		public async Task<IActionResult> Put(BAN_CONCILIA_BANCARIATable Data)
		{
			this.ApplyQueryKeys(
				Data,
				nameof(BAN_CONCILIA_BANCARIATable.CORR_EMPRESA),
				nameof(BAN_CONCILIA_BANCARIATable.CORR_CUENTA_BANCO),
				nameof(BAN_CONCILIA_BANCARIATable.CORR_CONCILIACION));
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(Data, GetLogin(), GetEstacion());
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete("Delete")]
		[Authorize(Policy = "/ban-concilia-bancaria|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_CONCILIA_BANCARIATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetPendientes")]
		[Authorize(Policy = "/ban-concilia-bancaria|R")]
		public async Task<CResult> GetPendientes([FromQuery] BAN_CONCILIA_BANCARIAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetPendientesAsync(Data);
		}

		[HttpGet("GetResumen")]
		[Authorize(Policy = "/ban-concilia-bancaria|R")]
		public async Task<CResult> GetResumen([FromQuery] BAN_CONCILIA_BANCARIAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetResumenAsync(Data);
		}

		[HttpGet("GetMovi")]
		[Authorize(Policy = "/ban-concilia-bancaria|R")]
		public async Task<CResult> GetMovi([FromQuery] BAN_CONCILIA_BANCARIAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetMoviAsync(Data);
		}

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/ban-concilia-bancaria|P")]
		public async Task<IActionResult> Aplicar(BAN_CONCILIA_BANCARIATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			ApplyAuditActu(Data);
			var resultado = await _service.AplicarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("DesAplicar")]
		[Authorize(Policy = "/ban-concilia-bancaria|P")]
		public async Task<IActionResult> DesAplicar(BAN_CONCILIA_BANCARIATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			ApplyAuditActu(Data);
			var resultado = await _service.DesAplicarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("GenerarConciliacion")]
		[Authorize(Policy = "/ban-concilia-bancaria|P")]
		public async Task<IActionResult> GenerarConciliacion(BAN_CONCILIA_BANCARIATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			ApplyAuditActu(Data);
			var resultado = await _service.GenerarConciliacionAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("ReconstruirMovimientos")]
		[Authorize(Policy = "/ban-concilia-bancaria|P")]
		public async Task<IActionResult> ReconstruirMovimientos(BAN_CONCILIA_BANCARIATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			ApplyAuditActu(Data);
			var resultado = await _service.ReconstruirMovimientosAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("ForzarConciliacion")]
		[Authorize(Policy = "/ban-concilia-bancaria|P")]
		public async Task<IActionResult> ForzarConciliacion(BAN_CONCILIA_FORZADAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.ForzarConciliacionAsync(Data, GetLogin(), GetEstacion());
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("RevertirConciliacion")]
		[Authorize(Policy = "/ban-concilia-bancaria|P")]
		public async Task<IActionResult> RevertirConciliacion(BAN_CONCILIA_REVERTIRParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.RevertirConciliacionAsync(Data, GetLogin(), GetEstacion());
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("MarcarConciliado")]
		[Authorize(Policy = "/ban-concilia-bancaria|P")]
		public async Task<IActionResult> MarcarConciliado(BAN_CONCILIA_FORZADAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.MarcarConciliadoAsync(Data, GetLogin(), GetEstacion());
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPost("ImportarExcel")]
		[Authorize(Policy = "/ban-concilia-bancaria|C")]
		public async Task<IActionResult> ImportarExcel(BAN_CONCILIA_BANCARIA_IMPORTParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.ImportarExcelAsync(Data, GetLogin(), GetEstacion());
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
