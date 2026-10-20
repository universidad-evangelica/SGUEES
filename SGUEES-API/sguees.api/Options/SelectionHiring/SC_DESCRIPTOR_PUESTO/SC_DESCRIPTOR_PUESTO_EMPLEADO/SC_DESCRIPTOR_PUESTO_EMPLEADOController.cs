// Qué hace: expone la carga de empleados del descriptor de puesto.
// Cómo lo hace: usa la empresa de sesión y el permiso de sc-descriptor-puesto.
using System;
using System.IO;
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
		private readonly ISC_DESCRIPTOR_PUESTOService _descriptorService;

		public SC_DESCRIPTOR_PUESTO_EMPLEADOController(
			ISC_DESCRIPTOR_PUESTO_EMPLEADOService service,
			ISC_DESCRIPTOR_PUESTOService descriptorService)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
			_descriptorService = descriptorService ?? throw new ArgumentNullException(nameof(descriptorService));
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

		// Qué hace: activa o inactiva la carga desde el descriptor de puesto.
		// Cómo lo hace: usa el permiso de modificación de sc-descriptor-puesto.
		[HttpPut("Activar")]
		[Authorize(Policy = "/sc-descriptor-puesto|U")]
		public Task<IActionResult> Activar(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data)
		{
			return CambiarActivoAsync(Data);
		}

		// Qué hace: activa o inactiva la carga desde el empleado.
		// Cómo lo hace: usa el permiso de modificación de gen-empleado.
		[HttpPut("ActivarPorEmpleado")]
		[Authorize(Policy = "/gen-empleado|U")]
		public Task<IActionResult> ActivarPorEmpleado(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data)
		{
			return CambiarActivoAsync(Data);
		}

		// Qué hace: aplica el bit de la carga y devuelve la fila.
		// Cómo lo hace: fija empresa y auditoría, y responde 200 o el error del servicio.
		private async Task<IActionResult> CambiarActivoAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CambiarActivoAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
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

		// Qué hace: PDF formato corto del descriptor, del empleado que se está viendo.
		// Cómo lo hace: mismo generador del descriptor, con el permiso de impresión de gen-empleado.
		[HttpPost("getPDFFormatoCorto")]
		[Authorize(Policy = "/gen-empleado|P")]
		public Task<IActionResult> GetPDFFormatoCorto([FromBody] SC_DESCRIPTOR_PUESTOParam Data)
		{
			return PdfDescriptorAsync(Data, _descriptorService.GetPDFFormatoCortoAsync, "SC_DESCRIPTOR_PUESTO_FORMATO_CORTO.pdf");
		}

		// Qué hace: PDF formato extenso del descriptor, del empleado que se está viendo.
		// Cómo lo hace: mismo generador del descriptor, con el permiso de impresión de gen-empleado.
		[HttpPost("getPDFFormatoExtenso")]
		[Authorize(Policy = "/gen-empleado|P")]
		public Task<IActionResult> GetPDFFormatoExtenso([FromBody] SC_DESCRIPTOR_PUESTOParam Data)
		{
			return PdfDescriptorAsync(Data, _descriptorService.GetPDFFormatoExtensoAsync, "SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.pdf");
		}

		// Qué hace: arma la respuesta PDF o el error del generador.
		// Cómo lo hace: fija la empresa de sesión y devuelve el archivo o el mensaje del API.
		private async Task<IActionResult> PdfDescriptorAsync(
			SC_DESCRIPTOR_PUESTOParam Data,
			Func<SC_DESCRIPTOR_PUESTOParam, string, Task<Stream>> generar,
			string nombreArchivo)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var login = GetUsuario() ?? string.Empty;
			try
			{
				var stream = await generar(Data, login);
				if (stream == null)
				{
					return BadRequest(new CResult
					{
						Result = false,
						ErrorCode = -1,
						ErrorMessage = "No se pudo generar el PDF del descriptor.",
					});
				}

				return File(stream, "application/pdf", nombreArchivo);
			}
			catch (InvalidOperationException ex)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = ex.Message });
			}
			catch (Exception ex)
			{
				return BadRequest(new CResult { Result = false, ErrorCode = -1, ErrorMessage = ex.Message });
			}
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
