using System;
using System.IO;
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
	public class COM_ORDEN_COMPRAController : ControllerBase
	{
		private readonly ICOM_ORDEN_COMPRAService _service;

		public COM_ORDEN_COMPRAController(ICOM_ORDEN_COMPRAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-orden-compra|R")]
		public async Task<CResult> GetAll([FromQuery] COM_ORDEN_COMPRAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.LOGIN_SISTEMA = GetUsuario();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/com-orden-compra|R")]
		public async Task<CResult> Get([FromQuery] COM_ORDEN_COMPRAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/com-orden-compra|C")]
		public async Task<IActionResult> Post(COM_ORDEN_COMPRATable Data)
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
			return resultado.Result ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/com-orden-compra|U")]
		public async Task<IActionResult> Put(COM_ORDEN_COMPRATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			this.ApplyQueryKeys(
				Data,
				nameof(COM_ORDEN_COMPRATable.ANIO_PERIODO),
				nameof(COM_ORDEN_COMPRATable.CORR_ORDEN_COMPRA));

			var login = GetUsuario();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = login;
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = estacion;

			var resultado = await _service.UpdateAsync(Data, login, estacion);
			return resultado.Result ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/com-orden-compra|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_ORDEN_COMPRATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var login = GetUsuario();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = login;
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = estacion;

			var resultado = await _service.DeleteAsync(Data, login, estacion);
			return resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/com-orden-compra|U")]
		public async Task<IActionResult> Aplicar(COM_ORDEN_COMPRATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			this.ApplyQueryKeys(
				Data,
				nameof(COM_ORDEN_COMPRATable.ANIO_PERIODO),
				nameof(COM_ORDEN_COMPRATable.CORR_ORDEN_COMPRA));

			var login = GetUsuario();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.AplicarAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpPut("Anular")]
		[Authorize(Policy = "/com-orden-compra|U")]
		public async Task<IActionResult> Anular(COM_ORDEN_COMPRATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			this.ApplyQueryKeys(
				Data,
				nameof(COM_ORDEN_COMPRATable.ANIO_PERIODO),
				nameof(COM_ORDEN_COMPRATable.CORR_ORDEN_COMPRA));

			var login = GetUsuario();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.AnularAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpPut("DesAplicar")]
		[Authorize(Policy = "/com-orden-compra|U")]
		public async Task<IActionResult> DesAplicar(COM_ORDEN_COMPRATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			this.ApplyQueryKeys(
				Data,
				nameof(COM_ORDEN_COMPRATable.ANIO_PERIODO),
				nameof(COM_ORDEN_COMPRATable.CORR_ORDEN_COMPRA));

			var login = GetUsuario();
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.DesAplicarAsync(Data, login, estacion);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpGet("getPDF")]
		[Authorize(Policy = "/com-orden-compra|P")]
		public async Task<Stream> getPDF([FromQuery] COM_ORDEN_COMPRAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var vPDF = await _service.GetPDFAsync(Data);

			Response.Headers.ContentType = "application/pdf";
			Response.Headers.ContentDisposition = "inline";
			if (vPDF != null)
			{
				Response.RegisterForDispose(vPDF);
			}

			return vPDF;
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
