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
	public class CON_CENTRO_COSTO_PRESUPUESTOController : ControllerBase
	{
		private readonly ICON_CENTRO_COSTO_PRESUPUESTOService _service;
		public CON_CENTRO_COSTO_PRESUPUESTOController(ICON_CENTRO_COSTO_PRESUPUESTOService service) { _service = service ?? throw new ArgumentNullException(nameof(_service)); }

		[HttpGet("GetAll")]
		[Authorize(Policy = "/con-centro-costo|R")]
		public async Task<CResult> GetAll([FromQuery] CON_CENTRO_COSTO_PRESUPUESTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/con-centro-costo|R")]
		public async Task<CResult> Get([FromQuery] CON_CENTRO_COSTO_PRESUPUESTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/con-centro-costo|C")]
		public async Task<IActionResult> Post(CON_CENTRO_COSTO_PRESUPUESTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/con-centro-costo|U")]
		public async Task<IActionResult> Put(CON_CENTRO_COSTO_PRESUPUESTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/con-centro-costo|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_CENTRO_COSTO_PRESUPUESTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
