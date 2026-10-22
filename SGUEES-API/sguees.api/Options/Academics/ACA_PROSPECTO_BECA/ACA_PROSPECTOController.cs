using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models.BecaEncabezado;
using sguees.Services.BecaEncabezado;

namespace sguees.Controllers.BecaEncabezado
{
	// Qué hace: encabezado ACA_PROSPECTO de la solicitud de beca.
	// Cómo lo hace: solo lee V_ACA_PROSPECTO. La solicitud se consulta y edita en ACA_PROSPECTO_BECA.
	//               La ruta no es ACA_PROSPECTO: esa ya la usa nuevo ingreso.
	[Authorize]
	[Route("ACA_PROSPECTO_BECA_PROSPECTO")]
	[ApiController]
	public class ACA_PROSPECTOController : ControllerBase
	{
		private readonly IACA_PROSPECTOService _service;

		public ACA_PROSPECTOController(IACA_PROSPECTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/aca-prospecto-beca|R")]
		public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/aca-prospecto-beca|R")]
		public async Task<CResult> Get([FromQuery] ACA_PROSPECTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
	}
}
