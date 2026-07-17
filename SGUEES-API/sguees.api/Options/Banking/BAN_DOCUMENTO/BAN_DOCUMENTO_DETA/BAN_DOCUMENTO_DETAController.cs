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
	public class BAN_DOCUMENTO_DETAController : ControllerBase
	{
		private readonly IBAN_DOCUMENTO_DETAService _service;

		public BAN_DOCUMENTO_DETAController(IBAN_DOCUMENTO_DETAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_DOCUMENTO_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> Get([FromQuery] BAN_DOCUMENTO_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/ban-documento|C")]
		public async Task<IActionResult> Post(BAN_DOCUMENTO_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.CreateAsync(
				Data,
				User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/ban-documento|U")]
		public async Task<IActionResult> Put(BAN_DOCUMENTO_DETATable Data)
		{
			this.ApplyQueryKeys(
				Data,
				nameof(BAN_DOCUMENTO_DETATable.ANIO_PERIODO),
				nameof(BAN_DOCUMENTO_DETATable.MES_PERIODO),
				nameof(BAN_DOCUMENTO_DETATable.CORR_TIPO_MOVIMIENTO),
				nameof(BAN_DOCUMENTO_DETATable.CORR_DOCUMENTO),
				nameof(BAN_DOCUMENTO_DETATable.CORR_DOCUMENTO_DETA));
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(
				Data,
				User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/ban-documento|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_DOCUMENTO_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
