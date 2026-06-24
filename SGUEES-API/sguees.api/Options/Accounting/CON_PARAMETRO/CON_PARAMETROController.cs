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
	public class CON_PARAMETROController : ControllerBase
	{
		private readonly ICON_PARAMETROService _service;

		public CON_PARAMETROController(ICON_PARAMETROService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/con-parametro|R")]
		public async Task<CResult> GetAll([FromQuery] CON_PARAMETROParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/con-parametro|R")]
		public async Task<CResult> Get([FromQuery] CON_PARAMETROParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/con-parametro|C")]
		public async Task<IActionResult> Post(CON_PARAMETROTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			if (resultado.ErrorCode == 0)
				return StatusCode(201, resultado);
			else
				return BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/con-parametro|U")]
		public async Task<IActionResult> Put(CON_PARAMETROTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			if (resultado.ErrorCode == 0)
				return StatusCode(201, resultado);
			else
				return BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/con-parametro|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_PARAMETROTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			if (resultado.ErrorCode == 0)
				return Ok(resultado);
			else
				return BadRequest(resultado);
		}
	}
}
