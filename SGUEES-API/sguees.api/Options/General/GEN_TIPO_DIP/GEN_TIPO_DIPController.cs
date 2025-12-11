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
	
	public class GEN_TIPO_DIPController : ControllerBase
	{
		private readonly IGEN_TIPO_DIPService _service;
		
		public GEN_TIPO_DIPController(IGEN_TIPO_DIPService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-tipo-dip|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_TIPO_DIPParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-tipo-dip|R")]
		public async Task<CResult> Get([FromQuery] GEN_TIPO_DIPParam Data)
		{
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/gen-tipo-dip|C")]
		public async Task<IActionResult> Post(GEN_TIPO_DIPTable Data)
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
		[Authorize(Policy = "/gen-tipo-dip|U")]
		public async Task<IActionResult> Put(GEN_TIPO_DIPTable Data)
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
		[Authorize(Policy = "/gen-tipo-dip|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_TIPO_DIPTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_TIPO_DIP_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetCORR_TIPO_DIP_COM_PROVEEDOR([FromQuery] GEN_TIPO_DIPParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_TIPO_DIP_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
		public async Task<CResult> GetCORR_TIPO_DIP_COM_PROVEEDOR_ACTU([FromQuery] GEN_TIPO_DIPParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
	}
}
