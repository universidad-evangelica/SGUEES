using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using eFramework.Core;
using scuees.Models;
using scuees.Services;
using System.Security.Claims;

namespace scuees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class COM_REPOController : ControllerBase
	{
		private readonly ICOM_REPOService _service;

		public COM_REPOController(ICOM_REPOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}

		// [HttpGet("GetRepoSujetoExcluido")]
		// [Authorize(Policy = "/com-repo-sujeto-excluido|P")]
		// public async Task<Stream> GetRepoSujetoExcluido([FromQuery] COM_DOCUMENTOParam Data)
		// {
		// 	Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
		// 	Data.ESTADO_DOCUMENTO ??= "";

		// 	var vPDF = await _service.GetRepoSujetoExcluidoAsync(Data);

		// 	Response.Headers.ContentType = "application/pdf";
		// 	Response.Headers.ContentDisposition = "inline";
		// 	Response.RegisterForDispose(vPDF);

		// 	return vPDF;
		// }

		
		// [HttpGet("GetComConsultaSujetoExcluido")]
		// [Authorize(Policy = "/com-consulta-sujeto-excluido|R")]
		// public async Task<CResult> GetComConsultaSujetoExcluido([FromQuery] COM_DOCUMENTOParam Data)
		// {
		// 	Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
		// 	Data.ESTADO_DOCUMENTO ??= "";

		// 	return await _service.GetComConsultaSujetoExcluidoAsync(Data);
		// }
		[HttpGet("GetComCotizacionConsulta")]
		[Authorize(Policy = "/com-cotizacion-consulta|R")]
		public async Task<CResult> GetComConsultaSujetoExcluido([FromQuery] COM_COTIZACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			return await _service.GetComCotizacionRepo(Data);
		}
	}
}
