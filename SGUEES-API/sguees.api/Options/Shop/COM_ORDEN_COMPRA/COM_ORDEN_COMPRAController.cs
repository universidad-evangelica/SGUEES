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
	
	public class COM_ORDEN_COMPRAController : ControllerBase
	{
		private readonly ICOM_ORDEN_COMPRAService _service;
		
		public COM_ORDEN_COMPRAController(ICOM_ORDEN_COMPRAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-orden-compra|R")]
		public async Task<CResult> GetAll([FromQuery] COM_ORDEN_COMPRAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.LOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-orden-compra|R")]
		public async Task<CResult> Get([FromQuery] COM_ORDEN_COMPRAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpGet("getPDF")]
		[Authorize(Policy = "/com-orden-compra|P")]
		public async Task<Stream> getPDF([FromQuery] COM_ORDEN_COMPRAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Stream vPDF = null;
			vPDF = await _service.GetPDFAsync(Data);
			
			Response.Headers.ContentType = "application/pdf";
			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(vPDF);

      		return vPDF;
		}
	}
}
