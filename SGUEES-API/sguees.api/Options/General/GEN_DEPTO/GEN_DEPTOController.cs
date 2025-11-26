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
	
	public class GEN_DEPTOController : ControllerBase
	{
		private readonly IGEN_DEPTOService _service;
		
		public GEN_DEPTOController(IGEN_DEPTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-depto|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_DEPTOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-depto|R")]
		public async Task<CResult> Get([FromQuery] GEN_DEPTOParam Data)
		{
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/gen-depto|C")]
		public async Task<IActionResult> Post(GEN_DEPTOTable Data)
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
		[Authorize(Policy = "/gen-depto|U")]
		public async Task<IActionResult> Put(GEN_DEPTOTable Data)
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
		[Authorize(Policy = "/gen-depto|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_DEPTOTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCODIGO_DEPTO_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetCODIGO_DEPTO_COM_PROVEEDOR([FromQuery] GEN_DEPTOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCODIGO_DEPTO_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
		public async Task<CResult> GetCODIGO_DEPTO_COM_PROVEEDOR_ACTU([FromQuery] GEN_DEPTOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
	}
}
