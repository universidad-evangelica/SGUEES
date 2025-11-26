using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  scuees.Models;
using  scuees.Services;

namespace scuees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class COM_CONDICION_PAGOController : ControllerBase
	{
		private readonly ICOM_CONDICION_PAGOService _service;
		
		public COM_CONDICION_PAGOController(ICOM_CONDICION_PAGOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-condicion-pago|R")]
		public async Task<CResult> GetAll([FromQuery] COM_CONDICION_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-condicion-pago|R")]
		public async Task<CResult> Get([FromQuery] COM_CONDICION_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-condicion-pago|C")]
		public async Task<IActionResult> Post(COM_CONDICION_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			
			var resultado = await _service.CreateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/com-condicion-pago|U")]
		public async Task<IActionResult> Put(COM_CONDICION_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/com-condicion-pago|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_CONDICION_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_CONDICION_PAGO_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetCORR_CONDICION_PAGO_COM_PROVEEDOR([FromQuery] COM_CONDICION_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_CONDICION_PAGO_COM_COTIZACION")]
		[Authorize(Policy = "/com-cotizacion|R")]
		public async Task<CResult> GetCORR_CONDICION_PAGO_COM_COTIZACION([FromQuery] COM_CONDICION_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_CONDICION_PAGO_COM_SOLI_COTIZACION")]
		[Authorize(Policy = "/com-soli-cotizacion|R")]
		public async Task<CResult> GetCORR_CONDICION_PAGO_COM_SOLI_COTIZACION([FromQuery] COM_CONDICION_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		[HttpGet("GetCORR_CONDICION_PAGO_COM_DOCUMENTO")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetCORR_CONDICION_PAGO_COM_DOCUMENTO([FromQuery] COM_CONDICION_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetCondicionesPagoAsync(Data);
		}
	}
}
