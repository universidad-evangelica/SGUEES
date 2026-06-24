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
	
	public class CON_AREA_FUNCIONALController : ControllerBase
	{
		private readonly ICON_AREA_FUNCIONALService _service;
		
		public CON_AREA_FUNCIONALController(ICON_AREA_FUNCIONALService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/con-area-funcional|R")]
		public async Task<CResult> GetAll([FromQuery] CON_AREA_FUNCIONALParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/con-area-funcional|R")]
		public async Task<CResult> Get([FromQuery] CON_AREA_FUNCIONALParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/con-area-funcional|C")]
		public async Task<IActionResult> Post(CON_AREA_FUNCIONALTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}
		
		[HttpPut]
		[Authorize(Policy = "/con-area-funcional|U")]
		public async Task<IActionResult> Put(CON_AREA_FUNCIONALTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}
		
		[HttpDelete]
		[Authorize(Policy = "/con-area-funcional|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_AREA_FUNCIONALTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
