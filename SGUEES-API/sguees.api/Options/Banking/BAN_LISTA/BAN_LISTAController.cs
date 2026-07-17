using sguees.Services;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace sguees.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
	public class BAN_LISTAController : ControllerBase
	{
		private readonly IBAN_LISTAService _service;
		
		public BAN_LISTAController(IBAN_LISTAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetCLASE_BANCO_GEN_BANCO")]
		[Authorize(Policy = "/gen-banco|R")]
        public CResult GetCLASE_BANCO_GEN_BANCO()
        {
            return _service.GetCLASE_BANCO();
        }

		[HttpGet("GetAUMENTA_DISMINUYE_BAN_LINEA_TRABAJO_CONCILIACION")]
		[Authorize(Policy = "/ban-linea-trabajo-conciliacion|R")]
        public CResult GetAUMENTA_DISMINUYE_BAN_LINEA_TRABAJO_CONCILIACION()
        {
            return _service.GetAUMENTA_DISMINUYE();
        }

        [HttpGet("GetCLASE_TIPO_CHEQUE_BAN_TIPO_CHEQUE")]
		[Authorize(Policy = "/ban-tipo-cheque|R")]
        public CResult GetCLASE_TIPO_CHEQUE_BAN_TIPO_CHEQUE()
        {
            return _service.GetCLASE_TIPO_CHEQUE();
        }

        [HttpGet("GetSUMA_RESTA_BAN_TIPO_MOVI_BANCARIO")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|R")]
        public CResult GetSUMA_RESTA_BAN_TIPO_MOVI_BANCARIO()
        {
            return _service.GetSUMA_RESTA();
        }

        [HttpGet("GetCLASE_MOVIMIENTO_BAN_TIPO_MOVI_BANCARIO")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|R")]
        public CResult GetCLASE_MOVIMIENTO_BAN_TIPO_MOVI_BANCARIO()
        {
            return _service.GetCLASE_MOVIMIENTO();
        }

        [HttpGet("GetTIPO_CUENTA_BANCO_BAN_CUENTA_BANCARIA")]
		[Authorize(Policy = "/ban-cuenta-bancaria|R")]
        public CResult GetTIPO_CUENTA_BANCO_BAN_CUENTA_BANCARIA()
        {
            return _service.GetTIPO_CUENTA_BANCO();
        }

        [HttpGet("GetESTADO_CUENTA_BAN_CUENTA_BANCARIA")]
		[Authorize(Policy = "/ban-cuenta-bancaria|R")]
        public CResult GetESTADO_CUENTA_BAN_CUENTA_BANCARIA()
        {
            return _service.GetESTADO_CUENTA();
        }

        [HttpGet("GetCLASE_CHEQUE_BAN_CUENTA_BANCARIA")]
		[Authorize(Policy = "/ban-cuenta-bancaria|R")]
        public CResult GetCLASE_CHEQUE_BAN_CUENTA_BANCARIA()
        {
            return _service.GetCLASE_CHEQUE();
        }

        [HttpGet("GetESTADO_CHEQUERA_BAN_CUENTA_BANCARIA")]
		[Authorize(Policy = "/ban-cuenta-bancaria|R")]
        public CResult GetESTADO_CHEQUERA_BAN_CUENTA_BANCARIA()
        {
            return _service.GetESTADO_CUENTA();
        }

        [HttpGet("GetESTADO_DOCUMENTO_BAN_DOCUMENTO")]
		[Authorize(Policy = "/ban-documento|R")]
        public CResult GetESTADO_DOCUMENTO_BAN_DOCUMENTO()
        {
            return _service.GetESTADO_DOCUMENTO();
        }

        [HttpGet("GetESTADO_DOCUMENTO_BAN_CHEQUE")]
		[Authorize(Policy = "/ban-cheque|R")]
        public CResult GetESTADO_DOCUMENTO_BAN_CHEQUE()
        {
            return _service.GetESTADO_DOCUMENTO();
        }
    }
}
