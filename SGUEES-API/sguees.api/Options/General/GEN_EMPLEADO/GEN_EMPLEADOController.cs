using System;
using System.Linq;
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
	public class GEN_EMPLEADOController : ControllerBase
	{
		private readonly IGEN_EMPLEADOService _service;

		public GEN_EMPLEADOController(IGEN_EMPLEADOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> Get([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetCORR_EMPLEADO_BAN_SOLI_CHEQUE")]
		[Authorize(Policy = "/ban-soli-cheque|R")]
		public async Task<CResult> GetCORR_EMPLEADO_BAN_SOLI_CHEQUE([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_EMPLEADO_BAN_CHEQUE")]
		[Authorize(Policy = "/ban-cheque|R")]
		public async Task<CResult> GetCORR_EMPLEADO_BAN_CHEQUE([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_EMPLEADO_BAN_DOCUMENTO")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> GetCORR_EMPLEADO_BAN_DOCUMENTO([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}
	}
}
