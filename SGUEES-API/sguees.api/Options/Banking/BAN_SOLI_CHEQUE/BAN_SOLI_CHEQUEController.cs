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
	public class BAN_SOLI_CHEQUEController : ControllerBase
	{
		private readonly IBAN_SOLI_CHEQUEService _service;

		public BAN_SOLI_CHEQUEController(IBAN_SOLI_CHEQUEService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		private int GetCorrEmpresa() =>
			int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);

		private string GetLogin() =>
			User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;

		private string GetEstacion() => ClientInfoHelper.GetClientStation(HttpContext);

		private void ApplyAuditActu(BAN_SOLI_CHEQUETable data)
		{
			data.USUARIO_ACTU = GetLogin().ToLower();
			data.FECHA_ACTU = DateTime.Now;
			data.ESTACION_ACTU = GetEstacion();
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-soli-cheque|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_SOLI_CHEQUEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetAllAutorizar")]
		[Authorize(Policy = "/ban-soli-cheque-autoriza|R")]
		public async Task<CResult> GetAllAutorizar([FromQuery] BAN_SOLI_CHEQUEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.ESTADO_DOCUMENTO = "SO";
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/ban-soli-cheque|R")]
		public async Task<CResult> Get([FromQuery] BAN_SOLI_CHEQUEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost("Post")]
		[Authorize(Policy = "/ban-soli-cheque|C")]
		public async Task<IActionResult> Post(BAN_SOLI_CHEQUETable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(Data, GetLogin(), GetEstacion());
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Put")]
		[Authorize(Policy = "/ban-soli-cheque|U")]
		public async Task<IActionResult> Put(BAN_SOLI_CHEQUETable Data)
		{
			this.ApplyQueryKeys(
				Data,
				nameof(BAN_SOLI_CHEQUETable.CORR_EMPRESA),
				nameof(BAN_SOLI_CHEQUETable.ANIO_PERIODO),
				nameof(BAN_SOLI_CHEQUETable.MES_PERIODO),
				nameof(BAN_SOLI_CHEQUETable.CORR_TIPO_MOVIMIENTO),
				nameof(BAN_SOLI_CHEQUETable.CORR_DOCUMENTO));
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(Data, GetLogin(), GetEstacion());
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete("Delete")]
		[Authorize(Policy = "/ban-soli-cheque|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_SOLI_CHEQUETable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("EnviarSolicitud")]
		[Authorize(Policy = "/ban-soli-cheque|U")]
		public async Task<IActionResult> EnviarSolicitud(BAN_SOLI_CHEQUETable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			ApplyAuditActu(Data);
			var resultado = await _service.EnviarSolicitudAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("CancelarSolicitud")]
		[Authorize(Policy = "/ban-soli-cheque|U")]
		public async Task<IActionResult> CancelarSolicitud(BAN_SOLI_CHEQUETable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			ApplyAuditActu(Data);
			var resultado = await _service.CancelarSolicitudAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("AutorizarSolicitud")]
		[Authorize(Policy = "/ban-soli-cheque-autoriza|U")]
		public async Task<IActionResult> AutorizarSolicitud(BAN_SOLI_CHEQUETable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			ApplyAuditActu(Data);
			var resultado = await _service.AutorizarSolicitudAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}
	}
}
