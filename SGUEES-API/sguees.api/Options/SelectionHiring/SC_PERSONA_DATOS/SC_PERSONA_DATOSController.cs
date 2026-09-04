using System;
using System.IO;
using System.Linq;
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
	public class SC_PERSONA_DATOSController : ControllerBase
	{
		private readonly ISC_PERSONA_DATOSService _service;
		private readonly PersonaFotoStorage _fotoStorage;

		public SC_PERSONA_DATOSController(ISC_PERSONA_DATOSService service, PersonaFotoStorage fotoStorage)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
			_fotoStorage = fotoStorage ?? throw new ArgumentNullException(nameof(fotoStorage));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-persona-datos|R")]
		public async Task<CResult> GetAll([FromQuery] SC_PERSONA_DATOSParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/sc-persona-datos|R")]
		public async Task<CResult> Get([FromQuery] SC_PERSONA_DATOSParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/sc-persona-datos|C")]
		public async Task<IActionResult> Post(SC_PERSONA_DATOSTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.CreateAsync(Data, string.Empty, string.Empty);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpPut]
		[Authorize(Policy = "/sc-persona-datos|U")]
		public async Task<IActionResult> Put(SC_PERSONA_DATOSTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(SC_PERSONA_DATOSTable.CORR_PERSONA_DATOS));
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.UpdateAsync(Data, string.Empty, string.Empty);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpDelete]
		[Authorize(Policy = "/sc-persona-datos|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_PERSONA_DATOSTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_PERSONA_DATOS_SC_SOLICITUD_EMPLEO")]
		[Authorize(Policy = "/sc-solicitud-empleo,/sc-requisicion-personal|R")]
		public async Task<CResult> GetCORR_PERSONA_DATOS_SC_SOLICITUD_EMPLEO([FromQuery] SC_PERSONA_DATOSParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetFoto_SC_SOLICITUD_EMPLEO")]
		[Authorize(Policy = "/sc-solicitud-empleo,/sc-requisicion-personal|R")]
		public async Task<IActionResult> GetFoto_SC_SOLICITUD_EMPLEO([FromQuery] SC_PERSONA_DATOSParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.GetAsync(Data);
			if (!resultado.Result || resultado.Data is not SC_PERSONA_DATOSView persona || string.IsNullOrWhiteSpace(persona.FOTO_URL))
			{
				return NotFound();
			}

			if (!_fotoStorage.TryResolveFinalFile(persona.FOTO_URL, out var physicalPath))
			{
				return NotFound();
			}

			var contentType = Path.GetExtension(physicalPath).ToLowerInvariant() switch
			{
				".png" => "image/png",
				".webp" => "image/webp",
				_ => "image/jpeg",
			};

			var stream = new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read);
			Response.RegisterForDispose(stream);
			return File(stream, contentType);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}
	}
}
