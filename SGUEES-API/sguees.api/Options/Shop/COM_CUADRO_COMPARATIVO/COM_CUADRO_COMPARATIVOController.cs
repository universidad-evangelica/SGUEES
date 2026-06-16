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
	
	public class COM_CUADRO_COMPARATIVOController : ControllerBase
	{
		private readonly ICOM_CUADRO_COMPARATIVOService _service;
		
		public COM_CUADRO_COMPARATIVOController(ICOM_CUADRO_COMPARATIVOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> GetAll([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> Get([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-cuadro-comparativo|C")]
		public async Task<IActionResult> Post(COM_CUADRO_COMPARATIVOTable Data)
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
		[Authorize(Policy = "/com-cuadro-comparativo|U")]
		public async Task<IActionResult> Put(COM_CUADRO_COMPARATIVOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			var resultado = await _service.UpdateAsync(Data, Data.USUARIO_CREA,Data.ESTACION_CREA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/com-cuadro-comparativo|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_CUADRO_COMPARATIVOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.DeleteAsync(Data, Data.USUARIO_CREA,Data.ESTACION_CREA);
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		#region "Cudro Comparativo Deta"
			[HttpPut("PutCOM_CUADRO_COMPARATIVO_DETA")]
			[Authorize(Policy = "/com-cuadro-comparativo|U")]
			public async Task<IActionResult> PutCOM_COTIZACION_DETA(COM_CUADRO_COMPARATIVO_DETA_UPDATEDTable Data)
			{
				Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
				
				var resultado = await _service.UpdateCOM_CUADRO_COMPARATIVO_DETAAsync(Data, "Admin", "e-coffee");
				if (resultado.ErrorCode == 0)
				{
					return StatusCode(201, resultado);
				} else {
					return BadRequest(resultado);
				}
			}
		#endregion
		#region "Solicitudes de Cotizacion Disponible"

		[HttpGet("GetAllSOLICITUD_COTIZACION_DISPONIBLE")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> GetAllSOLICITUD_COMPRAS_DISPONIBLE([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllSOLICITUD_COTIZACION_DISPONIBLE(Data);
		}

		[HttpGet("GetAllSOLICITUD_COTIZACION_DETA_DISPONIBLE")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> GetAllSOLICITUD_COTIZACION_DETA_DISPONIBLE([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllSOLICITUD_COTIZACION_DETA_DISPONIBLE(Data);
		}
		#endregion

		[HttpPut("Solicitar")]
		[Authorize(Policy = "/com-cuadro-comparativo|U")]
		public async Task<IActionResult> Solicitar(COM_CUADRO_COMPARATIVOTable Data)
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

		[HttpPost("COM_CUADRO_COMPARATIVO_GENERAR")]
		[Authorize(Policy = "/com-cuadro-comparativo|C")]
		public async Task<IActionResult> COM_CUADRO_COMPARATIVO_GENERAR(COM_CUADRO_COMPARATIVO_SOLI_COTIZACIONTable Data)
		{			
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();		
			var resultado = await _service.COM_CUADRO_COMPARATIVO_GENERAR(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(Data);
		}

		[HttpGet("getAllCOM_CUADRO_COMPARATIVO_DETA")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> getAllCOM_CUADRO_COMPARATIVO_DETA([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.getAllCOM_CUADRO_COMPARATIVO_DETA(Data);
		}

		[HttpGet("getPDF")]
		[Authorize(Policy = "/com-cuadro-comparativo|P")]
		public async Task<Stream> getPDF([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Stream vPDF = null;
			vPDF = await _service.GetPDFAsync(Data);
			
			Response.Headers.ContentType = "application/pdf";
			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(vPDF);

      		return vPDF;
		}

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/com-cuadro-comparativo|U")]
		public async Task<IActionResult> Aplicar(COM_CUADRO_COMPARATIVOTable Data)
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

		[HttpGet("GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA(Data);
		}

		[HttpPost("UPDATE_COM_CUADRO_COMPARATIVO_DETA")]
		[Authorize(Policy = "/com-cuadro-comparativo|C")]
		public async Task<IActionResult> UPDATE_COM_CUADRO_COMPARATIVO_DETA(List<COM_CUADRO_COMPARATIVO_COTIZACION_DETAView> Data)
		{			
			string vLOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			
			var resultado = await _service.UPDATE_COM_CUADRO_COMPARATIVO_DETAAsync(Data, vLOGIN_SISTEMA, vLOGIN_SISTEMA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
	
		#region "Cudro Comparativo Autorizar"
		[HttpGet("GetAll_SOLICITADOS")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|R")]
		public async Task<CResult> GetAll_SOLICITADOS([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			return await _service.GetAllSolicitadosAsync(Data);
		}	

		[HttpPut("updateCOM_CUADRO_COMPARATIVO_AUTORIZAR")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|U")]
		public async Task<IActionResult> updateCOM_CUADRO_COMPARATIVO_AUTORIZAR(COM_CUADRO_COMPARATIVOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			var resultado = await _service.UpdateAutorizarAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpPut("PutCOM_CUADRO_COMPARATIVO_DETA_AUTORIZAR")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|U")]
		public async Task<IActionResult> PutCOM_CUADRO_COMPARATIVO_DETA_AUTORIZAR(COM_CUADRO_COMPARATIVO_DETA_UPDATEDTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			
			var resultado = await _service.UpdateCOM_CUADRO_COMPARATIVO_DETAAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR_AUTORIZAR")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|R")]
		public async Task<CResult> getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR_AUTORIZAR([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(Data);
		}
		
		[HttpGet("getAllCOM_CUADRO_COMPARATIVO_DETA_AUTORIZAR")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|R")]
		public async Task<CResult> getAllCOM_CUADRO_COMPARATIVO_DETA_AUTORIZAR([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.getAllCOM_CUADRO_COMPARATIVO_DETA(Data);
		}
		
		[HttpGet("getPDF_COM_CUADRO_COMPARATIVO_AUTORIZAR")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|P")]
		public async Task<Stream> getPDF_COM_CUADRO_COMPARATIVO_AUTORIZAR([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Stream vPDF = null;
			vPDF = await _service.GetPDFAsync(Data);
			
			Response.Headers.ContentType = "application/pdf";
			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(vPDF);

      		return vPDF;
		}
		
		[HttpGet("GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA_AUTORIZAR")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|R")]
		public async Task<CResult> GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA_AUTORIZAR([FromQuery] COM_CUADRO_COMPARATIVOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA(Data);
		}

		[HttpPost("UPDATE_COM_CUADRO_COMPARATIVO_DETA_AUTORIZAR")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|C")]
		public async Task<IActionResult> UPDATE_COM_CUADRO_COMPARATIVO_DETA_AUTORIZAR(List<COM_CUADRO_COMPARATIVO_COTIZACION_DETAView> Data)
		{			
			string vLOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			
			var resultado = await _service.UPDATE_COM_CUADRO_COMPARATIVO_DETAAsync(Data, vLOGIN_SISTEMA, vLOGIN_SISTEMA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpPut("Autorizar")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|U")]
		public async Task<IActionResult> Autorizar(COM_CUADRO_COMPARATIVOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			
			var resultado = await _service.AutorizarAsync(Data);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return StatusCode(202, resultado);
			}
		}

		[HttpPut("Rechazar")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|U")]
		public async Task<IActionResult> Rechazar(COM_CUADRO_COMPARATIVOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			
			var resultado = await _service.RechazarAsync(Data);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return StatusCode(202, resultado);
			}
		}
		#endregion
	}
}
