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
    // Qué hace: consulta de prospectos de pregrado (Académico → Consultas → Prospectos).
    // Cómo lo hace: solo expone lectura; sin POST/PUT/DELETE hasta la fase de edición.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTOController : ControllerBase
    {
        private readonly IACA_PROSPECTOService _service;

        public ACA_PROSPECTOController(IACA_PROSPECTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }
    }
}
