using System;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class COM_PAGO_DETAController : ControllerBase
	{
		private readonly ICOM_PAGO_DETAService _service;

		public COM_PAGO_DETAController(ICOM_PAGO_DETAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> GetAll([FromQuery] COM_PAGO_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetAllPendientes")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> GetAllPendientes([FromQuery] COM_PAGO_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllPendientesAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> Get([FromQuery] COM_PAGO_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/com-pago|C")]
		public async Task<IActionResult> Post(COM_PAGO_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.CreateAsync(Data, "Admin", estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> Put(COM_PAGO_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.UpdateAsync(Data, "Admin", estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/com-pago|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_PAGO_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.DeleteAsync(Data, "Admin", estacion);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
