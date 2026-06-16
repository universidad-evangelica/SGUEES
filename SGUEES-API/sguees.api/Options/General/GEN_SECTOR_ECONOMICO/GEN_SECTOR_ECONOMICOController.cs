using sguees.api.Shared;
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
	
	public class GEN_SECTOR_ECONOMICOController : ControllerBase
	{
		private readonly IGEN_SECTOR_ECONOMICOService _service;
		
		public GEN_SECTOR_ECONOMICOController(IGEN_SECTOR_ECONOMICOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-sector-economico|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_SECTOR_ECONOMICOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-sector-economico|R")]
		public async Task<CResult> Get([FromQuery] GEN_SECTOR_ECONOMICOParam Data)
		{
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/gen-sector-economico|C")]
		public async Task<IActionResult> Post(GEN_SECTOR_ECONOMICOTable Data)
		{
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			
			var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/gen-sector-economico|U")]
		public async Task<IActionResult> Put(GEN_SECTOR_ECONOMICOTable Data)
		{
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/gen-sector-economico|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_SECTOR_ECONOMICOTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		[HttpGet("GetCORR_SECTOR_ECONOMICO_GEN_EMPRESA")]
        [Authorize(Policy = "/gen-empresa|R")]
        public async Task<CResult> GetCORR_SECTOR_ECONOMICO_GEN_EMPRESA([FromQuery] GEN_SECTOR_ECONOMICOParam Data)
        {
			//Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			//Data.CORR_PAIS = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_PAIS").Value);
            return await _service.GetAllAsync(Data);
        }
	}
}
