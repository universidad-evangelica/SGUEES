using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
	/// <summary>
	/// API del proceso Movimiento de personal.
	/// Lookups propios (unidad / puesto / modalidad) con permiso de esta pantalla.
	/// </summary>
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class SC_MOVIMIENTO_PERSONALController : ControllerBase
	{
		/// <summary>
		/// CORR_TIPO_DOCUMENTO en SEG_FLUJO (ajustar cuando configuren el flujo).
		/// Requisición usa 101; movimiento debe usar uno nuevo (ej. 103).
		/// </summary>
		private const int TipoDocumentoMovimiento = 103;

		private readonly ISC_MOVIMIENTO_PERSONALService _service;

		public SC_MOVIMIENTO_PERSONALController(ISC_MOVIMIENTO_PERSONALService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-movimiento-personal|R")]
		public async Task<CResult> GetAll([FromQuery] SC_MOVIMIENTO_PERSONALParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/sc-movimiento-personal|R")]
		public async Task<CResult> Get([FromQuery] SC_MOVIMIENTO_PERSONALParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/sc-movimiento-personal|C")]
		public async Task<IActionResult> Post(SC_MOVIMIENTO_PERSONALTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/sc-movimiento-personal|U")]
		public async Task<IActionResult> Put(SC_MOVIMIENTO_PERSONALTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(SC_MOVIMIENTO_PERSONALTable.CORR_MOVIMIENTO_PERSONAL));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/sc-movimiento-personal|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_MOVIMIENTO_PERSONALTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		/// <summary>
		/// Operaciones de flujo: Enviar / Aprobar / Devolver / Rechazar.
		/// En falla de negocio responde 200 Ok con Result=false (mismo patrón requisición).
		/// </summary>
		[HttpPut("Autoriza")]
		[Authorize(Policy = "/sc-movimiento-personal|U")]
		public async Task<IActionResult> Autoriza(SC_MOVIMIENTO_PERSONAL_AUTORIZAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.AutorizaAsync(Data, GetUsuario());
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return Ok(resultado);
		}

		/// <summary>
		/// Confirmación TH: CONFIRMADO=1 + USUARIO_CONFIRMA (LOGIN_SISTEMA) + FECHA_CONFIRMA.
		/// </summary>
		[HttpPut("Confirmar")]
		[Authorize(Policy = "/sc-movimiento-personal|U")]
		public async Task<IActionResult> Confirmar(SC_MOVIMIENTO_PERSONAL_CONFIRMAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.ConfirmarAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));

			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return Ok(resultado);
		}

		[HttpGet("GetCORR_BITACORA_SC_MOVIMIENTO_PERSONAL")]
		[Authorize(Policy = "/sc-movimiento-personal|R")]
		public async Task<CResult> GetCORR_BITACORA_SC_MOVIMIENTO_PERSONAL(
			[FromQuery] SC_MOVIMIENTO_PERSONAL_BITACORAParam Data)
		{
			Data.CORR_TIPO_DOCUMENTO = TipoDocumentoMovimiento;
			return await _service.GetBitacoraAsync(Data);
		}

		/// <summary>Lookup unidades del usuario (getLookUp → GetCORR_UNIDAD_SC_MOVIMIENTO_PERSONAL).</summary>
		[HttpGet("GetCORR_UNIDAD_SC_MOVIMIENTO_PERSONAL")]
		[Authorize(Policy = "/sc-movimiento-personal|R")]
		public async Task<CResult> GetCORR_UNIDAD_SC_MOVIMIENTO_PERSONAL([FromQuery] SC_MOVIMIENTO_PERSONALParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.LOGIN_SISTEMA = GetUsuario();
			return await _service.GetUnidadesUsuarioAsync(Data);
		}

		/// <summary>Lookup puestos por unidad (getLookUp → GetCORR_PUESTO_SC_MOVIMIENTO_PERSONAL).</summary>
		[HttpGet("GetCORR_PUESTO_SC_MOVIMIENTO_PERSONAL")]
		[Authorize(Policy = "/sc-movimiento-personal|R")]
		public async Task<CResult> GetCORR_PUESTO_SC_MOVIMIENTO_PERSONAL([FromQuery] SC_MOVIMIENTO_PERSONALParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetPuestosByUnidadAsync(Data);
		}

		/// <summary>Lookup modalidades (getLookUp → GetCORR_TIPO_MODALIDAD_SC_MOVIMIENTO_PERSONAL).</summary>
		[HttpGet("GetCORR_TIPO_MODALIDAD_SC_MOVIMIENTO_PERSONAL")]
		[Authorize(Policy = "/sc-movimiento-personal|R")]
		public async Task<CResult> GetCORR_TIPO_MODALIDAD_SC_MOVIMIENTO_PERSONAL(
			[FromQuery] SC_MOVIMIENTO_PERSONALParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetModalidadesAsync(Data);
		}

		/// <summary>Lookup empleados activos (getLookUp → GetCORR_EMPLEADO_SC_MOVIMIENTO_PERSONAL).</summary>
		[HttpGet("GetCORR_EMPLEADO_SC_MOVIMIENTO_PERSONAL")]
		[Authorize(Policy = "/sc-movimiento-personal|R")]
		public async Task<CResult> GetCORR_EMPLEADO_SC_MOVIMIENTO_PERSONAL(
			[FromQuery] SC_MOVIMIENTO_PERSONALParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetEmpleadosAsync(Data);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
		}

		private void SetCreateAudit(SC_MOVIMIENTO_PERSONALTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}

		private void SetUpdateAudit(SC_MOVIMIENTO_PERSONALTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
