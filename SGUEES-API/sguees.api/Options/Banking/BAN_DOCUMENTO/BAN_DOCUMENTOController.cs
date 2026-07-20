using System;

using System.Linq;

using System.Security.Claims;

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

	public class BAN_DOCUMENTOController : ControllerBase

	{

		private readonly IBAN_DOCUMENTOService _service;



		public BAN_DOCUMENTOController(IBAN_DOCUMENTOService service)

		{

			_service = service ?? throw new ArgumentNullException(nameof(service));

		}



		private int GetCorrEmpresa() =>

			int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);



		private string GetLogin() =>

			User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;



		private string GetEstacion() => ClientInfoHelper.GetClientStation(HttpContext);



		private void ApplyAuditActu(BAN_DOCUMENTOTable data)

		{

			data.USUARIO_ACTU = GetLogin().ToLower();

			data.FECHA_ACTU = DateTime.Now;

			data.ESTACION_ACTU = GetEstacion();

		}



		[HttpGet("GetAllDocumento")]

		[Authorize(Policy = "/ban-documento|R")]

		public async Task<CResult> GetAllDocumento([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			Data.MUESTRA_CHEQUES = false;

			return await _service.GetAllAsync(Data);

		}



		[HttpGet("GetAllCheque")]

		[Authorize(Policy = "/ban-cheque|R")]

		public async Task<CResult> GetAllCheque([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			Data.MUESTRA_CHEQUES = true;

			return await _service.GetAllAsync(Data);

		}



		[HttpGet("GetAllDocumentoAplicar")]

		[Authorize(Policy = "/ban-documento-aplicar|R")]

		public async Task<CResult> GetAllDocumentoAplicar([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			Data.MUESTRA_CHEQUES = false;

			Data.ESTADO_DOCUMENTO = "DI";

			return await _service.GetAllAsync(Data);

		}



		[HttpGet("GetAllChequeAplicar")]

		[Authorize(Policy = "/ban-cheque-aplicar|R")]

		public async Task<CResult> GetAllChequeAplicar([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			Data.MUESTRA_CHEQUES = true;

			Data.ESTADO_DOCUMENTO = "DI";

			return await _service.GetAllAsync(Data);

		}



		[HttpGet("GetAllChequeImprimir")]

		[Authorize(Policy = "/ban-cheque-imprimir|R")]

		public async Task<CResult> GetAllChequeImprimir([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			Data.MUESTRA_CHEQUES = true;

			Data.ESTADO_DOCUMENTO = "AP";

			return await _service.GetAllAsync(Data);

		}



		[HttpGet("GetDocumento")]

		[Authorize(Policy = "/ban-documento|R")]

		public async Task<CResult> GetDocumento([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			return await _service.GetAsync(Data);

		}



		[HttpGet("GetCheque")]

		[Authorize(Policy = "/ban-cheque|R")]

		public async Task<CResult> GetCheque([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			return await _service.GetAsync(Data);

		}



		[HttpPost("PostDocumento")]

		[Authorize(Policy = "/ban-documento|C")]

		public async Task<IActionResult> PostDocumento(BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.CreateAsync(Data, GetLogin(), GetEstacion());

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpPost("PostCheque")]

		[Authorize(Policy = "/ban-cheque|C")]

		public async Task<IActionResult> PostCheque(BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.CreateAsync(Data, GetLogin(), GetEstacion());

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpPut("PutDocumento")]

		[Authorize(Policy = "/ban-documento|U")]

		public async Task<IActionResult> PutDocumento(BAN_DOCUMENTOTable Data)

		{

			this.ApplyQueryKeys(

				Data,

				nameof(BAN_DOCUMENTOTable.CORR_EMPRESA),

				nameof(BAN_DOCUMENTOTable.ANIO_PERIODO),

				nameof(BAN_DOCUMENTOTable.MES_PERIODO),

				nameof(BAN_DOCUMENTOTable.CORR_TIPO_MOVIMIENTO),

				nameof(BAN_DOCUMENTOTable.CORR_DOCUMENTO));

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.UpdateAsync(Data, GetLogin(), GetEstacion());

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpPut("PutCheque")]

		[Authorize(Policy = "/ban-cheque|U")]

		public async Task<IActionResult> PutCheque(BAN_DOCUMENTOTable Data)

		{

			this.ApplyQueryKeys(

				Data,

				nameof(BAN_DOCUMENTOTable.CORR_EMPRESA),

				nameof(BAN_DOCUMENTOTable.ANIO_PERIODO),

				nameof(BAN_DOCUMENTOTable.MES_PERIODO),

				nameof(BAN_DOCUMENTOTable.CORR_TIPO_MOVIMIENTO),

				nameof(BAN_DOCUMENTOTable.CORR_DOCUMENTO));

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.UpdateAsync(Data, GetLogin(), GetEstacion());

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpDelete("DeleteDocumento")]

		[Authorize(Policy = "/ban-documento|D")]

		public async Task<IActionResult> DeleteDocumento([FromQuery] BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);

			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);

		}



		[HttpDelete("DeleteCheque")]

		[Authorize(Policy = "/ban-cheque|D")]

		public async Task<IActionResult> DeleteCheque([FromQuery] BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);

			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);

		}



		[HttpPut("AplicarDocumento")]

		[Authorize(Policy = "/ban-documento-aplicar|U")]

		public async Task<IActionResult> AplicarDocumento(BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			ApplyAuditActu(Data);

			var resultado = await _service.AplicarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpPut("AplicarCheque")]

		[Authorize(Policy = "/ban-cheque-aplicar|U")]

		public async Task<IActionResult> AplicarCheque(BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			ApplyAuditActu(Data);

			var resultado = await _service.AplicarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpPut("ImprimirCheque")]

		[Authorize(Policy = "/ban-cheque-imprimir|P")]

		public async Task<IActionResult> ImprimirCheque(BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			ApplyAuditActu(Data);

			var resultado = await _service.ImprimirChequeAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpGet("GetChequeImprimirDatos")]

		[Authorize(Policy = "/ban-cheque-imprimir|R")]

		public async Task<CResult> GetChequeImprimirDatos([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			return await _service.GetChequeImprimirDatosAsync(Data);

		}



		[HttpGet("GetAllDocumentoAnular")]

		[Authorize(Policy = "/ban-documento-anular|R")]

		public async Task<CResult> GetAllDocumentoAnular([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			Data.MUESTRA_CHEQUES = false;

			Data.EXCLUIR_ANULADOS = true;

			return await _service.GetAllAsync(Data);

		}



		[HttpGet("GetAllChequeAnular")]

		[Authorize(Policy = "/ban-cheque-anular|R")]

		public async Task<CResult> GetAllChequeAnular([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			Data.MUESTRA_CHEQUES = true;

			Data.EXCLUIR_ANULADOS = true;

			return await _service.GetAllAsync(Data);

		}



		[HttpPut("AnularDocumento")]

		[Authorize(Policy = "/ban-documento-anular|U")]

		public async Task<IActionResult> AnularDocumento(BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			ApplyAuditActu(Data);

			var resultado = await _service.AnularAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpPut("AnularCheque")]

		[Authorize(Policy = "/ban-cheque-anular|U")]

		public async Task<IActionResult> AnularCheque(BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			ApplyAuditActu(Data);

			var resultado = await _service.AnularAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}



		[HttpGet("GetAllDocumentoContabilizar")]

		[Authorize(Policy = "/ban-documento-contabilizar|R")]

		public async Task<CResult> GetAllDocumentoContabilizar([FromQuery] BAN_DOCUMENTOParam Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			Data.CORR_DOCUMENTO = 0;

			Data.EXCLUIR_ANULADOS = true;

			if (!Data.FILTRO_ESTA_CONTABILIZADO.HasValue)

			{

				Data.FILTRO_ESTA_CONTABILIZADO = -1;

			}

			return await _service.GetAllContabilizarAsync(Data);

		}



		[HttpPut("ContabilizarDocumento")]

		[Authorize(Policy = "/ban-documento-contabilizar|U")]

		public async Task<IActionResult> ContabilizarDocumento(BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			ApplyAuditActu(Data);

			var resultado = await _service.ContabilizarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}

		[HttpPut("DesContabilizarDocumento")]

		[Authorize(Policy = "/ban-documento-contabilizar|U")]

		public async Task<IActionResult> DesContabilizarDocumento(BAN_DOCUMENTOTable Data)

		{

			Data.CORR_EMPRESA = GetCorrEmpresa();

			ApplyAuditActu(Data);

			var resultado = await _service.DesContabilizarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);

			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);

		}

	}

}


