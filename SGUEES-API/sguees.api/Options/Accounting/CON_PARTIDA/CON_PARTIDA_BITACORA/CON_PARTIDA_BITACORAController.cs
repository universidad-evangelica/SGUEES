using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	// Qué hace: expone lectura de CON_PARTIDA_BITACORA para la pantalla de partidas.
	// Cómo lo hace: GetAll/Get con política /con-partida|R y empresa del JWT.
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class CON_PARTIDA_BITACORAController : ControllerBase
	{
		private readonly ICON_PARTIDA_BITACORAService _service;

		public CON_PARTIDA_BITACORAController(ICON_PARTIDA_BITACORAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/con-partida|R")]
		public async Task<CResult> GetAll([FromQuery] CON_PARTIDA_BITACORAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/con-partida|R")]
		public async Task<CResult> Get([FromQuery] CON_PARTIDA_BITACORAParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
	}
}
