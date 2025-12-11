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
	
	public class GEN_PAISController : ControllerBase
	{
		private readonly IGEN_PAISService _service;
		
		public GEN_PAISController(IGEN_PAISService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-pais|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PAISParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-pais|R")]
		public async Task<CResult> Get([FromQuery] GEN_PAISParam Data)
		{
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/gen-pais|C")]
		public async Task<IActionResult> Post(GEN_PAISTable Data)
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
		[Authorize(Policy = "/gen-pais|U")]
		public async Task<IActionResult> Put(GEN_PAISTable Data)
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
		[Authorize(Policy = "/gen-pais|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_PAISTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCODIGO_PAIS_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetCODIGO_PAIS_COM_PROVEEDOR([FromQuery] GEN_PAISParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCODIGO_PAIS_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
		public async Task<CResult> GetCODIGO_PAIS_COM_PROVEEDOR_ACTU([FromQuery] GEN_PAISParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

	}
}
