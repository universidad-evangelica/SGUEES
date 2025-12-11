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
	
	public class COM_CUADRO_COMPARATIVO_AUTORIZACIONESController : ControllerBase
	{
		private readonly ICOM_CUADRO_COMPARATIVO_AUTORIZACIONESService _service;
		
		public COM_CUADRO_COMPARATIVO_AUTORIZACIONESController(ICOM_CUADRO_COMPARATIVO_AUTORIZACIONESService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> GetAll([FromQuery] COM_CUADRO_COMPARATIVO_AUTORIZACIONESParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> Get([FromQuery] COM_CUADRO_COMPARATIVO_AUTORIZACIONESParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-cuadro-comparativo|C")]
		public async Task<IActionResult> Post(COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			
			var resultado = await _service.CreateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/com-cuadro-comparativo|U")]
		public async Task<IActionResult> Put(COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/com-cuadro-comparativo|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable Data)
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

		[HttpGet("GetAll_COM_CUADRO_COMPARATIVO_AUTORIZA")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|R")]
		public async Task<CResult> GetAll_COM_CUADRO_COMPARATIVO_AUTORIZA([FromQuery] COM_CUADRO_COMPARATIVO_AUTORIZACIONESParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetAll_COM_ORDEN_COMPRA")]
		[Authorize(Policy = "/com-orden-compra|R")]
		public async Task<CResult> GetAll_COM_ORDEN_COMPRA([FromQuery] COM_CUADRO_COMPARATIVO_AUTORIZACIONESParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
	}
}
