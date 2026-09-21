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
    // Qué hace: preguntas de la versión del estudio socioeconómico con su respuesta para la consulta de prospectos (pestaña Información económica).
    // Cómo lo hace: solo lectura con el permiso de la pantalla padre (/aca-prospecto);
    //               sin POST/PUT/DELETE hasta la fase de edición.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTO_SE_RESPUESTAController : ControllerBase
    {
        private readonly IACA_PROSPECTO_SE_RESPUESTAService _service;

        public ACA_PROSPECTO_SE_RESPUESTAController(IACA_PROSPECTO_SE_RESPUESTAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_SE_RESPUESTAParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTO_SE_RESPUESTAParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }
    }
}
