using System;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGUEES.Services;

namespace SGUEES.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class SC_LISTAController : ControllerBase
    {
        private readonly ISC_LISTAService _service;

        public SC_LISTAController(ISC_LISTAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetNIVEL_DOMINIO_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public CResult GetNIVEL_DOMINIO_SC_DESCRIPTOR_PUESTO()
        {
            return _service.GetNIVEL_DOMINIO();
        }

        [HttpGet("GetSEXO_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public CResult GetSEXO_SC_DESCRIPTOR_PUESTO()
        {
            return _service.GetSEXO();
        }

        [HttpGet("GetESTADO_FAMILIAR_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public CResult GetESTADO_FAMILIAR_SC_DESCRIPTOR_PUESTO()
        {
            return _service.GetESTADO_FAMILIAR();
        }

        [HttpGet("GetLICENCIA_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public CResult GetLICENCIA_SC_DESCRIPTOR_PUESTO()
        {
            return _service.GetLICENCIA();
        }

        [HttpGet("GetTIPO_REQUERIDO_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public CResult GetTIPO_REQUERIDO_SC_DESCRIPTOR_PUESTO()
        {
            return _service.GetTIPO_REQUERIDO();
        }

        [HttpGet("GetFORMATO_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public CResult GetFORMATO_SC_DESCRIPTOR_PUESTO()
        {
            return _service.GetFORMATO();
        }

        [HttpGet("GetUNIDAD_TIEMPO_INDUCCION_SC_INDUCCION")]
        [Authorize(Policy = "/sc-induccion|R")]
        public CResult GetUNIDAD_TIEMPO_INDUCCION_SC_INDUCCION()
        {
            return _service.GetUNIDAD_TIEMPO_INDUCCION();
        }

        [HttpGet("GetNIVEL_SC_COMPETENCIAS_TECNICAS")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        public CResult GetNIVEL_SC_COMPETENCIAS_TECNICAS()
        {
            return _service.GetNIVEL();
        }
    }
}
