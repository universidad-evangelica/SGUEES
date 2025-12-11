using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  sguees.Models;
using  sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class COM_BANCOController : ControllerBase
	{
		private readonly ICOM_BANCOService _service;
		
		public COM_BANCOController(ICOM_BANCOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-banco|R")]
		public async Task<CResult> GetAll([FromQuery] COM_BANCOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-banco|R")]
		public async Task<CResult> Get([FromQuery] COM_BANCOParam Data)
		{
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-banco|C")]
		public async Task<IActionResult> Post(COM_BANCOTable Data)
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
		[Authorize(Policy = "/com-banco|U")]
		public async Task<IActionResult> Put(COM_BANCOTable Data)
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
		[Authorize(Policy = "/com-banco|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_BANCOTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_BANCO_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetCORR_BANCO_COM_PROVEEDOR([FromQuery] COM_BANCOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_BANCO_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
		public async Task<CResult> GetCORR_BANCO_COM_PROVEEDOR_ACTU([FromQuery] COM_BANCOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
	}
}
