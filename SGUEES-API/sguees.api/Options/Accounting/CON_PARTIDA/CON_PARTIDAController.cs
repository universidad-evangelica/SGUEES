using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class CON_PARTIDAController : ControllerBase
	{
		private readonly ICON_PARTIDAService _service;
		public CON_PARTIDAController(ICON_PARTIDAService service) { _service = service ?? throw new ArgumentNullException(nameof(_service)); }

		[HttpGet("GetAll")]
		[Authorize(Policy = "/con-partida|R")]
		public async Task<CResult> GetAll([FromQuery] CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/con-partida|R")]
		public async Task<CResult> Get([FromQuery] CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/con-partida|C")]
		public async Task<IActionResult> Post(CON_PARTIDATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/con-partida|U")]
		public async Task<IActionResult> Put(CON_PARTIDATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/con-partida|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_PARTIDATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetAllAplicar")]
		[Authorize(Policy = "/con-partida-aplicar|R")]
		public async Task<CResult> GetAllAplicar([FromQuery] CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.OPCION_CONSULTA = 1;
			return await _service.GetAllAplicarAsync(Data);
		}

		[HttpGet("GetAllDesAplicar")]
		[Authorize(Policy = "/con-partida-desaplicar|R")]
		public async Task<CResult> GetAllDesAplicar([FromQuery] CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.OPCION_CONSULTA = 2;
			return await _service.GetAllAplicarAsync(Data);
		}

		[HttpGet("GetAllAnular")]
		[Authorize(Policy = "/con-partida-anular|R")]
		public async Task<CResult> GetAllAnular([FromQuery] CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.OPCION_CONSULTA = 2;
			return await _service.GetAllAplicarAsync(Data);
		}

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/con-partida-aplicar|U")]
		public async Task<IActionResult> Aplicar(CON_PARTIDATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.AplicarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("DesAplicar")]
		[Authorize(Policy = "/con-partida-desaplicar|U")]
		public async Task<IActionResult> DesAplicar(CON_PARTIDATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.DesAplicarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Anular")]
		[Authorize(Policy = "/con-partida-anular|U")]
		public async Task<IActionResult> Anular(CON_PARTIDATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.AnularAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("CrearPartidaModelo")]
		[Authorize(Policy = "/con-partida|U")]
		public async Task<IActionResult> CrearPartidaModelo(CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var vLOGIN = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var vESTACION = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.CrearPartidaModeloAsync(Data, vLOGIN, vESTACION);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("CrearModelo")]
		[Authorize(Policy = "/con-partida|U")]
		public async Task<IActionResult> CrearModelo(CON_PARTIDATable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.CrearModeloAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPost("ImportarExcel")]
		[Authorize(Policy = "/con-partida|C")]
		public async Task<IActionResult> ImportarExcel(CON_PARTIDA_IMPORTParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var vLOGIN = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var vESTACION = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.ImportarExcelAsync(Data, vLOGIN, vESTACION);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpGet("GetAllDetaDoc")]
		[Authorize(Policy = "/con-partida|R")]
		public async Task<CResult> GetAllDetaDoc([FromQuery] CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllDetaDocAsync(Data);
		}

		[HttpPost("getPDF")]
		[Authorize(Policy = "/con-partida|P")]
		public async Task<IActionResult> GetPDF([FromBody] CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? "";
			try
			{
				var stream = await _service.GetPDFAsync(Data, login);
				if (stream == null)
				{
					return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = "No se pudo generar el PDF de la partida." });
				}
				return File(stream, "application/pdf", "PARTIDA_CONTABLE.pdf");
			}
			catch (System.InvalidOperationException ex)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = ex.Message });
			}
			catch (System.Exception ex)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = ex.Message });
			}
		}

		[HttpPut("GenerarPartidaLiquidacion")]
		[Authorize(Policy = "/con-partida|U")]
		public async Task<IActionResult> GenerarPartidaLiquidacion(CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value?.ToLower() ?? "";
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.GenerarPartidaLiquidacionAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("GenerarPartidaCierre")]
		[Authorize(Policy = "/con-partida|U")]
		public async Task<IActionResult> GenerarPartidaCierre(CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value?.ToLower() ?? "";
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.GenerarPartidaCierreAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("GenerarPartidaApertura")]
		[Authorize(Policy = "/con-partida|U")]
		public async Task<IActionResult> GenerarPartidaApertura(CON_PARTIDAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value?.ToLower() ?? "";
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.GenerarPartidaAperturaAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
