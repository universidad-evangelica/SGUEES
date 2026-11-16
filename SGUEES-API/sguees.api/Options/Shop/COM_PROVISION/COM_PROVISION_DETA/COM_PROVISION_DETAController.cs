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
	public class COM_PROVISION_DETAController : ControllerBase
	{
		private readonly ICOM_PROVISION_DETAService _service;

		public COM_PROVISION_DETAController(ICOM_PROVISION_DETAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-provision|R")]
		public async Task<CResult> GetAll([FromQuery] COM_PROVISION_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/com-provision|R")]
		public async Task<CResult> Get([FromQuery] COM_PROVISION_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetAllDisponibles")]
		[Authorize(Policy = "/com-provision|R")]
		public async Task<CResult> GetAllDisponibles([FromQuery] COM_PROVISION_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllDisponiblesAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/com-provision|C")]
		public async Task<IActionResult> Post(COM_PROVISION_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.CreateAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/com-provision|U")]
		public async Task<IActionResult> Put(COM_PROVISION_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/com-provision|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_PROVISION_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			}

			return BadRequest(resultado);
		}
	}
}
