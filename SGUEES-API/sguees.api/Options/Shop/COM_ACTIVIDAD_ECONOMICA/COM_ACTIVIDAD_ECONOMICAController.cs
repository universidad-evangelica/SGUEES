using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  scuees.Models;
using  scuees.Services;

namespace scuees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class COM_ACTIVIDAD_ECONOMICAController : ControllerBase
	{
		private readonly ICOM_ACTIVIDAD_ECONOMICAService _service;
		
		public COM_ACTIVIDAD_ECONOMICAController(ICOM_ACTIVIDAD_ECONOMICAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-actividad-economica|R")]
		public async Task<CResult> GetAll([FromQuery] COM_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_COM_PROVEEDOR([FromQuery] COM_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_ACTIVIDAD_ECONOMICA_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
		public async Task<CResult> GetCORR_ACTIVIDAD_ECONOMICA_COM_PROVEEDOR_ACTU([FromQuery] COM_ACTIVIDAD_ECONOMICAParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
	}
}
