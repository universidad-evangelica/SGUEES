// Qué hace: expone las firmas guardadas del descriptor de puesto.
// Cómo lo hace: consulta con el permiso de lectura de sc-descriptor-puesto.
using System;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
	[Authorize]
	[ApiController]
	[Route("[controller]")]
	public class SC_DESCRIPTOR_PUESTO_FIRMASController : ControllerBase
	{
		private readonly ISC_DESCRIPTOR_PUESTO_FIRMASService _service;

		public SC_DESCRIPTOR_PUESTO_FIRMASController(ISC_DESCRIPTOR_PUESTO_FIRMASService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		// Qué hace: lista las firmas del descriptor.
		// Cómo lo hace: fija la empresa de sesión y consulta el servicio.
		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-descriptor-puesto|R")]
		public async Task<CResult> GetAll([FromQuery] SC_DESCRIPTOR_PUESTO_FIRMASParam Data)
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
