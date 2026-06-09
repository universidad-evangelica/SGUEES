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
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-depto|R")]
		public async Task<CResult> Get([FromQuery] GEN_DEPTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/gen-depto|C")]
		public async Task<IActionResult> Post(GEN_DEPTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			
			var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
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
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
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
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_DEPTO_GEN_MUNICIPIO")]
        [Authorize(Policy = "/gen-municipio|R")]
        public async Task<CResult> GetCORR_DEPTO_GEN_MUNICIPIO([FromQuery] GEN_DEPTOParam Data)
        {
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			//Data.CORR_PAIS = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_PAIS").Value);
            return await _service.GetAllAsync(Data);
        }
		[HttpGet("GetCORR_DEPTO_GEN_DISTRITO")]
        [Authorize(Policy = "/gen-distrito|R")]
        public async Task<CResult> GetCORR_DEPTO_GEN_DISTRITO([FromQuery] GEN_DEPTOParam Data)
        {
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			//Data.CORR_PAIS = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_PAIS").Value);
            return await _service.GetAllAsync(Data);
        }

		[HttpGet("GetCORR_DEPTO_GEN_EMPRESA")]
        [Authorize(Policy = "/gen-empresa|R")]
        public async Task<CResult> GetCORR_DEPTO_GEN_EMPRESA([FromQuery] GEN_DEPTOParam Data)
        {
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			//Data.CORR_PAIS = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_PAIS").Value);
            return await _service.GetAllAsync(Data);
        }
	}
}
