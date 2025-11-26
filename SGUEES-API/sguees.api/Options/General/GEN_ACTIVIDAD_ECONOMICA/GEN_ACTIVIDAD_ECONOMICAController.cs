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
	
	public class GEN_ACTIVIDAD_ECONOMICAController : ControllerBase
	{
		private readonly IGEN_ACTIVIDAD_ECONOMICAService _service;
		
		public GEN_ACTIVIDAD_ECONOMICAController(IGEN_ACTIVIDAD_ECONOMICAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-actividad-economica|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-actividad-economica|R")]
		public async Task<CResult> Get([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/gen-actividad-economica|C")]
		public async Task<IActionResult> Post(GEN_ACTIVIDAD_ECONOMICATable Data)
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
		[Authorize(Policy = "/gen-actividad-economica|U")]
		public async Task<IActionResult> Put(GEN_ACTIVIDAD_ECONOMICATable Data)
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
		[Authorize(Policy = "/gen-actividad-economica|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_ACTIVIDAD_ECONOMICATable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO")]
		[Authorize(Policy = "/ven-documento|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_DONA")]
		[Authorize(Policy = "/ven-documento-dona|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_DONA([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_COM_DOCUMENTO")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_COM_DOCUMENTO([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DONANTE")]
		[Authorize(Policy = "/ven-donante|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DONANTE([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_NCR")]
		[Authorize(Policy = "/ven-documento-ncr|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_NCR([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_COM_JSON")]
		[Authorize(Policy = "/com-json|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_COM_JSON([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_EXPOR")]
		[Authorize(Policy = "/ven-documento-expor|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_EXPOR([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_NRE")]
		[Authorize(Policy = "/ven-documento-nre|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_VEN_DOCUMENTO_NRE([FromQuery] GEN_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
	}
}
