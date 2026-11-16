using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class COM_ORDEN_COMPRA_DETAController : ControllerBase
	{
		private readonly ICOM_ORDEN_COMPRA_DETAService _service;

		public COM_ORDEN_COMPRA_DETAController(ICOM_ORDEN_COMPRA_DETAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-orden-compra|R")]
		public async Task<CResult> GetAll([FromQuery] COM_ORDEN_COMPRA_DETAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/com-orden-compra|R")]
		public async Task<CResult> Get([FromQuery] COM_ORDEN_COMPRA_DETAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/com-orden-compra|C")]
		public async Task<IActionResult> Post(COM_ORDEN_COMPRA_DETATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var login = GetUsuario();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_CREA = login;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = estacion;
			Data.USUARIO_ACTU = login;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = estacion;

			var resultado = await _service.CreateAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/com-orden-compra|U")]
		public async Task<IActionResult> Put(COM_ORDEN_COMPRA_DETATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			this.ApplyQueryKeys(
				Data,
				nameof(COM_ORDEN_COMPRA_DETATable.ANIO_PERIODO),
				nameof(COM_ORDEN_COMPRA_DETATable.CORR_ORDEN_COMPRA),
				nameof(COM_ORDEN_COMPRA_DETATable.CORR_ORDEN_COMPRA_DETA));

			var login = GetUsuario();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = login;
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = estacion;

			var resultado = await _service.UpdateAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/com-orden-compra|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_ORDEN_COMPRA_DETATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var login = GetUsuario();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = login;
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = estacion;

			var resultado = await _service.DeleteAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private int GetCorrEmpresa()
		{
			return int.Parse(User.Claims.ToList().Single(e => e.Type == "CORR_EMPRESA").Value);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().Single(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
		}
	}
}
