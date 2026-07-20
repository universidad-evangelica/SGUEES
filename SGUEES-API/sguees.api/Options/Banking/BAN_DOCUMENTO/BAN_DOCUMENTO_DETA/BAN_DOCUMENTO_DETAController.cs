using System;

using System.Linq;

using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

using eFramework.Core;

using sguees.api.Shared;

using sguees.Models;

using sguees.Services;



namespace sguees.Controllers

{

	[Authorize]

	[Route("[controller]")]

	[ApiController]

	public class BAN_DOCUMENTO_DETAController : ControllerBase

	{

		private readonly IBAN_DOCUMENTO_DETAService _service;



		public BAN_DOCUMENTO_DETAController(IBAN_DOCUMENTO_DETAService service)

		{

			_service = service ?? throw new ArgumentNullException(nameof(service));

		}



		private int GetCorrEmpresa() =>

			int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);



		[HttpGet("GetAllDocumento")]

		[Authorize(Policy = "/ban-documento|R")]

		public async Task<CResult> GetAllDocumento([FromQuery] BAN_DOCUMENTO_DETAParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			return await _service.GetAllAsync(Data);

		}



		[HttpGet("GetAllCheque")]

		[Authorize(Policy = "/ban-cheque|R")]

		public async Task<CResult> GetAllCheque([FromQuery] BAN_DOCUMENTO_DETAParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			return await _service.GetAllAsync(Data);

		}



		[HttpPost("PostDocumento")]

		[Authorize(Policy = "/ban-documento|C")]

		public async Task<IActionResult> PostDocumento(BAN_DOCUMENTO_DETATable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.CreateAsync(

				Data,

				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,

				ClientInfoHelper.GetClientStation(HttpContext));

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpPost("PostCheque")]

		[Authorize(Policy = "/ban-cheque|C")]

		public async Task<IActionResult> PostCheque(BAN_DOCUMENTO_DETATable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.CreateAsync(

				Data,

				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,

				ClientInfoHelper.GetClientStation(HttpContext));

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpPut("PutDocumento")]

		[Authorize(Policy = "/ban-documento|U")]

		public async Task<IActionResult> PutDocumento(BAN_DOCUMENTO_DETATable Data)

		{

			this.ApplyQueryKeys(

				Data,

				nameof(BAN_DOCUMENTO_DETATable.ANIO_PERIODO),

				nameof(BAN_DOCUMENTO_DETATable.MES_PERIODO),

				nameof(BAN_DOCUMENTO_DETATable.CORR_TIPO_MOVIMIENTO),

				nameof(BAN_DOCUMENTO_DETATable.CORR_DOCUMENTO),

				nameof(BAN_DOCUMENTO_DETATable.CORR_DOCUMENTO_DETA));

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.UpdateAsync(

				Data,

				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,

				ClientInfoHelper.GetClientStation(HttpContext));

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpPut("PutCheque")]

		[Authorize(Policy = "/ban-cheque|U")]

		public async Task<IActionResult> PutCheque(BAN_DOCUMENTO_DETATable Data)

		{

			this.ApplyQueryKeys(

				Data,

				nameof(BAN_DOCUMENTO_DETATable.ANIO_PERIODO),

				nameof(BAN_DOCUMENTO_DETATable.MES_PERIODO),

				nameof(BAN_DOCUMENTO_DETATable.CORR_TIPO_MOVIMIENTO),

				nameof(BAN_DOCUMENTO_DETATable.CORR_DOCUMENTO),

				nameof(BAN_DOCUMENTO_DETATable.CORR_DOCUMENTO_DETA));

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.UpdateAsync(

				Data,

				User.Claims.Single(e => e.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value,

				ClientInfoHelper.GetClientStation(HttpContext));

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpDelete("DeleteDocumento")]

		[Authorize(Policy = "/ban-documento|D")]

		public async Task<IActionResult> DeleteDocumento([FromQuery] BAN_DOCUMENTO_DETATable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);

			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);

		}



		[HttpDelete("DeleteCheque")]

		[Authorize(Policy = "/ban-cheque|D")]

		public async Task<IActionResult> DeleteCheque([FromQuery] BAN_DOCUMENTO_DETATable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);

			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);

		}

	}

}


