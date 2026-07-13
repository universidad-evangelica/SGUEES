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
	
	public class SC_REQUISICION_OBSERVADORESController : ControllerBase
	{
		private readonly ISC_REQUISICION_OBSERVADORESService _service;
		
		public SC_REQUISICION_OBSERVADORESController(ISC_REQUISICION_OBSERVADORESService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-requisicion-observadores|R")]
		public async Task<CResult> GetAll([FromQuery] SC_REQUISICION_OBSERVADORESParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/sc-requisicion-observadores|R")]
		public async Task<CResult> Get([FromQuery] SC_REQUISICION_OBSERVADORESParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/sc-requisicion-observadores|C")]
		public async Task<IActionResult> Post(SC_REQUISICION_OBSERVADORESTable Data)
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

		/// <summary>
		/// Alta de observador desde sc-requisicion-personal.
		/// Insert + relectura con GetAllBy_CORR_REQUISICION_PERSONAL (DEFECTO + de la requisición).
		/// </summary>
		[HttpPost("Create_SC_REQUISICION_PERSONAL")]
		[Authorize(Policy = "/sc-requisicion-personal|C")]
		public async Task<IActionResult> Create_SC_REQUISICION_PERSONAL(SC_REQUISICION_OBSERVADORESTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;

			var resultado = await _service.CreateBy_CORR_REQUISICION_PERSONAL(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return BadRequest(resultado);
		}
		
		[HttpPut]
		[Authorize(Policy = "/sc-requisicion-observadores|U")]
		public async Task<IActionResult> Put(SC_REQUISICION_OBSERVADORESTable Data)
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
		[Authorize(Policy = "/sc-requisicion-observadores|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_REQUISICION_OBSERVADORESTable Data)
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

		[HttpGet("GetLOGIN_SISTEMA_SC_REQUISICION_PERSONAL")]
		[Authorize(Policy = "/sc-requisicion-personal|R")]
		public async Task<CResult> GetLOGIN_SISTEMA_SC_REQUISICION_PERSONAL([FromQuery] SC_REQUISICION_OBSERVADORESParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllBy_CORR_REQUISICION_PERSONAL(Data);
		}
	}
}
