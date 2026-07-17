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
	public class GEN_DEPTOController : ControllerBase
	{
		private readonly IGEN_DEPTOService _service;

		public GEN_DEPTOController(IGEN_DEPTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		// Atiende la consulta del listado de departamentos y la limita a la empresa de la sesión.
		public async Task<CResult> GetAll([FromQuery] GEN_DEPTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		// Atiende la consulta de un departamento específico dentro de la empresa de la sesión.
		public async Task<CResult> Get([FromQuery] GEN_DEPTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetCORR_DEPTO_GEN_EMPRESA")]
		[Authorize(Policy = "/gen-empresa|R")]
		// Expone el catálogo de departamentos requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		public async Task<CResult> GetCORR_DEPTO_GEN_EMPRESA([FromQuery] GEN_DEPTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			if (Data.CORR_EMPRESA <= 0)
			{
				Data.CORR_EMPRESA = 1;
			}

			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_DEPTO_GEN_ESTRUCTURA_TERRITORIAL")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		// Expone el catálogo de departamentos requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		public async Task<CResult> GetCORR_DEPTO_GEN_ESTRUCTURA_TERRITORIAL([FromQuery] GEN_DEPTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCODIGO_DEPTO_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		// Expone el catálogo de departamentos requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		public async Task<CResult> GetCODIGO_DEPTO_COM_PROVEEDOR([FromQuery] GEN_DEPTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			if (Data.CORR_EMPRESA <= 0)
			{
				Data.CORR_EMPRESA = 1;
			}

			return await _service.GetAllAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-estructura-territorial|C")]
		// Prepara auditoría, crea el departamento y traduce el resultado al estado HTTP correspondiente.
		public async Task<IActionResult> Post(GEN_DEPTOTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-estructura-territorial|U")]
		// Aplica las claves de la solicitud, prepara auditoría y actualiza el departamento.
		public async Task<IActionResult> Put(GEN_DEPTOTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-estructura-territorial|D")]
		// Valida el contexto de empresa y elimina el departamento indicada por sus claves.
		public async Task<IActionResult> Delete([FromQuery] GEN_DEPTOTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		// Obtiene la empresa asociada a la sesión para aislar las operaciones del usuario.
		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		// Obtiene el identificador del usuario autenticado para registrar la auditoría.
		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
		}

		// Verifica que la sesión tenga una empresa válida y prepara una respuesta controlada si falta.
		private bool ValidateEmpresaSesion(out CResult resultado)
		{
			if (GetCorrEmpresa() > 0)
			{
				resultado = null;
				return true;
			}

			resultado = new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = 4100,
				ErrorMessage =
					"No se pudo guardar el departamento porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_DEPTOController]",
				RowsAffected = 0
			};

			return false;
		}

		// Completa la empresa y los datos de auditoría requeridos para crear el registro.
		private void SetCreateAudit(GEN_DEPTOTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}

		// Completa la empresa y los datos de auditoría requeridos para actualizar el registro.
		private void SetUpdateAudit(GEN_DEPTOTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
