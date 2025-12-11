using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  sguees.Models;
using  sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class COM_ORDEN_COMPRA_DETAController : ControllerBase
	{
		private readonly ICOM_ORDEN_COMPRA_DETAService _service;
		
		public COM_ORDEN_COMPRA_DETAController(ICOM_ORDEN_COMPRA_DETAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-orden-compra|R")]
		public async Task<CResult> GetAll([FromQuery] COM_ORDEN_COMPRA_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-orden-compra|R")]
		public async Task<CResult> Get([FromQuery] COM_ORDEN_COMPRA_DETAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
	}
}
