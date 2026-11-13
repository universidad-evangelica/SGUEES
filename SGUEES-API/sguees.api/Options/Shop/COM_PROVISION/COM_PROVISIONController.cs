using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using eadmindevprojectmanagement.Models;
using eadmindevprojectmanagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eadmindevprojectmanagement.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class COM_PROVISIONController : ControllerBase
	{
		private readonly ICOM_PROVISIONService _service;

		public COM_PROVISIONController(ICOM_PROVISIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-provision|R")]
		public async Task<CResult> GetAll([FromQuery] COM_PROVISIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/com-provision|R")]
		public async Task<CResult> Get([FromQuery] COM_PROVISIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetAllDesAplicar")]
		[Authorize(Policy = "/com-provision|R")]
		public async Task<CResult> GetAllDesAplicar([FromQuery] COM_PROVISIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllDesAplicarAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/com-provision|C")]
		public async Task<IActionResult> Post(COM_PROVISIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.CreateAsync(Data, "Admin", "e-coffee");
			if (resultado.Result)
			{
				return StatusCode(201, resultado);
			}

			return BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/com-provision|U")]
		public async Task<IActionResult> Put(COM_PROVISIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.UpdateAsync(Data, "Admin", "e-coffee");
			if (resultado.Result)
			{
				return StatusCode(201, resultado);
			}

			return BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/com-provision|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_PROVISIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.DeleteAsync(Data, "Admin", "e-coffee");
			if (resultado.Result)
			{
				return Ok(resultado);
			}

			return BadRequest(resultado);
		}

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/com-provision|U")]
		public async Task<IActionResult> Aplicar(COM_PROVISIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();

			var resultado = await _service.AplicarAsync(Data);

			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return StatusCode(202, resultado);
		}

		[HttpPut("Anular")]
		[Authorize(Policy = "/com-provision|U")]
		public async Task<IActionResult> Anular(COM_PROVISIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			if (!Data.FECHA_ANULACION.HasValue)
			{
				Data.FECHA_ANULACION = DateTime.Today;
			}

			var resultado = await _service.AnularAsync(Data);

			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return StatusCode(202, resultado);
		}

		[HttpPut("DesAplicar")]
		[Authorize(Policy = "/com-provision-desaplicar|U")]
		public async Task<IActionResult> DesAplicar(COM_PROVISIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();

			var resultado = await _service.DesAplicarAsync(Data);

			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return StatusCode(202, resultado);
		}

		[HttpPut("BorrarDetalle")]
		[Authorize(Policy = "/com-provision|U")]
		public async Task<IActionResult> BorrarDetalle(COM_PROVISIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.BorrarDetalleAsync(Data, "Admin", "e-coffee");
			if (resultado.Result)
			{
				return StatusCode(201, resultado);
			}

			return BadRequest(resultado);
		}

		[HttpPut("GenerarConta")]
		[Authorize(Policy = "/com-provision|U")]
		public async Task<IActionResult> GenerarConta(COM_PROVISIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.GenerarContaAsync(Data, "Admin", "e-coffee");
			if (resultado.Result)
			{
				return StatusCode(201, resultado);
			}

			return BadRequest(resultado);
		}
	}
}
