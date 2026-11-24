using sguees.api.Shared;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  eadmindevprojectmanagement.Models;
using  eadmindevprojectmanagement.Services;

namespace eadmindevprojectmanagement.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]

	public class COM_DOCUMENTOController : ControllerBase
	{
		private readonly ICOM_DOCUMENTOService _service;

		public COM_DOCUMENTOController(ICOM_DOCUMENTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetAll([FromQuery] COM_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> Get([FromQuery] COM_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/com-documento|C")]
		public async Task<IActionResult> Post(COM_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;

			var resultado = await _service.CreateAsync(Data, "Admin", "e-coffee");
			if (resultado.Result)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return BadRequest(resultado.ErrorMessage);
			}
		}

		[HttpPut]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> Put(COM_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;

			var resultado = await _service.UpdateAsync(Data, "Admin", "e-coffee");
			if (resultado.Result)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpDelete]
		[Authorize(Policy = "/com-documento|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.FECHA_DOCUMENTO = DateTime.Now;
			Data.FECHA_VENCIMIENTO = DateTime.Now;
			Data.FECHA_CREA = DateTime.Now;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-coffee");
			if (resultado.Result)
			{
				return Ok(resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> Aplicar(COM_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();

			var resultado = await _service.AplicarAsync(Data);

			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return StatusCode(202, resultado);
			}
		}

		[HttpPut("GenerarCR")]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> GenerarCR(COM_DOCUMENTO_CRTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();

			var resultado = await _service.GenerarCRAsync(Data);

			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return StatusCode(202, resultado);
			}
		}

		[HttpPut("AnularCR")]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> AnularCR(COM_DOCUMENTO_ANULAR_CRTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();

			var resultado = await _service.AnularCRAsync(Data);

			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return StatusCode(202, resultado);
			}
		}

		[HttpGet("GetAllDesAplicar")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetAllDesAplicar([FromQuery] COM_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllDesAplicarAsync(Data);
		}		

		[HttpPut("DesAplicar")]
		[Authorize(Policy = "/com-documento-desaplicar|U")]
		public async Task<IActionResult> DesAplicar(COM_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();

			var resultado = await _service.DesAplicarAsync(Data);

			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return StatusCode(202, resultado);
			}
		}

		[HttpGet("GetAllJson")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetAllJson([FromQuery] COM_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllJsonAsync(Data);
		}

		[HttpGet("GetAllDisponibles")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetAllDisponibles([FromQuery] COM_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllDocumentosDisponiblesAsync(Data);
		}
		
		[HttpGet("GetAllCOM_DOCUMENTO_CR")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetAllCOM_DOCUMENTO_CR([FromQuery] COM_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllDocumentosCRAsync(Data);
		}

		[HttpGet("GetAllAnular")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetAllAnular([FromQuery] COM_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAnularAsync(Data);
		}

		[HttpGet("GetProvision")]
		[Authorize(Policy = "/com-documento|R")]
		public async Task<CResult> GetProvision([FromQuery] COM_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			return await _service.GetProvisionAsync(Data);
		}

		[HttpPut("Provisionar")]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> Provisionar(COM_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _service.ProvisionarAsync(Data, "Admin", "e-coffee");
			return resultado.Result && resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("ContabilizarProvision")]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> ContabilizarProvision(COM_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = Empresa();
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var resultado = await _service.ContabilizarProvisionAsync(Data);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : StatusCode(202, resultado);
		}

		[HttpPut("RegenerarProvisionConta")]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> RegenerarProvisionConta(COM_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _service.RegenerarProvisionContaAsync(Data, "Admin", "e-coffee");
			return resultado.Result && resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("ActualizarPartidaProvision")]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> ActualizarPartidaProvision(COM_DOCUMENTO_PROVISION_PARTIDA Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _service.ActualizarPartidaProvisionAsync(Data, "Admin", "e-coffee");
			return resultado.Result && resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("ActualizarProvisionConta")]
		[Authorize(Policy = "/com-documento|U")]
		public async Task<IActionResult> ActualizarProvisionConta([FromQuery] COM_DOCUMENTOParam documento, sguees.Models.COM_PROVISION_CONTATable Data)
		{
			documento.CORR_EMPRESA = Empresa();
			var resultado = await _service.ActualizarProvisionContaAsync(documento, Data, "Admin", "e-coffee");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		private int Empresa()
		{
			return int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
		}
	}
}
