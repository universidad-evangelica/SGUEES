using sguees.Services;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace sguees.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
	public class PLA_LISTAController : ControllerBase
	{
		private readonly IPLA_LISTAService _service;
		
		public PLA_LISTAController(IPLA_LISTAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
	

        [HttpGet("getCLASE_DEPARTAMENTO_PLA_DEPARTAMENTO")]
        [Authorize(Policy = "/pla-departamento|R")]
        public CResult getCLASE_DEPARTAMENTO_PLA_DEPARTAMENTO()
        {
            return _service.getCLASE_DEPARTAMENTO();
        }
	}
}
