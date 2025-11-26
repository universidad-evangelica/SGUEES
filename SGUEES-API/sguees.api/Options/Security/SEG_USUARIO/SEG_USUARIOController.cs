using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using scuees.Models;
using scuees.Services;

namespace scuees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]

	public class SEG_USUARIOController : ControllerBase
	{
		private readonly ISEG_USUARIOService _service;

		public SEG_USUARIOController(ISEG_USUARIOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/seg-usuario|R")]
		public async Task<CResult> GetAll([FromQuery] SEG_USUARIOParam Data)
		{
			Data.LOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;

			return await _service.GetAllAsync(Data);
		}

		// [HttpGet("Get")]
		// [Authorize(Policy = "/seg-usuario|R")]
		// public async Task<CResult> Get([FromQuery] SEG_USUARIOParam Data)
		// {
		// 	Data.LOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;

		// 	return await _service.GetAsync(Data);
		// }

		[HttpPost]
		[Authorize(Policy = "/seg-usuario|C")]
		public async Task<IActionResult> Post(SEG_USUARIOTable Data)
		{
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.USUARIO_CREA;
			// Data.CORR_SUSCRIPCION = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_SUSCRIPCION").Value);
			// Data.CORR_CONFI_PAIS = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_CONFI_PAIS").Value);
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.CreateAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
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
		[Authorize(Policy = "/seg-usuario|U")]
		public async Task<IActionResult> Put(SEG_USUARIOTable Data)
		{
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = Data.USUARIO_ACTU;
			// Data.CORR_SUSCRIPCION = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_SUSCRIPCION").Value);
			// Data.CORR_CONFI_PAIS = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_CONFI_PAIS").Value);
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

			var resultado = await _service.UpdateAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
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
		[Authorize(Policy = "/seg-usuario|D")]
		public async Task<IActionResult> Delete([FromQuery] SEG_USUARIOTable Data)
		{
			Data.CORR_SUSCRIPCION = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_SUSCRIPCION").Value);
			Data.CORR_CONFI_PAIS = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_CONFI_PAIS").Value);
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[AllowAnonymous]
		[HttpPost("login")]
		public async Task<IActionResult> Login(SEG_USUARIO_LOGINParam Data)
		{
			var Response = await _service.LoginAsync(Data.LOGIN_SISTEMA,
																					Data.CLAVE_USUARIO,
																					Data.CODIGO_SUITE
																					);

			if (Response.Result == false)
				return StatusCode(202, Response);

			return Ok(Response);
		}

		[HttpGet("menu")]
		public async Task<IActionResult> GetMenu()
		{
			var LOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			var CODIGO_SUITE = User.Claims.ToList().SingleOrDefault(e => e.Type == "CODIGO_SUITE").Value;

			var Response = await _service.GetMenuAsync(LOGIN_SISTEMA, CODIGO_SUITE);

			if (Response.Result == false)
				return BadRequest(Response);

			return Ok(Response);
		}

		#region "Detalle de opciones"
		[HttpGet("GetAllSEG_USUARIO_OPCION")]
		[Authorize(Policy = "/seg-usuario|R")]
		public async Task<CResult> GetAllSEG_USUARIO_OPCION([FromQuery] SEG_USUARIOParam Data)
		{
			return await _service.GetAllSEG_USUARIO_OPCION(Data);
		}

		[HttpPut("PutSEG_USUARIO_OPCION")]
		[Authorize(Policy = "/seg-usuario|U")]
		public async Task<IActionResult> PutSEG_USUARIO_OPCION(SEG_USUARIO_OPCIONTable Data)
		{
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.USUARIO_CREA;

			var resultado = await _service.UpdateSEG_USUARIO_OPCIONAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}
		#endregion

		[HttpPost("CambioClave")]
		public async Task<IActionResult> CambioClave(SEG_USUARIO_LOGINParam Data)
		{
			var pWhere = new List<CParameter>();
			pWhere.Add(new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = System.Data.DbType.String });
			var UserForRepo = await _service.GetAsync(pWhere);

			if (UserForRepo == null)
				return BadRequest("Usuario No Existe");

			var resultado = await _service.CambioClave(Data, "Admin", "e-coffee");
			if (resultado.ErrorCode != 0)
			{
				return BadRequest(resultado.ErrorMessage);
			}

			// Agregado los permisos del usuario al token
			var userOpcion = await _service.getUSUARIO_PERMISOS(Data.LOGIN_SISTEMA, Data.CODIGO_SUITE);

			return Ok(new
			{
				token = _service.GenerateToken((SEG_USUARIOView)UserForRepo.Data, Data.CODIGO_SUITE, (List<SEG_USUARIO_PERMISOView>)userOpcion.Data)
			});
		}

		[HttpGet("GetUSUARIOS_COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONES")]
		[Authorize(Policy = "/com-cuadro-comparativo-config-autorizaciones|R")]
		public async Task<CResult> GetUSUARIOS_COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONES([FromQuery] SEG_USUARIOParam Data)
		{
			return await _service.GetAllSEG_USUARIO_LOOKUP(Data);
		}
	}
}
