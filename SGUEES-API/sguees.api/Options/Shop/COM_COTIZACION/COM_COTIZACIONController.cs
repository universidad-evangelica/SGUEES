using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  scuees.Models;
using  scuees.Services;

namespace scuees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class COM_COTIZACIONController : ControllerBase
	{
		private readonly ICOM_COTIZACIONService _service;
		
		public COM_COTIZACIONController(ICOM_COTIZACIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-cotizacion|R")]
		public async Task<CResult> GetAll([FromQuery] COM_COTIZACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.LOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-cotizacion|R")]
		public async Task<CResult> Get([FromQuery] COM_COTIZACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-cotizacion|C")]
		public async Task<IActionResult> Post(COM_COTIZACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			
			var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/com-cotizacion|U")]
		public async Task<IActionResult> Put(COM_COTIZACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/com-cotizacion|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_COTIZACIONTable Data)
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

		#region "Cotizacion Deta"

			[HttpGet("GetAllCOM_COTIZACION_DETA")]
			[Authorize(Policy = "/com-cotizacion|R")]
			public async Task<CResult> GetAllCOM_COTIZACION_DETA([FromQuery] COM_COTIZACION_DETAParam Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				return await _service.GetAllCOM_COTIZACION_DETAAsync(Data);
			}
		
			[HttpGet("GetCOM_COTIZACION_DETA")]
			[Authorize(Policy = "/com-cotizacion|R")]
			public async Task<CResult> GetCOM_COTIZACION_DETA([FromQuery] COM_COTIZACION_DETAParam Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				return await _service.GetCOM_COTIZACION_DETAAsync(Data);
			}
		
			[HttpPost("PostCOM_COTIZACION_DETA")]
			[Authorize(Policy = "/com-cotizacion|C")]
			public async Task<IActionResult> PostCOM_COTIZACION_DETA(COM_COTIZACION_DETATable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				Data.CORR_COTIZACION_DETA = 0;		
				var resultado = await _service.CreateCOM_COTIZACION_DETAAsync(Data, "Admin", "e-coffee");
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return BadRequest(resultado);
				}
			}
		
			[HttpPut("PutCOM_COTIZACION_DETA")]
			[Authorize(Policy = "/com-cotizacion|U")]
			public async Task<IActionResult> PutCOM_COTIZACION_DETA(COM_COTIZACION_DETATable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				
				var resultado = await _service.UpdateCOM_COTIZACION_DETAAsync(Data, "Admin", "e-coffee");
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return BadRequest(resultado);
				}
			}
		
			[HttpDelete("DeleteCOM_COTIZACION_DETA")]
			[Authorize(Policy = "/com-cotizacion|D")]
			public async Task<IActionResult> DeleteCOM_COTIZACION_DETA([FromQuery] COM_COTIZACION_DETATable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				var resultado = await _service.DeleteCOM_COTIZACION_DETAAsync(Data, "Admin", "e-coffee");
				if (resultado.ErrorCode >= 0)
				{
					if (resultado.Result) {
						return StatusCode(201, resultado);
					} else {
						return Ok(resultado);
					}
				} else {
					return BadRequest(resultado);
				}
			}
	
		#endregion

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/com-cotizacion|U")]
		public async Task<IActionResult> Aplicar(COM_COTIZACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			
			var resultado = await _service.AplicarAsync(Data);
			
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return StatusCode(202, resultado);
			}
		}
	}
}
