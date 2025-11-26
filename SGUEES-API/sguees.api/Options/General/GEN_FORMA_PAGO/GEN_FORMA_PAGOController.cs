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
	
	public class GEN_FORMA_PAGOController : ControllerBase
	{
		private readonly IGEN_FORMA_PAGOService _service;
		
		public GEN_FORMA_PAGOController(IGEN_FORMA_PAGOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-forma-pago|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_FORMA_PAGOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-forma-pago|R")]
		public async Task<CResult> Get([FromQuery] GEN_FORMA_PAGOParam Data)
		{
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/gen-forma-pago|C")]
		public async Task<IActionResult> Post(GEN_FORMA_PAGOTable Data)
		{
			
			var resultado = await _service.CreateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/gen-forma-pago|U")]
		public async Task<IActionResult> Put(GEN_FORMA_PAGOTable Data)
		{
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/gen-forma-pago|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_FORMA_PAGOTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_FORMA_PAGO_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetCORR_FORMA_PAGO_COM_PROVEEDOR([FromQuery] GEN_FORMA_PAGOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_FORMA_PAGO_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
		public async Task<CResult> GetCORR_FORMA_PAGO_COM_PROVEEDOR_ACTU([FromQuery] GEN_FORMA_PAGOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_FORMA_PAGO_COM_SOLI_COTIZACION")]
		[Authorize(Policy = "/com-soli-cotizacion|R")]
		public async Task<CResult> GetCORR_FORMA_PAGO_COM_SOLI_COTIZACION([FromQuery] GEN_FORMA_PAGOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		[HttpGet("GetCORR_FORMA_PAGO_COM_COTIZACION")]
		[Authorize(Policy = "/com-cotizacion|R")]
		public async Task<CResult> GetCORR_FORMA_PAGO_COM_COTIZACION([FromQuery] GEN_FORMA_PAGOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
	}
}
