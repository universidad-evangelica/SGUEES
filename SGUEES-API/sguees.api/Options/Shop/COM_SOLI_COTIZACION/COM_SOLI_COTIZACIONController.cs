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
	
	public class COM_SOLI_COTIZACIONController : ControllerBase
	{
		private readonly ICOM_SOLI_COTIZACIONService _service;
		
		public COM_SOLI_COTIZACIONController(ICOM_SOLI_COTIZACIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-soli-cotizacion|R")]
		public async Task<CResult> GetAll([FromQuery] COM_SOLI_COTIZACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-soli-cotizacion|R")]
		public async Task<CResult> Get([FromQuery] COM_SOLI_COTIZACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-soli-cotizacion|C")]
		public async Task<IActionResult> Post(COM_SOLI_COTIZACIONTable Data)
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
		[Authorize(Policy = "/com-soli-cotizacion|U")]
		public async Task<IActionResult> Put(COM_SOLI_COTIZACIONTable Data)
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
		[Authorize(Policy = "/com-soli-cotizacion|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_SOLI_COTIZACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.DeleteAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpPost("PostCOM_SOLI_COTIZA_ENCA_DETA")]
		[Authorize(Policy = "/com-soli-cotizacion|C")]
		public async Task<IActionResult> PostCOM_SOLI_COTIZA_ENCA_DETA(COM_SOLI_COTIZACION_ENCA_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.USUARIO_SOLI = Data.USUARIO_CREA;
			
			var resultado = await _service.CreateEncaDetaAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpPost("PutCOM_SOLI_COTIZA_ENCA_DETA")]
		[Authorize(Policy = "/com-soli-cotizacion|U")]
		public async Task<IActionResult> PutCOM_SOLI_COTIZA_ENCA_DETA(COM_SOLI_COTIZACION_ENCA_DETATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			
			var resultado = await _service.UpdateEncaDetaAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}


		#region "Solicitudes de Cotizacion Deta"

			[HttpGet("GetAllCOM_SOLI_COTIZACION_DETA")]
			[Authorize(Policy = "/com-soli-cotizacion|R")]
			public async Task<CResult> GetAllCOM_SOLI_COTIZACION_DETA([FromQuery] COM_SOLI_COTIZACION_DETAParam Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				return await _service.GetAllCOM_SOLI_COTIZACION_DETAAsync(Data);
			}

			[HttpGet("GetAllCOM_CUADRO_COMPARATIVO_SOLI_COTIZACION_DETA")]
			[Authorize(Policy = "/com-cuadro-comparativo|R")]
			public async Task<CResult> GetAllCOM_CUADRO_COMPARATIVO_SOLI_COTIZACION_DETA([FromQuery] COM_SOLI_COTIZACION_DETAParam Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				return await _service.GetAllCOM_SOLI_COTIZACION_DETAAsync(Data);
			}
		
			[HttpGet("GetCOM_SOLI_COTIZACION_DETA")]
			[Authorize(Policy = "/com-soli-cotizacion|R")]
			public async Task<CResult> GetCOM_SOLI_COTIZACION_DETA([FromQuery] COM_SOLI_COTIZACION_DETAParam Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				return await _service.GetCOM_SOLI_COTIZACION_DETAAsync(Data);
			}
		
			[HttpPost("PostCOM_SOLI_COTIZACION_DETA")]
			[Authorize(Policy = "/com-soli-cotizacion|C")]
			public async Task<IActionResult> PostCOM_SOLI_COTIZACION_DETA(COM_SOLI_COTIZACION_DETATable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				Data.CORR_SOLI_COTIZACION_DETA = 0;		
				var resultado = await _service.CreateCOM_SOLI_COTIZACION_DETAAsync(Data, "Admin", "e-coffee");
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return BadRequest(resultado);
				}
			}
		
			[HttpPut("PutCOM_SOLI_COTIZACION_DETA")]
			[Authorize(Policy = "/com-soli-cotizacion|U")]
			public async Task<IActionResult> PutCOM_SOLI_COTIZACION_DETA(COM_SOLI_COTIZACION_DETATable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				
				var resultado = await _service.UpdateCOM_SOLI_COTIZACION_DETAAsync(Data, "Admin", "e-coffee");
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return BadRequest(resultado);
				}
			}
		
			[HttpDelete("DeleteCOM_SOLI_COTIZACION_DETA")]
			[Authorize(Policy = "/com-soli-cotizacion|D")]
			public async Task<IActionResult> DeleteCOM_SOLI_COTIZACION_DETA([FromQuery] COM_SOLI_COTIZACION_DETATable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				var resultado = await _service.DeleteCOM_SOLI_COTIZACION_DETAAsync(Data, "Admin", "e-coffee");
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

			[HttpPut("AnularDeta")]
			[Authorize(Policy = "/com-soli-cotizacion|U")]
			public async Task<IActionResult> AnularDeta(COM_SOLI_COTIZACION_DETATable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
				
				var resultado = await _service.AnularDetaAsync(Data);
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return StatusCode(202, resultado);
				}
			}
		#endregion

		#region "Proveedores de la solicitud"

			[HttpGet("GetAllCOM_SOLI_COTIZACION_PROVEEDOR")]
			[Authorize(Policy = "/com-soli-cotizacion|R")]
			public async Task<CResult> GetAllCOM_SOLI_COTIZACION_PROVEEDOR([FromQuery] COM_SOLI_COTIZACION_PROVEEDORParam Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				return await _service.GetAllCOM_SOLI_COTIZACION_PROVEEDOR(Data);
			}

			[HttpGet("GetAllCOM_CUADRO_COMPARATIVO_SOLI_COTIZACION_PROVEEDOR")]
			[Authorize(Policy = "/com-cuadro-comparativo|R")]
			public async Task<CResult> GetAllCOM_CUADRO_COMPARATIVO_SOLI_COTIZACION_PROVEEDOR([FromQuery] COM_SOLI_COTIZACION_PROVEEDORParam Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				return await _service.GetAllCOM_SOLI_COTIZACION_PROVEEDOR(Data);
			}
		
			[HttpGet("GetCOM_SOLI_COTIZACION_PROVEEDOR")]
			[Authorize(Policy = "/com-soli-cotizacion|R")]
			public async Task<CResult> GetCOM_SOLI_COTIZACION_PROVEEDOR([FromQuery] COM_SOLI_COTIZACION_PROVEEDORParam Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				return await _service.GetCOM_SOLI_COTIZACION_PROVEEDOR(Data);
			}
		
			[HttpPost("PostCOM_SOLI_COTIZACION_PROVEEDOR")]
			[Authorize(Policy = "/com-soli-cotizacion|C")]
			public async Task<IActionResult> PostCOM_SOLI_COTIZACION_PROVEEDOR(List<COM_SOLI_COTIZACION_PROVEEDORView> Data)
			{
				var CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);	
				var USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
				var resultado = await _service.CreateCOM_SOLI_COTIZACION_PROVEEDORAsync(Data, USUARIO_CREA, "e-coffee",CORR_EMPRESA);
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return BadRequest(resultado);
				}
			}
		
			[HttpPut("PutCOM_SOLI_COTIZACION_PROVEEDOR")]
			[Authorize(Policy = "/com-soli-cotizacion|U")]
			public async Task<IActionResult> PutCOM_SOLI_COTIZACION_PROVEEDOR(COM_SOLI_COTIZACION_PROVEEDORTable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				
				var resultado = await _service.UpdateCOM_SOLI_COTIZACION_PROVEEDORAsync(Data, "Admin", "e-coffee");
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return BadRequest(resultado);
				}
			}
		
			[HttpDelete("DeleteCOM_SOLI_COTIZACION_PROVEEDOR")]
			[Authorize(Policy = "/com-soli-cotizacion|D")]
			public async Task<IActionResult> DeleteCOM_SOLI_COTIZACION_PROVEEDOR([FromQuery] COM_SOLI_COTIZACION_PROVEEDORTable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				var resultado = await _service.DeleteCOM_SOLI_COTIZACION_PROVEEDORAsync(Data, "Admin", "e-coffee");
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

			[HttpGet("GetAllPROVEEDOR_DISPONIBLE")]
			[Authorize(Policy = "/com-soli-cotizacion|R")]
			public async Task<CResult> GetAllPROVEEDOR_DISPONIBLE([FromQuery] COM_SOLI_COTIZACION_PROVEEDORParam Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				return await _service.GetAllPROVEEDOR_DISPONIBLE(Data);
			}
			
			[HttpPut("AnularCOM_SOLI_COTIZACION_PROVEEDOR")]
			[Authorize(Policy = "/com-soli-cotizacion|U")]
			public async Task<IActionResult> AnularCOM_SOLI_COTIZACION_PROVEEDOR(COM_SOLI_COTIZACION_PROVEEDORTable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				var vLOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
				var vESTACION="e-coffee";

				var resultado = await _service.AnularCOM_SOLI_COTIZACION_PROVEEDORAsync(Data, vLOGIN_SISTEMA, vESTACION);
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return StatusCode(202, resultado);
				}
			}

			[HttpPut("HabilitarCOM_SOLI_COTIZACION_PROVEEDOR")]
			[Authorize(Policy = "/com-soli-cotizacion|U")]
			public async Task<IActionResult> HabilitarCOM_SOLI_COTIZACION_PROVEEDOR(COM_SOLI_COTIZACION_PROVEEDORTable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				var vLOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
				var vESTACION="e-coffee";

				var resultado = await _service.HabilitarCOM_SOLI_COTIZACION_PROVEEDORAsync(Data, vLOGIN_SISTEMA, vESTACION);
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return StatusCode(202, resultado);
				}
			}
		#endregion

		#region "Solicitudes de Compras Disponible"

		[HttpGet("GetAllSOLICITUD_COMPRAS_DISPONIBLE")]
		[Authorize(Policy = "/com-soli-cotizacion|R")]
		public async Task<CResult> GetAllSOLICITUD_COMPRAS_DISPONIBLE([FromQuery] COM_SOLI_COTIZACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllSOLICITUD_COMPRAS_DISPONIBLE(Data);
		}

		[HttpGet("GetAllSOLICITUD_COMPRAS_DETA_DISPONIBLE")]
		[Authorize(Policy = "/com-soli-cotizacion|R")]
		public async Task<CResult> GetAllSOLICITUD_COMPRAS_DETA_DISPONIBLE([FromQuery] COM_SOLI_COTIZACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllSOLICITUD_COMPRAS_DETA_DISPONIBLE(Data);
		}
		#endregion

		[HttpPut("Solicitar")]
		[Authorize(Policy = "/com-soli-cotizacion|U")]
		public async Task<IActionResult> Solicitar(COM_SOLI_COTIZACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			
			var resultado = await _service.SolicitarAsync(Data);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return StatusCode(202, resultado);
			}
		}

		
		[HttpGet("getPDF")]
		[Authorize(Policy = "/com-soli-cotizacion|P")]
		public async Task<Stream> getPDF([FromQuery] COM_SOLI_COTIZACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Stream vPDF = null;
			vPDF = await _service.GetPDFAsync(Data);
			
			Response.Headers.ContentType = "application/pdf";
			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(vPDF);

      		return vPDF;
		}
	
		[HttpPut("Anular")]
		[Authorize(Policy = "/com-soli-cotizacion|U")]
		public async Task<IActionResult> Anular(COM_SOLI_COTIZACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			
			var resultado = await _service.AnularAsync(Data);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return StatusCode(202, resultado);
			}
		}

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/com-soli-cotizacion|U")]
		public async Task<IActionResult> Aplicar(COM_SOLI_COTIZACIONTable Data)
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
