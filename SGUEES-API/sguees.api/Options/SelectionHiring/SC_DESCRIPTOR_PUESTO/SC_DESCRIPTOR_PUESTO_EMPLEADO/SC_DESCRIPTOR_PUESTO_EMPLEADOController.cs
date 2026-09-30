// Qué hace: expone la carga de empleados del descriptor de puesto.
// Cómo lo hace: usa la empresa de sesión y el permiso de sc-descriptor-puesto.
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
	public class SC_DESCRIPTOR_PUESTO_EMPLEADOController : ControllerBase
	{
		private readonly ISC_DESCRIPTOR_PUESTO_EMPLEADOService _service;

		public SC_DESCRIPTOR_PUESTO_EMPLEADOController(ISC_DESCRIPTOR_PUESTO_EMPLEADOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: lista los empleados ya cargados en el descriptor.
		// Cómo lo hace: fija la empresa de sesión y consulta el servicio.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-descriptor-puesto|R")]
		public async Task<CResult> GetAll([FromQuery] SC_DESCRIPTOR_PUESTO_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		// Qué hace: lista empleados que tienen el puesto y la unidad del descriptor.
		// Cómo lo hace: fija la empresa de sesión y consulta los disponibles.
		[HttpGet("GetDisponibles")]
		[Authorize(Policy = "/sc-descriptor-puesto|R")]
		public async Task<CResult> GetDisponibles([FromQuery] SC_DESCRIPTOR_PUESTO_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetDisponiblesAsync(Data);
		}

		// Qué hace: carga un empleado en el descriptor.
		// Cómo lo hace: completa auditoría y llama al servicio, que valida GEN_EMPLEADO_PUESTO.
		[HttpPost]
		[Authorize(Policy = "/sc-descriptor-puesto|C")]
		public async Task<IActionResult> Post(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: lista los descriptores ya asignados al empleado.
		// Cómo lo hace: exige el permiso de lectura de gen-empleado.
		[HttpGet("GetPorEmpleado")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetPorEmpleado([FromQuery] SC_DESCRIPTOR_PUESTO_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetPorEmpleadoAsync(Data);
		}

		// Qué hace: lista descriptores activos del puesto y la unidad del empleado.
		// Cómo lo hace: exige el permiso de lectura de gen-empleado.
		[HttpGet("GetDisponiblesPorEmpleado")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetDisponiblesPorEmpleado([FromQuery] SC_DESCRIPTOR_PUESTO_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetDisponiblesPorEmpleadoAsync(Data);
		}

		// Qué hace: asigna un descriptor al empleado.
		// Cómo lo hace: usa el alta existente, con el permiso de modificación de gen-empleado.
		[HttpPost("PostPorEmpleado")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> PostPorEmpleado(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: quita un descriptor del empleado.
		// Cómo lo hace: usa la baja existente, con el permiso de modificación de gen-empleado.
		[HttpDelete("DeletePorEmpleado")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> DeletePorEmpleado([FromQuery] SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// Qué hace: quita un empleado del descriptor.
		// Cómo lo hace: fija la empresa de sesión y elimina el vínculo.
		[HttpDelete]
		[Authorize(Policy = "/sc-descriptor-puesto|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
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

		private void SetCreateAudit(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}
	}
}
