using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class BAN_PARAMETROController : ControllerBase
	{
		private readonly IBAN_PARAMETROService _service;

		public BAN_PARAMETROController(IBAN_PARAMETROService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-parametro|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_PARAMETROParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/ban-parametro|R")]
		public async Task<CResult> Get([FromQuery] BAN_PARAMETROParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/ban-parametro|C")]
		public async Task<IActionResult> Post(BAN_PARAMETROTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/ban-parametro|U")]
		public async Task<IActionResult> Put(BAN_PARAMETROTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/ban-parametro|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_PARAMETROTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private int GetCorrEmpresa()
		{
			return int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
		}
	}
}
