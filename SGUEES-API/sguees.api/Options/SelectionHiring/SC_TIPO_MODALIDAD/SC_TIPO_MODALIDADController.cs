using sguees.api.Shared;
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
	
	public class SC_TIPO_MODALIDADController : ControllerBase
	{
		private readonly ISC_TIPO_MODALIDADService _service;
		
		public SC_TIPO_MODALIDADController(ISC_TIPO_MODALIDADService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-tipo-modalidad|R")]
		public async Task<CResult> GetAll([FromQuery] SC_TIPO_MODALIDADParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/sc-tipo-modalidad|R")]
		public async Task<CResult> Get([FromQuery] SC_TIPO_MODALIDADParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/sc-tipo-modalidad|C")]
		public async Task<IActionResult> Post(SC_TIPO_MODALIDADTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			
			var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/sc-tipo-modalidad|U")]
		public async Task<IActionResult> Put(SC_TIPO_MODALIDADTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/sc-tipo-modalidad|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_TIPO_MODALIDADTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}
	}
}
