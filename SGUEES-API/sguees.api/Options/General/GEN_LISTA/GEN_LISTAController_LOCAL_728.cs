using sguees.Services;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace sguees.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
	public class GEN_LISTAController : ControllerBase
	{
		private readonly IGEN_LISTAService _service;
		
		public GEN_LISTAController(IGEN_LISTAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetESTADO_PROVEEDOR_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
        public CResult GetESTADO_PROVEEDOR_COM_PROVEEDOR()
        {
            return _service.GetESTADO_PROVEEDOR();
        }

        [HttpGet("GetESTADO_PROVEEDOR_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
        public CResult GetESTADO_PROVEEDOR_COM_PROVEEDOR_ACTU()
        {
            return _service.GetESTADO_PROVEEDOR();
        }

        [HttpGet("GetESTADO_PROVEEDOR_WEB_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
        public CResult GetESTADO_PROVEEDOR_WEB_COM_PROVEEDOR()
        {
            return _service.GetESTADO_PROVEEDOR_WEB();
        }

        [HttpGet("GetESTADO_PROVEEDOR_WEB_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
        public CResult GetESTADO_PROVEEDOR_WEB_COM_PROVEEDOR_ACTU()
        {
            return _service.GetESTADO_PROVEEDOR_WEB();
        }

        [HttpGet("GetTIPO_PERSONERIA_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
        public CResult GetTIPO_PERSONERIA_COM_PROVEEDOR()
        {
            return _service.GetTIPO_PERSONERIA();
        }

        [HttpGet("GetTIPO_PERSONERIA_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
        public CResult GetTIPO_PERSONERIA_COM_PROVEEDOR_ACTU()
        {
            return _service.GetTIPO_PERSONERIA();
        }
        
		[HttpGet("GetCLASE_FORMA_PAGO_GEN_FORMA_PAGO")]
		[Authorize(Policy = "/gen-forma-pago|R")]
        public CResult GetCLASE_FORMA_PAGO_GEN_FORMA_PAGO()
        {
            return _service.GetCLASE_FORMA_PAGO();
        }

        [HttpGet("GetESTADO_USUARIO_SEG_USUARIO")]
		[Authorize(Policy = "/seg-usuario|R")]
        public CResult GetESTADO_USUARIO_SEG_USUARIO()
        {
            return _service.GetESTADO_USUARIO();
        }

        [HttpGet("GetTIPO_USUARIO_SEG_USUARIO")]
		[Authorize(Policy = "/seg-usuario|R")]
        public CResult GetTIPO_USUARIO_SEG_USUARIO()
        {
            return _service.GetTIPO_USUARIO();
        }

        [HttpGet("GetESTADO_USUARIO_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
        public CResult GetESTADO_USUARIO_COM_PROVEEDOR()
        {
            return _service.GetESTADO_USUARIO();
        }

        [HttpGet("GetESTADO_USUARIO_COM_PROVEEDOR_ACTU")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
        public CResult GetESTADO_USUARIO_COM_PROVEEDOR_ACTU()
        {
            return _service.GetESTADO_USUARIO();
        }

        [HttpGet("GetCLASE_AUTORIZACION_COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONES")]
		[Authorize(Policy = "/com-cuadro-comparativo-config-autorizaciones|R")]
        public CResult GetCLASE_AUTORIZACION_COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONES()
        {
            return _service.GetCLASE_AUTORIZACION();
        }

        [HttpGet("GetCLASE_BITACORA_COM_BITACORA")]
		[Authorize(Policy = "/com-bitacora|R")]
        public CResult GetCLASE_BITACORA_COM_BITACORA()
        {
            return _service.GetCLASE_BITACORA();
        }

        [HttpGet("GetCODIGO_OPCION_COMPRAS_COM_BITACORA")]
		[Authorize(Policy = "/com-bitacora|R")]
        public CResult GetCODIGO_OPCION_COMPRAS_COM_BITACORA()
        {
            return _service.GetCODIGO_OPCION_COMPRAS();
        }

        [HttpGet("GetCLASE_RUBRO_GEN_RUBRO")]
		[Authorize(Policy = "/gen-rubro|R")]
        public CResult GetCLASE_RUBRO_GEN_RUBRO()
        {
            return _service.GetCLASE_RUBRO();
        }
        
        [HttpGet("GetSUMA_RESTA_GEN_RUBRO")]
		[Authorize(Policy = "/gen-rubro|R")]
        public CResult GetSUMA_RESTA()
        {
            return _service.GetSUMA_RESTA();
        }
        
        [HttpGet("GetTIPO_APLICACION_GEN_RUBRO")]
        [Authorize(Policy = "/gen-rubro|R")]
        public CResult GetTIPO_APLICACION()
        {
            return _service.GetTIPO_APLICACION();
        }

        [HttpGet("GetSUMA_RESTA_GEN_TIPO_DOCUMENTO")]
		[Authorize(Policy = "/gen-tipo-documento|R")]
        public CResult GetSUMA_RESTA_GEN_TIPO_DOCUMENTO()
        {
            return _service.GetSUMA_RESTA();
        }

        [HttpGet("GetCLASE_DOCUMENTO_GEN_TIPO_DOCUMENTO")]
		[Authorize(Policy = "/gen-tipo-documento|R")]
        public CResult GetCLASE_DOCUMENTO_GEN_TIPO_DOCUMENTO()
        {
            return _service.GetCLASE_DOCUMENTO();
        }

        [HttpGet("GetLIBRO_IVA_GEN_TIPO_DOCUMENTO")]
		[Authorize(Policy = "/gen-tipo-documento|R")]
        public CResult GetLIBRO_IVA_GEN_TIPO_DOCUMENTO()
        {
            return _service.GetLIBRO_IVA();
        }

        [HttpGet("GetMES_COM_DOCUMENTO")]
        [Authorize(Policy = "/com-documento|R")]
        public CResult GetMES_COM_DOCUMENTO()
        {
            return _service.GetMES();
        }

       
	}
}
