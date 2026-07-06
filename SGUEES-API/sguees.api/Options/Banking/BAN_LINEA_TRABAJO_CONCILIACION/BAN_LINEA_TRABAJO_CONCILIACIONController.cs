using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class BAN_LINEA_TRABAJO_CONCILIACIONController : ControllerBase
	{
		private readonly IBAN_LINEA_TRABAJO_CONCILIACIONService _service;
		public BAN_LINEA_TRABAJO_CONCILIACIONController(IBAN_LINEA_TRABAJO_CONCILIACIONService service) { _service = service ?? throw new ArgumentNullException(nameof(service)); }

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-linea-trabajo-conciliacion|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_LINEA_TRABAJO_CONCILIACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/ban-linea-trabajo-conciliacion|R")]
		public async Task<CResult> Get([FromQuery] BAN_LINEA_TRABAJO_CONCILIACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/ban-linea-trabajo-conciliacion|C")]
		public async Task<IActionResult> Post(BAN_LINEA_TRABAJO_CONCILIACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/ban-linea-trabajo-conciliacion|U")]
		public async Task<IActionResult> Put(BAN_LINEA_TRABAJO_CONCILIACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/ban-linea-trabajo-conciliacion|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_LINEA_TRABAJO_CONCILIACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_LINEA_BAN_TIPO_MOVI_BANCARIO")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|R")]
		public async Task<CResult> GetCORR_LINEA_BAN_TIPO_MOVI_BANCARIO([FromQuery] BAN_LINEA_TRABAJO_CONCILIACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
	}
}
