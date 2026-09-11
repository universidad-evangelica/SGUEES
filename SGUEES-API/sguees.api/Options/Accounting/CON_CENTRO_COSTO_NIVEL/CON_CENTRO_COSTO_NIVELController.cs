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
	// Qué hace: endpoints REST del catálogo de niveles de centro de costo.
	// Cómo lo hace: políticas /con-centro-costo-nivel|R|C|U|D y empresa de sesión.
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class CON_CENTRO_COSTO_NIVELController : ControllerBase
	{
		private const string PolicyBase = "/con-centro-costo-nivel";
		private readonly ICON_CENTRO_COSTO_NIVELService _service;

		public CON_CENTRO_COSTO_NIVELController(ICON_CENTRO_COSTO_NIVELService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		private int GetCorrEmpresa()
		{
			return int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = PolicyBase + "|R")]
		public async Task<CResult> GetAll([FromQuery] CON_CENTRO_COSTO_NIVELParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = PolicyBase + "|R")]
		public async Task<CResult> Get([FromQuery] CON_CENTRO_COSTO_NIVELParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = PolicyBase + "|C")]
		public async Task<IActionResult> Post(CON_CENTRO_COSTO_NIVELTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(
				Data,
				User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = PolicyBase + "|U")]
		public async Task<IActionResult> Put(CON_CENTRO_COSTO_NIVELTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(
				Data,
				User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = PolicyBase + "|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_CENTRO_COSTO_NIVELTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// Qué hace: lookup de niveles para el mtto de centros de costo.
		[HttpGet("GetCORR_CENTRO_COSTO_NIVEL_CON_CENTRO_COSTO")]
		[Authorize(Policy = "/con-centro-costo|R")]
		public async Task<CResult> GetCORR_CENTRO_COSTO_NIVEL_CON_CENTRO_COSTO([FromQuery] CON_CENTRO_COSTO_NIVELParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}
	}
}
