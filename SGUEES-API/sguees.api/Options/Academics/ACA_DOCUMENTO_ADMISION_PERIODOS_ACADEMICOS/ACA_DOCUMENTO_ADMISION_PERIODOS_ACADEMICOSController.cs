// Qué hace: endpoints de los documentos que se muestran en cada período académico.
// Cómo: lista documentos y marcas, y permite insertar o eliminar la relación.
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
	public class ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSController : ControllerBase
	{
		private readonly IACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSService _service;

		public ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSController(IACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: lista los documentos de admisión.
		// Cómo: la empresa de sesión se usa en las marcas, no en el catálogo.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-documento-admision-periodos-academicos|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		// Qué hace: obtiene un documento.
		// Cómo: consulta el catálogo por correlativo.
		[HttpGet("Get")]
		[Authorize(Policy = "/aca-documento-admision-periodos-academicos|R")]
		public async Task<CResult> Get([FromQuery] ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		// Qué hace: lista los períodos ya marcados.
		// Cómo: fija la empresa y consulta la vista de la relación.
		[HttpGet("GetAsignaciones")]
		[Authorize(Policy = "/aca-documento-admision-periodos-academicos|R")]
		public async Task<CResult> GetAsignaciones([FromQuery] ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsignacionesAsync(Data);
		}

		// Qué hace: marca el documento en el período seleccionado.
		// Cómo: completa auditoría y devuelve 201 con la fila leída de la vista.
		[HttpPost]
		[Authorize(Policy = "/aca-documento-admision-periodos-academicos|C")]
		public async Task<IActionResult> Post(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data)
		{
			SetCreateAudit(Data);
			var result = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return result.ErrorCode == 0 ? StatusCode(201, result) : BadRequest(result);
		}

		// Qué hace: quita un período del documento.
		// Cómo: fija la empresa y elimina la fila de la relación.
		[HttpDelete]
		[Authorize(Policy = "/aca-documento-admision-periodos-academicos|D")]
		public async Task<IActionResult> Delete([FromQuery] ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var result = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return result.ErrorCode == 0 ? Ok(result) : BadRequest(result);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private string GetUsuario() =>
			User.Claims.FirstOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		private void SetCreateAudit(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data)
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
