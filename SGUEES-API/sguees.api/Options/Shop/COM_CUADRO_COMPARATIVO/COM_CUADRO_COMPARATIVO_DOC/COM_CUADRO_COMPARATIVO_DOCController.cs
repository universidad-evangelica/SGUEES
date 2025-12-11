using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]

	public class COM_CUADRO_COMPARATIVO_DOCController : ControllerBase
	{
		private readonly ICOM_CUADRO_COMPARATIVO_DOCService _service;
		private readonly IWebHostEnvironment _webHostEnvironment;

		public COM_CUADRO_COMPARATIVO_DOCController(ICOM_CUADRO_COMPARATIVO_DOCService service, IWebHostEnvironment webHostEnvironment)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
			_webHostEnvironment = webHostEnvironment;
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> GetAll([FromQuery] COM_CUADRO_COMPARATIVO_DOCParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
		public async Task<CResult> Get([FromQuery] COM_CUADRO_COMPARATIVO_DOCParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/com-cuadro-comparativo|C")]
		public async Task<IActionResult> Post(COM_CUADRO_COMPARATIVO_DOCTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.CreateAsync(Data, "Admin", "e-CoffeeTech");
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
		[Authorize(Policy = "/com-cuadro-comparativo|U")]
		public async Task<IActionResult> Put(COM_CUADRO_COMPARATIVO_DOCTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
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
		[Authorize(Policy = "/com-cuadro-comparativo|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_CUADRO_COMPARATIVO_DOCTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpPost("PostDoc")]
		[Authorize(Policy = "/com-cuadro-comparativo|U")]
		public async Task<IActionResult> PostDoc([FromForm] COM_CUADRO_COMPARATIVO_DOC_PDFTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;

			string contentRootPath = _webHostEnvironment.ContentRootPath;
			string pathRoot = Path.Combine(contentRootPath, "uploads");

			var resultado = await _service.CreateDocAsync(Data, pathRoot, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return StatusCode(202, resultado);
			}
		}

		[HttpGet("getDoc")]
		[Authorize(Policy = "/com-cuadro-comparativo|P")]
		public async Task<Stream> getDoc([FromQuery] COM_CUADRO_COMPARATIVO_DOCParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Stream vDoc = null;
			vDoc = await _service.GetDocAsync(Data);

			// Determinar el contenido
			if (Path.GetExtension(Data.NOMBRE_ARCHIVO).ToLower() == ".pdf")
			{
				Response.Headers.ContentType = "application/pdf";
			}
			else
			{
				Response.Headers.ContentType = "image/" + Path.GetExtension(Data.NOMBRE_ARCHIVO).ToLower();
			}

			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(vDoc);

			return vDoc;
		}

		[HttpPost("PostDocCOM_CUADRO_COMPARATIVO_AUTORIZA")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|U")]
		public async Task<IActionResult> PostDocCOM_CUADRO_COMPARATIVO_AUTORIZA([FromForm] COM_CUADRO_COMPARATIVO_DOC_PDFTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;

			string contentRootPath = _webHostEnvironment.ContentRootPath;
			string pathRoot = Path.Combine(contentRootPath, "uploads");

			var resultado = await _service.CreateDocAsync(Data, pathRoot, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return StatusCode(202, resultado);
			}
		}

		[HttpGet("getDocCOM_CUADRO_COMPARATIVO_AUTORIZA")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|P")]
		public async Task<Stream> getDocCOM_CUADRO_COMPARATIVO_AUTORIZA([FromQuery] COM_CUADRO_COMPARATIVO_DOCParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Stream vDoc = null;
			vDoc = await _service.GetDocAsync(Data);

			// Determinar el contenido
			if (Path.GetExtension(Data.NOMBRE_ARCHIVO).ToLower() == ".pdf")
			{
				Response.Headers.ContentType = "application/pdf";
			}
			else
			{
				Response.Headers.ContentType = "image/" + Path.GetExtension(Data.NOMBRE_ARCHIVO).ToLower();
			}

			Response.Headers.ContentDisposition = "inline";
			Response.RegisterForDispose(vDoc);

			return vDoc;
		}

		[HttpGet("GetAllCOM_CUADRO_COMPARATIVO_AUTORIZA")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|R")]
		public async Task<CResult> GetAllCOM_CUADRO_COMPARATIVO_AUTORIZA([FromQuery] COM_CUADRO_COMPARATIVO_DOCParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
	}
}
