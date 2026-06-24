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
	public class CON_CATALOGO_PRESUPUESTOController : ControllerBase
	{
		private readonly ICON_CATALOGO_PRESUPUESTOService _service;
		public CON_CATALOGO_PRESUPUESTOController(ICON_CATALOGO_PRESUPUESTOService service) { _service = service ?? throw new ArgumentNullException(nameof(_service)); }

		[HttpGet("GetAll")]
		[Authorize(Policy = "/con-catalogo-presupuesto|R")]
		public async Task<CResult> GetAll([FromQuery] CON_CATALOGO_PRESUPUESTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/con-catalogo-presupuesto|R")]
		public async Task<CResult> Get([FromQuery] CON_CATALOGO_PRESUPUESTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/con-catalogo-presupuesto|C")]
		public async Task<IActionResult> Post(CON_CATALOGO_PRESUPUESTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/con-catalogo-presupuesto|U")]
		public async Task<IActionResult> Put(CON_CATALOGO_PRESUPUESTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/con-catalogo-presupuesto|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_CATALOGO_PRESUPUESTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
