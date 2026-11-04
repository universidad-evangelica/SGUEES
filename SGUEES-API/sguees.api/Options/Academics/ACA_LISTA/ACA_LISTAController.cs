using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.Services;

namespace sguees.Controllers
{
	// Qué hace: endpoints Get{LISTA}_{PANTALLA} de listas fijas de Académico.
	// Cómo lo hace: patrón SC_LISTA / GEN_LISTA; el SPA llama getLookUp('ACA_PROSPECTO_NUEVO_INGRESO', 'ACA_LISTA', ...).
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class ACA_LISTAController : ControllerBase
	{
		private readonly IACA_LISTAService _service;

		public ACA_LISTAController(IACA_LISTAService service)
		{
			_service = service ?? throw new System.ArgumentNullException(nameof(service));
		}

		[HttpGet("GetFORMA_INGRESO_ACA_PROSPECTO_NUEVO_INGRESO")]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
		public CResult GetFORMA_INGRESO_ACA_PROSPECTO_NUEVO_INGRESO()
		{
			return _service.GetFORMA_INGRESO();
		}

		[HttpGet("GetTIPO_EDUCACION_ACA_PROSPECTO_NUEVO_INGRESO")]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
		public CResult GetTIPO_EDUCACION_ACA_PROSPECTO_NUEVO_INGRESO()
		{
			return _service.GetTIPO_EDUCACION();
		}

		[HttpGet("GetTIPO_CONTACTO_ACA_PROSPECTO_NUEVO_INGRESO")]
		[Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
		public CResult GetTIPO_CONTACTO_ACA_PROSPECTO_NUEVO_INGRESO()
		{
			return _service.GetTIPO_CONTACTO();
		}
	}
}
