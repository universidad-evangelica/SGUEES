using scuees.Services;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace scuees.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
	public class COM_LISTAController : ControllerBase
	{
		private readonly ICOM_LISTAService _service;
		
		public COM_LISTAController(ICOM_LISTAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetESTADO_SOLI_COTIZACION_COM_SOLI_COTIZACION")]
		[Authorize(Policy = "/com-soli-cotizacion|R")]
        public CResult GetESTADO_SOLI_COTIZACION_COM_SOLI_COTIZACION()
        {
            return _service.GetESTADO_SOLI_COTIZACION();
        }

		[HttpGet("GetESTADO_COTIZACION_COM_COTIZACION")]
		[Authorize(Policy = "/com-cotizacion|R")]
        public CResult GetESTADO_COTIZACION_COM_COTIZACION()
        {
            return _service.GetESTADO_SOLI_COTIZACION();
        }

        [HttpGet("GetESTADO_CUADRO_COMPARATIVO_COM_CUADRO_COMPARATIVO")]
		[Authorize(Policy = "/com-cuadro-comparativo|R")]
        public CResult GetESTADO_CUADRO_COMPARATIVO_COM_CUADRO_COMPARATIVO()
        {
            return _service.GetESTADO_CUADRO_COMPARATIVO();
        }

        [HttpGet("GetCLASE_COMENTARIO_COM_COTIZACION")]
		[Authorize(Policy = "/com-cotizacion|R")]
        public CResult GetCLASE_COMENTARIO_COM_COTIZACION()
        {
            return _service.GetCLASE_COMENTARIO();
        }

        [HttpGet("GetESTADO_CUADRO_COMPARATIVO_COM_CUADRO_COMPARATIVO_AUTORIZA")]
		[Authorize(Policy = "/com-cuadro-comparativo-autoriza|R")]
        public CResult GetESTADO_CUADRO_COMPARATIVO_COM_CUADRO_COMPARATIVO_AUTORIZA()
        {
            return _service.GetESTADO_CUADRO_COMPARATIVO();
        }

        [HttpGet("GetCLASE_BANCO_COM_BANCO")]
		[Authorize(Policy = "/com-banco|R")]
        public CResult GetCLASE_BANCO_COM_BANCO()
        {
            return _service.GetCLASE_BANCO();
        }
        [HttpGet("GetCLASE_TIPO_SOLI_COTIZA_COM_TIPO_SOLI_COTIZA")]
		[Authorize(Policy = "/com-tipo-soli-cotiza|R")]
        public CResult GetCLASE_TIPO_SOLI_COTIZA_COM_TIPO_SOLI_COTIZA()
        {
            return _service.GetCLASE_TIPO_SOLI_COTIZA();
        }

        [HttpGet("GetESTADO_DOCUMENTO_COM_DOCUMENTO")]
		[Authorize(Policy = "/com-documento|R")]
        public CResult GetESTADO_DOCUMENTO_COM_DOCUMENTO()
        {
            return _service.GetESTADO_DOCUMENTO();
        }

        [HttpGet("GetESTADO_ADMINISTRATIVO_COM_DOCUMENTO")]
		[Authorize(Policy = "/com-documento|R")]
        public CResult GetESTADO_ADMINISTRATIVO_COM_DOCUMENTO()
        {
            return _service.GetESTADO_ADMINISTRATIVO();
        }
    }
}
