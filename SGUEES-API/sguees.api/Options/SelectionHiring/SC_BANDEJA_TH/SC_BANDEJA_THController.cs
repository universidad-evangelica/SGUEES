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
	[Route("[controller]")]
	[ApiController]
	public class SC_BANDEJA_THController : ControllerBase
	{
		private readonly ISC_BANDEJA_THService _service;

		public SC_BANDEJA_THController(ISC_BANDEJA_THService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		/// <summary>
		/// Listado paginado de requisiciones para la bandeja TH.
		/// Permiso del consumidor: /sc-bandeja-th|R
		/// </summary>
		[HttpGet("GetRequisiciones")]
		[Authorize(Policy = "/sc-bandeja-th|R")]
		public async Task<CResult> GetRequisiciones([FromQuery] SC_BANDEJA_TH_REQUISICIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(
				User.Claims.ToList().Single(e => e.Type == "CORR_EMPRESA").Value);

			if (Data.PAGE <= 0)
			{
				Data.PAGE = 1;
			}

			return await _service.GetRequisicionesAsync(Data);
		}

		/// <summary>
		/// Bitácora SEG_FLUJO de una requisición (lazy al seleccionar fila).
		/// </summary>
		[HttpGet("GetBitacoraRequisicion")]
		[Authorize(Policy = "/sc-bandeja-th|R")]
		public async Task<CResult> GetBitacoraRequisicion([FromQuery] SC_BANDEJA_TH_BITACORAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(
				User.Claims.ToList().Single(e => e.Type == "CORR_EMPRESA").Value);
			Data.CORR_TIPO_DOCUMENTO = Data.CORR_TIPO_DOCUMENTO > 0 ? Data.CORR_TIPO_DOCUMENTO : 101;

			return await _service.GetBitacoraRequisicionAsync(Data);
		}
	}
}
