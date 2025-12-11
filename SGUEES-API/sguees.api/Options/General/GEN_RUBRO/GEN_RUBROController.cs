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
	
	public class GEN_RUBROController : ControllerBase
	{
		private readonly IGEN_RUBROService _service;
		
		public GEN_RUBROController(IGEN_RUBROService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-rubro|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_RUBROParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-rubro|R")]
		public async Task<CResult> Get([FromQuery] GEN_RUBROParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/gen-rubro|C")]
		public async Task<IActionResult> Post(GEN_RUBROTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			
			var resultado = await _service.CreateAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/gen-rubro|U")]
		public async Task<IActionResult> Put(GEN_RUBROTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/gen-rubro|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_RUBROTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_IMPUESTO_GEN_RUBRO")]
		[Authorize(Policy = "/gen-rubro|R")]
		public async Task<CResult> GetCORR_IMPUESTO([FromQuery] GEN_RUBROParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetLookUpAsync(Data);
		}

		[HttpGet("GetCORR_RUBRO_GEN_RUBRO")]
		[Authorize(Policy = "/gen-rubro|R")]
		public async Task<CResult> GetCORR_RUBRO_GEN_RUBRO([FromQuery] GEN_RUBROParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetLookUpAsync(Data);
		}

		[HttpGet("GetCORR_RUBRO_GEN_TIPO_GASTO")]
		[Authorize(Policy = "/gen-tipo-gasto|R")]
		public async Task<CResult> GetCORR_RUBRO_GEN_TIPO_GASTO([FromQuery] GEN_RUBROParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetLookUpAsync(Data);
		}
	}
}
