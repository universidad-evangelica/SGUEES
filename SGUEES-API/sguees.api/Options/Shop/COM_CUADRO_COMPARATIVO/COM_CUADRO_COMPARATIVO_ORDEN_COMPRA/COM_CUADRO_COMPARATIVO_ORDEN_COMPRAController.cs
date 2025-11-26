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
	
	public class COM_CUADRO_COMPARATIVO_ORDEN_COMPRAController : ControllerBase
	{
		private readonly ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRAService _service;
		
		public COM_CUADRO_COMPARATIVO_ORDEN_COMPRAController(ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> GetAll([FromQuery] COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> Get([FromQuery] COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-cuadro-comparativo|C")]
		public async Task<IActionResult> Post(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data)
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
		public async Task<IActionResult> Put(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data)
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
		[Authorize(Policy = "/com-cuadro-comparativo-orden-compra|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data)
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

		[HttpGet("getPDF")]
		[Authorize(Policy = "/com-cuadro-comparativo|P")]
		public async Task<Stream> getPDF([FromQuery] COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Stream vPDF = null;
			vPDF = await _service.GetPDFAsync(Data);
			
			Response.Headers.ContentType = "application/pdf";
			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(vPDF);

      		return vPDF;
		}
	}
}
