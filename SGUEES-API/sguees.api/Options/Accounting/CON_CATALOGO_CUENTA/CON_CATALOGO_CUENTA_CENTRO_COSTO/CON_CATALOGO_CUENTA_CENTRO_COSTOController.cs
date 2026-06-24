using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class CON_CATALOGO_CUENTA_CENTRO_COSTOController : ControllerBase
	{
		private const string PolicyBase = "/con-catalogo-cuenta-centro-costo";
		private readonly ICON_CATALOGO_CUENTA_CENTRO_COSTOService _service;
		private readonly ICON_CATALOGO_CUENTAService _catalogoService;
		private readonly ICON_CENTRO_COSTOService _centroService;

		public CON_CATALOGO_CUENTA_CENTRO_COSTOController(
			ICON_CATALOGO_CUENTA_CENTRO_COSTOService service,
			ICON_CATALOGO_CUENTAService catalogoService,
			ICON_CENTRO_COSTOService centroService)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
			_catalogoService = catalogoService ?? throw new ArgumentNullException(nameof(catalogoService));
			_centroService = centroService ?? throw new ArgumentNullException(nameof(centroService));
		}

		private int GetCorrEmpresa()
		{
			return int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
		}

		[HttpGet("GetCatalogoCuentas")]
		[Authorize(Policy = PolicyBase + "|R")]
		public async Task<CResult> GetCatalogoCuentas()
		{
			var param = new CON_CATALOGO_CUENTAParam
			{
				CORR_EMPRESA = GetCorrEmpresa(),
				CUENTA_CONTABLE = string.Empty,
			};
			return await _catalogoService.GetAllAsync(param);
		}

		[HttpGet("GetCentrosCosto")]
		[Authorize(Policy = PolicyBase + "|R")]
		public async Task<CResult> GetCentrosCosto()
		{
			var param = new CON_CENTRO_COSTOParam
			{
				CORR_EMPRESA = GetCorrEmpresa(),
				CORR_CENTRO_COSTO = 0,
			};
			return await _centroService.GetAllAsync(param);
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = PolicyBase + "|R")]
		public async Task<CResult> GetAll([FromQuery] CON_CATALOGO_CUENTA_CENTRO_COSTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = PolicyBase + "|R")]
		public async Task<CResult> Get([FromQuery] CON_CATALOGO_CUENTA_CENTRO_COSTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = PolicyBase + "|C")]
		public async Task<IActionResult> Post(CON_CATALOGO_CUENTA_CENTRO_COSTOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = PolicyBase + "|U")]
		public async Task<IActionResult> Put(CON_CATALOGO_CUENTA_CENTRO_COSTOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(Data, User.Claims.ToList().SingleOrDefault(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value, ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = PolicyBase + "|D")]
		public async Task<IActionResult> Delete([FromQuery] CON_CATALOGO_CUENTA_CENTRO_COSTOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}
	}
}
