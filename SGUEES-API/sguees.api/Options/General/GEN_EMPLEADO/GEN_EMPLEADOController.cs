// Qué hace: endpoints de empleados (browse + Iniciar + personales vía SP + foto).
// Cómo lo hace: Iniciar/UpdatePersonales usan PRAL_MTTO_GEN_EMPLEADO; SubirFoto/GetFoto en uploads/gen-empleado.
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Options.General.GEN_EMPLEADO;
using sguees.api.Shared;
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

		// Qué hace: inicia empleado (SP Insert: persona + empresa_persona + natural + empleado).
		// Cómo: recibe GEN_EMPLEADO_MTTOTable; auditoría; retorna 201 con V_GEN_EMPLEADO.
		[HttpPost("Iniciar")]
		[Authorize(Policy = "/gen-empleado|C")]
		public async Task<IActionResult> Iniciar(GEN_EMPLEADO_MTTOTable Data)
		{
			SetCreateAuditMtto(Data);
			var resultado = await _service.IniciarAsync(
				Data,
				GetCorrEmpresa(),
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		// Qué hace: obtiene GEN_PERSONA_NATURAL del empleado (por CORR_PERSONA).
		[HttpGet("GetPersonaNatural")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetPersonaNatural([FromQuery] GEN_PERSONA_NATURALParam Data)
		{
			return await _service.GetPersonaNaturalAsync(Data);
		}

		// Qué hace: actualiza personales + datos GEN_EMPLEADO vía SP.
		[HttpPut("PersonaNatural")]
		[Authorize(Policy = "/gen-empleado|U")]
		public async Task<IActionResult> UpdatePersonaNatural(GEN_EMPLEADO_MTTOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_EMPLEADO_MTTOTable.CORR_PERSONA_NATURAL));
			SetUpdateAuditMtto(Data);
			var resultado = await _service.UpdatePersonalesAsync(
				Data,
				GetCorrEmpresa(),
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		/// <summary>
		/// Qué hace: sube/reemplaza la fotografía del empleado en uploads/gen-empleado.
		/// Cómo: multipart CORR_PERSONA + file; retorna FOTO_URL relativa para persistir en GEN_PERSONA_NATURAL.
		/// </summary>
		[HttpPost("SubirFoto")]
		[Authorize(Policy = "/gen-empleado|U")]
		[RequestSizeLimit(6 * 1024 * 1024)]
		public async Task<IActionResult> SubirFoto(
			[FromForm] int CORR_PERSONA,
			IFormFile file,
			[FromServices] IWebHostEnvironment environment)
		{
			var corrEmpresa = GetCorrEmpresa();
			if (CORR_PERSONA <= 0 || corrEmpresa <= 0)
			{
				return BadRequest(new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "Identificador de persona inválido.",
				});
			}

			var fotoStorage = new EmpleadoFotoStorage(environment);
			var guardado = await fotoStorage.SaveFinalAsync(corrEmpresa, CORR_PERSONA, file);
			if (!guardado.Ok)
			{
				return BadRequest(new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = guardado.Error,
				});
			}

			return Ok(new CResult
			{
				Result = true,
				ErrorCode = 0,
				RowsAffected = 1,
				Data = new { FOTO_URL = guardado.RelativeUrl },
				ErrorMessage = "",
			});
		}

		/// <summary>
		/// Qué hace: descarga la fotografía del empleado (blob) para el preview del modal/panel.
		/// Cómo: lee FOTO_URL de V_GEN_PERSONA_NATURAL y resuelve el archivo en uploads/gen-empleado.
		/// </summary>
		[HttpGet("GetFoto")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<IActionResult> GetFoto(
			[FromQuery] GEN_PERSONA_NATURALParam Data,
			[FromServices] IWebHostEnvironment environment)
		{
			var resultado = await _service.GetPersonaNaturalAsync(Data);
			if (!resultado.Result || resultado.Data is not GEN_PERSONA_NATURALView persona || string.IsNullOrWhiteSpace(persona.FOTO_URL))
			{
				return NotFound();
			}

			var fotoStorage = new EmpleadoFotoStorage(environment);
			if (!fotoStorage.TryResolveFinalFile(persona.FOTO_URL, out var physicalPath))
			{
				return NotFound();
			}

			var stream = new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read);
			Response.RegisterForDispose(stream);
			return File(stream, EmpleadoFotoStorage.GetContentType(physicalPath));
		}

		// Qué hace: elimina el registro de empleado (fila GEN_EMPLEADO).
		// Cómo: Delete por CORR_EMPRESA (sesión) + CORR_EMPLEADO; 200 OK o BadRequest si hay FK.
		[HttpDelete]
		[Authorize(Policy = "/gen-empleado|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_EMPLEADOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(
				Data,
				GetUsuario(),
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
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

		[HttpGet("GetCORR_EMPLEADO_SC_DESCRIPTOR_PUESTO")]
		[Authorize(Policy = "/sc-descriptor-puesto|R")]
		public async Task<CResult> GetCORR_EMPLEADO_SC_DESCRIPTOR_PUESTO([FromQuery] GEN_EMPLEADOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAuditMtto(GEN_EMPLEADO_MTTOTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO_EMPLEADO ??= true;
		}

		private void SetUpdateAuditMtto(GEN_EMPLEADO_MTTOTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
