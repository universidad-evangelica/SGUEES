using System;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class SC_PERSONA_DATOSController : ControllerBase
	{
		private readonly ISC_PERSONA_DATOSService _service;

		public SC_PERSONA_DATOSController(ISC_PERSONA_DATOSService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-persona-datos|R")]
		public async Task<CResult> GetAll([FromQuery] SC_PERSONA_DATOSParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/sc-persona-datos|R")]
		public async Task<CResult> Get([FromQuery] SC_PERSONA_DATOSParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/sc-persona-datos|C")]
		public async Task<IActionResult> Post(SC_PERSONA_DATOSTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.CreateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpPut]
		[Authorize(Policy = "/sc-persona-datos|U")]
		public async Task<IActionResult> Put(SC_PERSONA_DATOSTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpDelete]
		[Authorize(Policy = "/sc-persona-datos|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_PERSONA_DATOSTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_PERSONA_DATOS_SC_SOLICITUD_EMPLEO")]
		[Authorize(Policy = "/sc-solicitud-empleo|R")]
		public async Task<CResult> GetCORR_PERSONA_DATOS_SC_SOLICITUD_EMPLEO([FromQuery] SC_PERSONA_DATOSParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
	}
}
