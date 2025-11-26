using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  eadmindevprojectmanagement.Models;
using  eadmindevprojectmanagement.Services;

namespace eadmindevprojectmanagement.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class COM_DOCUMENTO_TOTALController : ControllerBase
	{
		private readonly ICOM_DOCUMENTO_TOTALService _service;
		
		public COM_DOCUMENTO_TOTALController(ICOM_DOCUMENTO_TOTALService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetAll([FromQuery] COM_DOCUMENTO_TOTALParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> Get([FromQuery] COM_DOCUMENTO_TOTALParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-documento|C")]
		public async Task<IActionResult> Post(COM_DOCUMENTO_TOTALTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			
			var resultado = await _service.CreateAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> Put(COM_DOCUMENTO_TOTALTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/com-documento|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_DOCUMENTO_TOTALTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetRubrosTemporales")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetRubrosTemporales([FromQuery] COM_DOCUMENTO_TOTALParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllRubrosTemporalesAsync(Data);
		}
	}
}
