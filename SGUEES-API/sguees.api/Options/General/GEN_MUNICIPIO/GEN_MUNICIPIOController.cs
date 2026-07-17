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
	// API HTTP del catálogo de municipios: autentica, aplica empresa de sesión y delega al servicio.
	[Authorize]
	[ApiController]
	[Route("[controller]")]
	public class GEN_MUNICIPIOController : ControllerBase
	{
		private readonly IGEN_MUNICIPIOService _service;

		// Inyecta el servicio de municipios; falla si no está registrado.
		public GEN_MUNICIPIOController(IGEN_MUNICIPIOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		// Atiende la consulta del listado de municipios y la limita a la empresa de la sesión.
		public async Task<CResult> GetAll([FromQuery] GEN_MUNICIPIOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		// Atiende la consulta de un municipio específica dentro de la empresa de la sesión.
		public async Task<CResult> Get([FromQuery] GEN_MUNICIPIOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(data);
		}

		[HttpGet("GetCORR_MUNICIPIO_GEN_EMPRESA")]
		[Authorize(Policy = "/gen-empresa|R")]
		// Expone el catálogo de municipios requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		public async Task<CResult> GetCORR_MUNICIPIO_GEN_EMPRESA([FromQuery] GEN_MUNICIPIOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			if (data.CORR_EMPRESA <= 0)
			{
				data.CORR_EMPRESA = 1;
			}

			return await _service.GetAllAsync(data);
		}

		[HttpGet("GetCORR_MUNICIPIO_GEN_ESTRUCTURA_TERRITORIAL")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		// Expone el catálogo de municipios requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		public async Task<CResult> GetCORR_MUNICIPIO_GEN_ESTRUCTURA_TERRITORIAL([FromQuery] GEN_MUNICIPIOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(data);
		}

		[HttpGet("GetCODIGO_MUNICIPIO_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		// Expone el catálogo de municipios requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		public async Task<CResult> GetCODIGO_MUNICIPIO_COM_PROVEEDOR([FromQuery] GEN_MUNICIPIOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			if (data.CORR_EMPRESA <= 0)
			{
				data.CORR_EMPRESA = 1;
			}

			return await _service.GetMunicipiosByCodigoDeptoAsync(data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-estructura-territorial|C")]
		// Prepara auditoría, crea el municipio y traduce el resultado al estado HTTP correspondiente.
		public async Task<IActionResult> Post(GEN_MUNICIPIOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetCreateAudit(data);
			var resultado = await _service.CreateAsync(data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-estructura-territorial|U")]
		// Aplica las claves de la solicitud, prepara auditoría y actualiza el municipio.
		public async Task<IActionResult> Put(GEN_MUNICIPIOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetUpdateAudit(data);
			var resultado = await _service.UpdateAsync(data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-estructura-territorial|D")]
		// Valida el contexto de empresa y elimina el municipio indicada por sus claves.
		public async Task<IActionResult> Delete([FromQuery] GEN_MUNICIPIOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			var resultado = await _service.DeleteAsync(data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
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
			return User.Claims.FirstOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value
				?? User.Identity?.Name
				?? "Sistema";
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
					"No se pudo guardar el municipio porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_MUNICIPIOController]",
				RowsAffected = 0
			};

			return false;
		}

		// Completa la empresa y los datos de auditoría requeridos para crear el registro.
		private void SetCreateAudit(GEN_MUNICIPIOTable data)
		{
			data.USUARIO_CREA = GetUsuario();
			data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_CREA = DateTime.Now;
			data.USUARIO_ACTU = data.USUARIO_CREA;
			data.ESTACION_ACTU = data.ESTACION_CREA;
			data.FECHA_ACTU = data.FECHA_CREA;
		}

		// Completa la empresa y los datos de auditoría requeridos para actualizar el registro.
		private void SetUpdateAudit(GEN_MUNICIPIOTable data)
		{
			data.USUARIO_ACTU = GetUsuario();
			data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_ACTU = DateTime.Now;
		}
	}
}
