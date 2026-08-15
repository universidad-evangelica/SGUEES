using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using eFramework.Core;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class GEN_SECTORController : ControllerBase
	{
		private readonly IGEN_SECTORService _service;

		public GEN_SECTORController(IGEN_SECTORService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-sector|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_SECTORParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_SECTOR_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetCORR_SECTOR_COM_PROVEEDOR([FromQuery] GEN_SECTORParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_SECTOR_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
		public async Task<CResult> GetCORR_SECTOR_COM_PROVEEDOR_ACTU([FromQuery] GEN_SECTORParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_SECTOR_COM_SOLI_COTIZACION")]
		[Authorize(Policy = "/com-soli-cotizacion|R")]
		public async Task<CResult> GetCORR_SECTOR_COM_SOLI_COTIZACION([FromQuery] GEN_SECTORParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_SECTOR_COM_COTIZACION")]
		[Authorize(Policy = "/com-cotizacion|R")]
		public async Task<CResult> GetCORR_SECTOR_COM_COTIZACION([FromQuery] GEN_SECTORParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
	}
}
