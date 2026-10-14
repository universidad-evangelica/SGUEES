// Qué hace: endpoints de los documentos que se muestran en cada solicitud ACA_PROSPECTO.
// Cómo: lista los tipos, el catálogo y las marcas, y permite insertar o eliminar la relación.
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
	public class ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOController : ControllerBase
	{
		private readonly IACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOService _service;

		public ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOController(IACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: lista las solicitudes con código de opción ACA_PROSPECTO.
		// Cómo: fija la empresa de sesión y consulta la vista de tipos.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-documento-admision-flujo-tipo-documento|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		// Qué hace: obtiene una solicitud.
		// Cómo: fija la empresa y consulta por el tipo de documento.
		[HttpGet("Get")]
		[Authorize(Policy = "/aca-documento-admision-flujo-tipo-documento|R")]
		public async Task<CResult> Get([FromQuery] ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		// Qué hace: lista los documentos ya marcados en las solicitudes.
		// Cómo: fija la empresa y consulta la vista de la relación.
		[HttpGet("GetAsignaciones")]
		[Authorize(Policy = "/aca-documento-admision-flujo-tipo-documento|R")]
		public async Task<CResult> GetAsignaciones([FromQuery] ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsignacionesAsync(Data);
		}

		// Qué hace: lista el catálogo de documentos de admisión para el popup.
		// Cómo: lee ACA_DOCUMENTO_ADMISION sin filtrar por solicitud.
		[HttpGet("GetDocumentos")]
		[Authorize(Policy = "/aca-documento-admision-flujo-tipo-documento|R")]
		public async Task<CResult> GetDocumentos()
		{
			return await _service.GetDocumentosAsync();
		}

		// Qué hace: asocia un documento a la solicitud seleccionada.
		// Cómo: completa auditoría y devuelve 201 con la fila leída de la vista.
		[HttpPost]
		[Authorize(Policy = "/aca-documento-admision-flujo-tipo-documento|C")]
		public async Task<IActionResult> Post(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data)
		{
			SetCreateAudit(Data);
			var result = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return result.ErrorCode == 0 ? StatusCode(201, result) : BadRequest(result);
		}

		// Qué hace: quita un documento de la solicitud.
		// Cómo: fija la empresa y elimina la fila de la relación.
		[HttpDelete]
		[Authorize(Policy = "/aca-documento-admision-flujo-tipo-documento|D")]
		public async Task<IActionResult> Delete([FromQuery] ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var result = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return result.ErrorCode == 0 ? Ok(result) : BadRequest(result);
		}

		// Qué hace: obtiene CORR_EMPRESA del usuario autenticado.
		// Cómo: lee el claim y retorna cero si no puede convertirlo.
		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		// Qué hace: obtiene el login del usuario autenticado.
		// Cómo: lee el claim NameIdentifier.
		private string GetUsuario() =>
			User.Claims.FirstOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		// Qué hace: completa empresa y auditoría al insertar.
		// Cómo: usa claims, estación cliente y la fecha actual.
		private void SetCreateAudit(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data)
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
