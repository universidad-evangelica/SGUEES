using sguees.Services;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace sguees.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
	public class CON_LISTAController : ControllerBase
	{
		private readonly ICON_LISTAService _service;
		
		public CON_LISTAController(ICON_LISTAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetESTADO_PARTIDA_CON_PARTIDA")]
		[Authorize(Policy = "/con-partida|R")]
        public CResult GetESTADO_PARTIDA_CON_PARTIDA()
        {
            return _service.GetESTADO_PARTIDA();
        }

		[HttpGet("GetCLASE_PARTIDA_CON_PARTIDA")]
		[Authorize(Policy = "/con-partida|R")]
        public CResult GetCLASE_PARTIDA_CON_PARTIDA()
        {
            return _service.GetCLASE_PARTIDA();
        }

        [HttpGet("GetESTADO_PARTIDA_CON_PARTIDA_MODELO")]
		[Authorize(Policy = "/con-partida-modelo|R")]
        public CResult GetESTADO_PARTIDA_CON_PARTIDA_MODELO()
        {
            return _service.GetESTADO_PARTIDA();
        }

        [HttpGet("GetESTADO_CENTRO_COSTO_CON_CENTRO_COSTO")]
		[Authorize(Policy = "/con-centro-costo|R")]
        public CResult GetESTADO_CENTRO_COSTO_CON_CENTRO_COSTO()
        {
            return _service.GetESTADO_CENTRO_COSTO();
        }

        [HttpGet("GetCLASE_RUBRO_CON_CATALOGO_CUENTA")]
		[Authorize(Policy = "/con-catalogo-cuenta|R")]
        public CResult GetCLASE_RUBRO_CON_CATALOGO_CUENTA()
        {
            return _service.GetCLASE_RUBRO();
        }

        [HttpGet("GetCLASE_RUBRO_CON_RUBRO")]
		[Authorize(Policy = "/con-rubro|R")]
        public CResult GetCLASE_RUBRO_CON_RUBRO()
        {
            return _service.GetCLASE_RUBRO();
        }

        [HttpGet("GetCLASE_VALUACION_CON_CATALOGO_CUENTA")]
		[Authorize(Policy = "/con-catalogo-cuenta|R")]
        public CResult GetCLASE_VALUACION_CON_CATALOGO_CUENTA()
        {
            return _service.GetCLASE_VALUACION_CATALOGO_CUENTA();
        }

        [HttpGet("GetCLASE_CENTRO_COSTO_CON_TIPO_CENTRO_COSTO")]
		[Authorize(Policy = "/con-tipo-centro-costo|R")]
        public CResult GetCLASE_CENTRO_COSTO_CON_TIPO_CENTRO_COSTO()
        {
            return _service.GetCLASE_CENTRO_COSTO();
        }
    }
}
