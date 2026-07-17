using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class BAN_TIPO_MOVI_BANCARIOController : ControllerBase
	{
		private readonly IBAN_TIPO_MOVI_BANCARIOService _service;
		public BAN_TIPO_MOVI_BANCARIOController(IBAN_TIPO_MOVI_BANCARIOService service) { _service = service ?? throw new ArgumentNullException(nameof(service)); }

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_TIPO_MOVI_BANCARIOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|R")]
		public async Task<CResult> Get([FromQuery] BAN_TIPO_MOVI_BANCARIOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/ban-tipo-movi-bancario|C")]
		public async Task<IActionResult> Post(BAN_TIPO_MOVI_BANCARIOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/ban-tipo-movi-bancario|U")]
		public async Task<IActionResult> Put(BAN_TIPO_MOVI_BANCARIOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(BAN_TIPO_MOVI_BANCARIOTable.CORR_TIPO_MOVIMIENTO));
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/ban-tipo-movi-bancario|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_TIPO_MOVI_BANCARIOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|U")]
		public async Task<IActionResult> ActivarInactivar(BAN_TIPO_MOVI_BANCARIOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(BAN_TIPO_MOVI_BANCARIOTable.CORR_TIPO_MOVIMIENTO));
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.ActivarInactivarAsync(
				Data,
				User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_TIPO_MOVIMIENTO_BAN_DOCUMENTO")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> GetCORR_TIPO_MOVIMIENTO_BAN_DOCUMENTO([FromQuery] BAN_TIPO_MOVI_BANCARIOParam Data)
			=> await GetTiposMoviLookupAsync(Data, soloCheques: false);

		[HttpGet("GetCORR_TIPO_MOVIMIENTO_BAN_CHEQUE")]
		[Authorize(Policy = "/ban-cheque|R")]
		public async Task<CResult> GetCORR_TIPO_MOVIMIENTO_BAN_CHEQUE([FromQuery] BAN_TIPO_MOVI_BANCARIOParam Data)
			=> await GetTiposMoviLookupAsync(Data, soloCheques: true);

		private async Task<CResult> GetTiposMoviLookupAsync(BAN_TIPO_MOVI_BANCARIOParam Data, bool soloCheques)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.GetAllAsync(Data);
			if (resultado.Result && resultado.Data is List<BAN_TIPO_MOVI_BANCARIOView> lista)
			{
				resultado.Data = lista
					.Where(x => soloCheques ? x.CLASE_MOVIMIENTO == "CHQ" : x.CLASE_MOVIMIENTO != "CHQ")
					.ToList();
				resultado.RowsAffected = ((List<BAN_TIPO_MOVI_BANCARIOView>)resultado.Data).Count;
			}
			return resultado;
		}
	}
}
