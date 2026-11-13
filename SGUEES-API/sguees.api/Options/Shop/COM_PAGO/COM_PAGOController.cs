using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using eadmindevprojectmanagement.Models;
using eadmindevprojectmanagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;

namespace eadmindevprojectmanagement.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class COM_PAGOController : ControllerBase
	{
		private readonly ICOM_PAGOService _service;

		public COM_PAGOController(ICOM_PAGOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> GetAll([FromQuery] COM_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> Get([FromQuery] COM_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/com-pago|C")]
		public async Task<IActionResult> Post(COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.CreateAsync(Data, login, estacion);
			return resultado.Result ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> Put(COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.UpdateAsync(Data, login, estacion);
			return resultado.Result ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/com-pago|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.DeleteAsync(Data, login, estacion);
			return resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("BorrarDetalle")]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> BorrarDetalle(COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.BorrarDetalleAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> Aplicar(COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.AplicarAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpPut("DesAplicar")]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> DesAplicar(COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.DesAplicarAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpGet("GetAllDesAplicar")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> GetAllDesAplicar([FromQuery] COM_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllDesAplicarAsync(Data);
		}

		[HttpPut("Anular")]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> Anular(COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.AnularAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpPut("ActualizarCuenta")]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> ActualizarCuenta(COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.ActualizarCuentaAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpPut("AsignarArchivo")]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> AsignarArchivo(COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.AsignarArchivoAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpPut("GenerarConta")]
		[Authorize(Policy = "/com-pago|U")]
		public async Task<IActionResult> GenerarConta(COM_PAGOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			var login = User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.GenerarContaAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpGet("GetAllDoc")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> GetAllDoc([FromQuery] COM_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllDocAsync(Data);
		}

		[HttpGet("GetBeneficiario")]
		[Authorize(Policy = "/com-pago|R")]
		public async Task<CResult> GetBeneficiario([FromQuery] COM_PAGOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetBeneficiarioAsync(Data);
		}
	}
}
