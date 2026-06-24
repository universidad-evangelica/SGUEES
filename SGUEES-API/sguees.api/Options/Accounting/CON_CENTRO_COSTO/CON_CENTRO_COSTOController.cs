using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  sguees.Models;
using  sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class CON_CENTRO_COSTOController : ControllerBase
	{
		private readonly ICON_CENTRO_COSTOService _service;
		
		public CON_CENTRO_COSTOController(ICON_CENTRO_COSTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/con-centro-costo|R")]
		public async Task<CResult> GetAll([FromQuery] CON_CENTRO_COSTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/con-centro-costo|R")]
		public async Task<CResult> Get([FromQuery] CON_CENTRO_COSTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/con-centro-costo|C")]
		public async Task<IActionResult> Post(CON_CENTRO_COSTOTable Data)
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
		[Authorize(Policy = "/con-centro-costo|U")]
		public async Task<IActionResult> Put(CON_CENTRO_COSTOTable Data)
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
		[Authorize(Policy = "/con-centro-costo|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_CENTRO_COSTOTable Data)
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

		[HttpPost("ImportarExcel")]
		[Authorize(Policy = "/con-centro-costo|C")]
		public async Task<IActionResult> ImportarExcel(CON_CENTRO_COSTO_IMPORTParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var vLOGIN = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? "Admin";
			var resultado = await _service.ImportarExcelAsync(Data, vLOGIN, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_CENTRO_COSTO_PLA_DEPARTAMENTO")]
        [Authorize(Policy = "/pla-departamento|R")]
        public async Task<CResult> GetCORR_CENTRO_COSTO_PLA_DEPARTAMENTO([FromQuery] CON_CENTRO_COSTOParam Data)
        {
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

		
		
	}
}
