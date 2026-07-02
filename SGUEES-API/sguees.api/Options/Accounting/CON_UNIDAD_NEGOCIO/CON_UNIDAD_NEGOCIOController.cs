using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class CON_UNIDAD_NEGOCIOController : ControllerBase
	{
		private readonly ICON_UNIDAD_NEGOCIOService _service;
		
		public CON_UNIDAD_NEGOCIOController(ICON_UNIDAD_NEGOCIOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/con-unidad-negocio|R")]
		public async Task<CResult> GetAll([FromQuery] CON_UNIDAD_NEGOCIOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/con-unidad-negocio|R")]
		public async Task<CResult> Get([FromQuery] CON_UNIDAD_NEGOCIOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/con-unidad-negocio|C")]
		public async Task<IActionResult> Post(CON_UNIDAD_NEGOCIOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}
		
		[HttpPut]
		[Authorize(Policy = "/con-unidad-negocio|U")]
		public async Task<IActionResult> Put(CON_UNIDAD_NEGOCIOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}
		
		[HttpDelete]
		[Authorize(Policy = "/con-unidad-negocio|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_UNIDAD_NEGOCIOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_UNIDAD_NEGOCIO_CON_CENTRO_COSTO")]
		[Authorize(Policy = "/con-centro-costo|R")]
		public async Task<CResult> GetCORR_UNIDAD_NEGOCIO_CON_CENTRO_COSTO([FromQuery] CON_UNIDAD_NEGOCIOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
	}
}
