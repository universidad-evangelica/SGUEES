using System;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class SEG_MENU_SISTEMAController : ControllerBase
	{
		private readonly ISEG_MENU_SISTEMAService _service;

		public SEG_MENU_SISTEMAController(ISEG_MENU_SISTEMAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/seg-config-opcion|R")]
		public async Task<CResult> GetAll([FromQuery] SEG_MENU_SISTEMAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/seg-config-opcion|R")]
		public async Task<CResult> Get([FromQuery] SEG_MENU_SISTEMAParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetCODIGO_MENU_SEG_CONFIG_OPCION")]
		[Authorize(Policy = "/seg-config-opcion|R")]
		public async Task<CResult> GetCODIGO_MENU_SEG_CONFIG_OPCION([FromQuery] SEG_MENU_SISTEMAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
	}
}
