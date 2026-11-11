using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class GEN_PROVEEDORController : ControllerBase
	{
		private readonly IGEN_PROVEEDORService _service;

		public GEN_PROVEEDORController(IGEN_PROVEEDORService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-proveedor|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PROVEEDORParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-proveedor|R")]
		public async Task<CResult> Get([FromQuery] GEN_PROVEEDORParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetCORR_PERSONA")]
		[Authorize(Policy = "/gen-proveedor|R")]
		public async Task<CResult> GetCORR_PERSONA([FromQuery] GEN_PROVEEDORParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetPersonasLookupAsync(Data);
		}

		[HttpGet("GetPersona")]
		[Authorize(Policy = "/gen-proveedor|R")]
		public async Task<CResult> GetPersona([FromQuery] GEN_PROVEEDORParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetPersonaAsync(Data);
		}

		[HttpPost("PersonaNatural")]
		[Authorize(Policy = "/gen-proveedor|C")]
		public async Task<IActionResult> PostPersonaNatural(GEN_PROVEEDOR_PERSONATable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;

			var resultado = await _service.CreatePersonaNaturalAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("PersonaNatural")]
		[Authorize(Policy = "/gen-proveedor|U")]
		public async Task<IActionResult> PutPersonaNatural(GEN_PROVEEDOR_PERSONATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_PROVEEDOR_PERSONATable.CORR_PERSONA));
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);

			var resultado = await _service.UpdatePersonaNaturalAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPost("PersonaJuridica")]
		[Authorize(Policy = "/gen-proveedor|C")]
		public async Task<IActionResult> PostPersonaJuridica(GEN_PROVEEDOR_PERSONATable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;

			var resultado = await _service.CreatePersonaJuridicaAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("PersonaJuridica")]
		[Authorize(Policy = "/gen-proveedor|U")]
		public async Task<IActionResult> PutPersonaJuridica(GEN_PROVEEDOR_PERSONATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_PROVEEDOR_PERSONATable.CORR_PERSONA));
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);

			var resultado = await _service.UpdatePersonaJuridicaAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-proveedor|C")]
		public async Task<IActionResult> Post(GEN_PROVEEDORTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-proveedor|U")]
		public async Task<IActionResult> Put(GEN_PROVEEDORTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_PROVEEDORTable.CORR_PROVEEDOR));
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-proveedor|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_PROVEEDORTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_PROVEEDORTable.CORR_PROVEEDOR));
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-proveedor|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_PROVEEDORTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_PROVEEDOR_BAN_SOLI_CHEQUE")]
		[Authorize(Policy = "/ban-soli-cheque|R")]
		public async Task<CResult> GetCORR_PROVEEDOR_BAN_SOLI_CHEQUE()
		{
			return await _service.GetLookupAsync(GetCorrEmpresa());
		}

		[HttpGet("GetCORR_PROVEEDOR_BAN_CHEQUE")]
		[Authorize(Policy = "/ban-cheque|R")]
		public async Task<CResult> GetCORR_PROVEEDOR_BAN_CHEQUE()
		{
			return await _service.GetLookupAsync(GetCorrEmpresa());
		}

		[HttpGet("GetCORR_PROVEEDOR_BAN_DOCUMENTO")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> GetCORR_PROVEEDOR_BAN_DOCUMENTO()
		{
			return await _service.GetLookupAsync(GetCorrEmpresa());
		}

		[HttpGet("GetCORR_PROVEEDOR_COM_DOCUMENTO")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetCORR_PROVEEDOR_COM_DOCUMENTO()
		{
			return await _service.GetLookupComDocumentoAsync(GetCorrEmpresa());
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private bool ValidateEmpresaSesion(out CResult resultado)
		{
			if (GetCorrEmpresa() > 0)
			{
				resultado = null;
				return true;
			}

			resultado = new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = 4100,
				ErrorMessage = "No se pudo guardar el proveedor porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_PROVEEDORController]",
				RowsAffected = 0
			};

			return false;
		}

		private string GetUsuario() =>
			User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;

		private void SetCreateAudit(GEN_PROVEEDORTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}

		private void SetUpdateAudit(GEN_PROVEEDORTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
