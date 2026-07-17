using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using System.Collections.Generic;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class CON_CATALOGO_CUENTAController : ControllerBase
	{
		private readonly ICON_CATALOGO_CUENTAService _service;
		public CON_CATALOGO_CUENTAController(ICON_CATALOGO_CUENTAService service) { _service = service ?? throw new ArgumentNullException(nameof(_service)); }

		[HttpGet("GetAll")]
		[Authorize(Policy = "/con-catalogo-cuenta|R")]
		public async Task<CResult> GetAll([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/con-catalogo-cuenta|R")]
		public async Task<CResult> Get([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/con-catalogo-cuenta|C")]
		public async Task<IActionResult> Post(CON_CATALOGO_CUENTATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/con-catalogo-cuenta|U")]
		public async Task<IActionResult> Put(CON_CATALOGO_CUENTATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/con-catalogo-cuenta|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_CATALOGO_CUENTATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPost("ImportarExcel")]
		[Authorize(Policy = "/con-catalogo-cuenta|C")]
		public async Task<IActionResult> ImportarExcel(CON_CATALOGO_CUENTA_IMPORTParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var vLOGIN = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? "";
			var vESTACION = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.ImportarExcelAsync(Data, vLOGIN, vESTACION);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// --- BAN_CUENTA_BANCARIA ---

		[HttpGet("GetCUENTA_CONTABLE_BAN_CUENTA_BANCARIA")]
		[Authorize(Policy = "/ban-cuenta-bancaria|R")]
		public async Task<CResult> GetCUENTA_CONTABLE_BAN_CUENTA_BANCARIA([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			return await GetCuentasDetalleAsync(Data);
		}

		// --- BAN_TIPO_CHEQUE ---

		[HttpGet("GetCUENTA_CONTABLE_BAN_TIPO_CHEQUE")]
		[Authorize(Policy = "/ban-tipo-cheque|R")]
		public async Task<CResult> GetCUENTA_CONTABLE_BAN_TIPO_CHEQUE([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			return await GetCuentasDetalleAsync(Data);
		}

		// --- BAN_TIPO_MOVI_BANCARIO ---

		[HttpGet("GetCUENTA_CONTABLE_BAN_TIPO_MOVI_BANCARIO")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|R")]
		public async Task<CResult> GetCUENTA_CONTABLE_BAN_TIPO_MOVI_BANCARIO([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			return await GetCuentasDetalleAsync(Data);
		}

		// --- CON_PARTIDA ---

		[HttpGet("GetCUENTA_CONTABLE_CON_PARTIDA")]
		[Authorize(Policy = "/con-partida|R")]
		public async Task<CResult> GetCUENTA_CONTABLE_CON_PARTIDA([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			return await GetCuentasDetalleAsync(Data);
		}

		[HttpGet("GetCUENTA_CONTABLE_BAN_DOCUMENTO")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> GetCUENTA_CONTABLE_BAN_DOCUMENTO([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			return await GetCuentasDetalleAsync(Data);
		}

		[HttpGet("GetCUENTA_CONTABLE_BAN_CHEQUE")]
		[Authorize(Policy = "/ban-cheque|R")]
		public async Task<CResult> GetCUENTA_CONTABLE_BAN_CHEQUE([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			return await GetCuentasDetalleAsync(Data);
		}

		// --- CON_CTA_CENTRO_COSTO (cuenta ↔ centro) ---

		[HttpGet("GetCUENTA_CONTABLE_CON_CTA_CENTRO_COSTO")]
		[Authorize(Policy = "/con-catalogo-cuenta-centro-costo|R")]
		public async Task<CResult> GetCUENTA_CONTABLE_CON_CTA_CENTRO_COSTO([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			if (string.IsNullOrEmpty(Data.CUENTA_CONTABLE))
			{
				Data.CUENTA_CONTABLE = string.Empty;
			}
			return await _service.GetAllAsync(Data);
		}

		// --- CON_REPORTE ---

		[HttpGet("GetCUENTA_CONTABLE_CON_REPORTE")]
		[Authorize]
		public async Task<CResult> GetCUENTA_CONTABLE_CON_REPORTE([FromQuery] CON_CATALOGO_CUENTAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			if (string.IsNullOrEmpty(Data.CUENTA_CONTABLE))
			{
				Data.CUENTA_CONTABLE = string.Empty;
			}
			return await _service.GetAllAsync(Data);
		}

		private async Task<CResult> GetCuentasDetalleAsync(CON_CATALOGO_CUENTAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			if (string.IsNullOrEmpty(Data.CUENTA_CONTABLE))
			{
				Data.CUENTA_CONTABLE = string.Empty;
			}
			var resultado = await _service.GetAllAsync(Data);
			if (resultado.Result && resultado.Data is List<CON_CATALOGO_CUENTAView> cuentas)
			{
				resultado.Data = cuentas.Where(x => x.ES_DETALLE).ToList();
			}
			return resultado;
		}
	}
}
