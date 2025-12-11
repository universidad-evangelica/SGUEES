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
	
	public class GEN_TIPO_DOCUMENTOController : ControllerBase
	{
		private readonly IGEN_TIPO_DOCUMENTOService _service;
		
		public GEN_TIPO_DOCUMENTOController(IGEN_TIPO_DOCUMENTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-tipo-documento|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_TIPO_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/gen-tipo-documento|R")]
		public async Task<CResult> Get([FromQuery] GEN_TIPO_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/gen-tipo-documento|C")]
		public async Task<IActionResult> Post(GEN_TIPO_DOCUMENTOTable Data)
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
		[Authorize(Policy = "/gen-tipo-documento|U")]
		public async Task<IActionResult> Put(GEN_TIPO_DOCUMENTOTable Data)
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
		[Authorize(Policy = "/gen-tipo-documento|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_TIPO_DOCUMENTOTable Data)
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

		[HttpGet("GetCORR_TIPO_DOC_COM_DOCUMENTO")]
        [Authorize(Policy = "/com-documento|R")]
        public async Task<CResult> GetCORR_TIPO_DOC_COM_DOCUMENTO([FromQuery] GEN_TIPO_DOCUMENTOParam Data)
        {
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetTipoDocumentosAsync(Data);
        }
	}
}
