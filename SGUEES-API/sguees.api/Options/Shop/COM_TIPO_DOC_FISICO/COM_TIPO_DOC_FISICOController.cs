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
	
	public class COM_TIPO_DOC_FISICOController : ControllerBase
	{
		private readonly ICOM_TIPO_DOC_FISICOService _service;
		
		public COM_TIPO_DOC_FISICOController(ICOM_TIPO_DOC_FISICOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-tipo-doc-fisico|R")]
		public async Task<CResult> GetAll([FromQuery] COM_TIPO_DOC_FISICOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-tipo-doc-fisico|R")]
		public async Task<CResult> Get([FromQuery] COM_TIPO_DOC_FISICOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-tipo-doc-fisico|C")]
		public async Task<IActionResult> Post(COM_TIPO_DOC_FISICOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
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
		[Authorize(Policy = "/com-tipo-doc-fisico|U")]
		public async Task<IActionResult> Put(COM_TIPO_DOC_FISICOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
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
		[Authorize(Policy = "/com-tipo-doc-fisico|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_TIPO_DOC_FISICOTable Data)
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

		[HttpGet("GetCORR_TIPO_DOCUMENTO_COM_SOLI_COTIZACION")]
		[Authorize(Policy = "/com-soli-cotizacion|R")]
		public async Task<CResult> GetCORR_TIPO_DOCUMENTO_COM_SOLI_COTIZACION([FromQuery] COM_TIPO_DOC_FISICOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_TIPO_DOCUMENTO_COM_COTIZACION")]
		[Authorize(Policy = "/com-cotizacion|R")]
		public async Task<CResult> GetCORR_TIPO_DOCUMENTO_COM_COTIZACION([FromQuery] COM_TIPO_DOC_FISICOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_TIPO_DOCUMENTO_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetCORR_TIPO_DOCUMENTO_COM_PROVEEDOR([FromQuery] COM_TIPO_DOC_FISICOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_TIPO_DOCUMENTO_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
		public async Task<CResult> GetCORR_TIPO_DOCUMENTO_COM_PROVEEDOR_ACTU([FromQuery] COM_TIPO_DOC_FISICOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_TIPO_DOCUMENTO_COM_CUADRO_COMPARATIVO")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> GetCORR_TIPO_DOCUMENTO_COM_CUADRO_COMPARATIVO([FromQuery] COM_TIPO_DOC_FISICOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_TIPO_DOCUMENTO_COM_CUADRO_COMPARATIVO_AUTORIZAR")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|R")]
		public async Task<CResult> GetCORR_TIPO_DOCUMENTO_COM_CUADRO_COMPARATIVO_AUTORIZAR([FromQuery] COM_TIPO_DOC_FISICOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
	}
}
