using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
	[Authorize]
	[ApiController]
	[Route("[controller]")]
	public class SC_EXPEDIENTE_CANDIDATOController : ControllerBase
	{
		private readonly ISC_EXPEDIENTE_CANDIDATOService _service;

		public SC_EXPEDIENTE_CANDIDATOController(ISC_EXPEDIENTE_CANDIDATOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-expediente-candidato|R")]
		public async Task<CResult> GetAll([FromQuery] SC_EXPEDIENTE_CANDIDATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/sc-expediente-candidato|R")]
		public async Task<CResult> Get([FromQuery] SC_EXPEDIENTE_CANDIDATOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/sc-expediente-candidato|C")]
		public async Task<IActionResult> Post(SC_EXPEDIENTE_CANDIDATOTable Data)
		{
			SetCreateAudit(Data);

			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/sc-expediente-candidato|U")]
		public async Task<IActionResult> Put(SC_EXPEDIENTE_CANDIDATOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(SC_EXPEDIENTE_CANDIDATOTable.CORR_EXPEDIENTE_CANDIDATO));
			SetUpdateAudit(Data);

			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/sc-expediente-candidato|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_EXPEDIENTE_CANDIDATOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		/// <summary>Consulta el estado de asociación (permiso de sc-solicitud-empleo). Mensajes desde el SP.</summary>
		[HttpGet("GetEstadoAsociacion")]
		[Authorize(Policy = "/sc-solicitud-empleo|R")]
		public async Task<IActionResult> GetEstadoAsociacion([FromQuery] SC_EXPEDIENTE_ASOCIARParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.GetEstadoAsociacionAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));

			return MapAsociacionResult(resultado);
		}

		/// <summary>Asocia la solicitud al expediente (crea encabezado si CREAR_EXPEDIENTE=true). Mensajes desde el SP.</summary>
		[HttpPost("AsociarSolicitud")]
		[Authorize(Policy = "/sc-solicitud-empleo|U")]
		public async Task<IActionResult> AsociarSolicitud([FromBody] SC_EXPEDIENTE_ASOCIARParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.AsociarSolicitudAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));

			return MapAsociacionResult(resultado);
		}

		/// <summary>Ok para códigos de negocio del SP (4101–4104); BadRequest solo en error inesperado.</summary>
		private static IActionResult MapAsociacionResult(CResult resultado)
		{
			if (resultado.ErrorCode == 0 ||
				resultado.ErrorCode == 4101 ||
				resultado.ErrorCode == 4102 ||
				resultado.ErrorCode == 4103 ||
				resultado.ErrorCode == 4104)
			{
				return new OkObjectResult(resultado);
			}

			return new BadRequestObjectResult(resultado);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
		}

		private void SetCreateAudit(SC_EXPEDIENTE_CANDIDATOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			if (Data.FECHA_GENERACION == default)
			{
				Data.FECHA_GENERACION = Data.FECHA_CREA;
			}
			Data.ACTIVO = true;
		}

		private void SetUpdateAudit(SC_EXPEDIENTE_CANDIDATOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
