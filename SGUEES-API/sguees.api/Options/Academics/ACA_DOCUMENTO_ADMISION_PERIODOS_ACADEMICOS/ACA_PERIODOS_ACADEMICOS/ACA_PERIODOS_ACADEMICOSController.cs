// Qué hace: lookup de períodos académicos para Documentos por período.
// Cómo: expone GetPERIODOS_ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS con el permiso de esa pantalla.
using System;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGUEES.Services;

namespace SGUEES.Controllers
{
	[Authorize]
	[ApiController]
	[Route("ACA_PERIODOS_ACADEMICOS")]
	public class ACA_PERIODOS_ACADEMICOSDocumentoController : ControllerBase
	{
		private readonly IACA_PERIODOS_ACADEMICOSDocumentoService _service;

		public ACA_PERIODOS_ACADEMICOSDocumentoController(IACA_PERIODOS_ACADEMICOSDocumentoService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: devuelve los períodos de la empresa para el popup.
		// Cómo: GetLookUp arma GetPERIODOS_ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS.
		[HttpGet("GetPERIODOS_ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS")]
		[Authorize(Policy = "/aca-documento-admision-periodos-academicos|R")]
		public async Task<CResult> GetPERIODOS_ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS()
		{
			var corrEmpresa = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetPeriodosAsync(corrEmpresa);
		}
	}
}
