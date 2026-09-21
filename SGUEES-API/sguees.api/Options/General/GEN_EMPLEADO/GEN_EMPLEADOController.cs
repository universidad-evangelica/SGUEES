// Qué hace: endpoints de empleados (browse + Iniciar + personales vía SP).
// Cómo lo hace: Iniciar/Create/Update/Delete PersonaNatural delegan a GEN_EMPLEADOService (SP).
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
	public class GEN_EMPLEADOController : ControllerBase
	{
		private readonly IGEN_EMPLEADOService _service;

		public GEN_EMPLEADOController(IGEN_EMPLEADOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> Get([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		// Qué hace: inicia empleado (SP Insert con datos personales + GEN_EMPLEADO).
		// Cómo: recibe GEN_PERSONA_NATURAL; auditoría; retorna 201 con V_GEN_EMPLEADO.
		[HttpPost("Iniciar")]
		[Authorize(Policy = "/gen-empleado|C")]
		public async Task<IActionResult> Iniciar(GEN_PERSONA_NATURALTable Data)
		{
			SetCreateAuditNatural(Data);
			var resultado = await _service.IniciarAsync(
				Data,
				GetCorrEmpresa(),
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: obtiene GEN_PERSONA_NATURAL del empleado (por CORR_PERSONA).
		[HttpGet("GetPersonaNatural")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetPersonaNatural([FromQuery] GEN_PERSONA_NATURALParam Data)
		{
			return await _service.GetPersonaNaturalAsync(Data);
		}

		// Qué hace: crea persona natural vía SP (Insert completo de 3 tablas).
		[HttpPost("PersonaNatural")]
		[Authorize(Policy = "/gen-empleado|C")]
		public async Task<IActionResult> CreatePersonaNatural(GEN_PERSONA_NATURALTable Data)
		{
			SetCreateAuditNatural(Data);
			var resultado = await _service.CreatePersonaNaturalAsync(
				Data,
				GetCorrEmpresa(),
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: actualiza persona natural vía SP.
		[HttpPut("PersonaNatural")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> UpdatePersonaNatural(GEN_PERSONA_NATURALTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_PERSONA_NATURALTable.CORR_PERSONA_NATURAL));
			SetUpdateAuditNatural(Data);
			var resultado = await _service.UpdatePersonaNaturalAsync(
				Data,
				GetCorrEmpresa(),
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: elimina persona natural vía SP (bloquea si hay empleado).
		[HttpDelete("PersonaNatural")]
		[Authorize(Policy = "/gen-empleado|D")]
		public async Task<IActionResult> DeletePersonaNatural([FromQuery] GEN_PERSONA_NATURALTable Data)
		{
			var resultado = await _service.DeletePersonaNaturalAsync(
				Data,
				GetCorrEmpresa(),
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// Qué hace: elimina el registro de empleado (fila GEN_EMPLEADO).
		// Cómo: Delete por CORR_EMPRESA (sesión) + CORR_EMPLEADO; 200 OK o BadRequest si hay FK.
		[HttpDelete]
		[Authorize(Policy = "/gen-empleado|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_EMPLEADOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_EMPLEADO_BAN_SOLI_CHEQUE")]
		[Authorize(Policy = "/ban-soli-cheque|R")]
		public async Task<CResult> GetCORR_EMPLEADO_BAN_SOLI_CHEQUE([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_EMPLEADO_BAN_CHEQUE")]
		[Authorize(Policy = "/ban-cheque|R")]
		public async Task<CResult> GetCORR_EMPLEADO_BAN_CHEQUE([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_EMPLEADO_BAN_DOCUMENTO")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> GetCORR_EMPLEADO_BAN_DOCUMENTO([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_EMPLEADO_SC_DESCRIPTOR_PUESTO")]
		[Authorize(Policy = "/sc-descriptor-puesto|R")]
		public async Task<CResult> GetCORR_EMPLEADO_SC_DESCRIPTOR_PUESTO([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAuditEmpleado(GEN_EMPLEADOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO_EMPLEADO ??= true;
		}

		private void SetCreateAuditNatural(GEN_PERSONA_NATURALTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}

		private void SetUpdateAuditNatural(GEN_PERSONA_NATURALTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
