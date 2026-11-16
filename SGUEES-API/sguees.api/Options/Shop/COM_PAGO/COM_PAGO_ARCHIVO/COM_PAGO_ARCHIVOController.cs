using System;
using System.Linq;
using System.Security.Claims;
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
	public class COM_PAGO_ARCHIVOController : ControllerBase
	{
		private readonly ICOM_PAGO_ARCHIVOService _service;

		public COM_PAGO_ARCHIVOController(ICOM_PAGO_ARCHIVOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> GetAll([FromQuery] COM_PAGO_ARCHIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetAllAPagar")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> GetAllAPagar([FromQuery] COM_PAGO_ARCHIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAPagarAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> Get([FromQuery] COM_PAGO_ARCHIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/com-pago|C")]
		public async Task<IActionResult> Post(COM_PAGO_ARCHIVOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.CreateAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> Put(COM_PAGO_ARCHIVOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.UpdateAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/com-pago|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_PAGO_ARCHIVOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.DeleteAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("GenerarMoviBancarioArchivo")]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> GenerarMoviBancarioArchivo(COM_PAGO_ARCHIVOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.GenerarMoviBancarioArchivoAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}
	}
}
