using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;
namespace sguees.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ACA_PLANES_ACADEMICOSController : ControllerBase
    {
        private readonly IACA_PLANES_ACADEMICOSService _service;
        public ACA_PLANES_ACADEMICOSController(IACA_PLANES_ACADEMICOSService service){_service=service;}
        private int Empresa=>int.TryParse(User.FindFirstValue("CORR_EMPRESA"),out var id)?id:0;
        [HttpGet("GetAll")]
        [Authorize(Policy="/aca-carreras|R")]
        public Task<CResult> GetAll([FromQuery] ACA_PLANES_ACADEMICOSParam data)
        {data.CORR_EMPRESA=Empresa;return _service.GetAllAsync(data);}
        [HttpGet("GetModalidades")]
        [Authorize(Policy="/aca-carreras|R")]
        public Task<CResult> GetModalidades([FromQuery] ACA_PLANES_ACADEMICOSParam data)
        {data.CORR_EMPRESA=Empresa;return _service.GetModalidadesAsync(data);}
        [HttpPost]
        [Authorize(Policy="/aca-carreras|C")]
        public async Task<IActionResult> Post(ACA_PLANES_ACADEMICOSTable data)
        {
            data.CORR_EMPRESA=Empresa;
            var result=await _service.CreateAsync(data,User.FindFirstValue(ClaimTypes.NameIdentifier),ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result?StatusCode(201,result):BadRequest(result);
        }
        [HttpPut]
        [Authorize(Policy="/aca-carreras|U")]
        public async Task<IActionResult> Put(ACA_PLANES_ACADEMICOSTable data)
        {
            this.ApplyQueryKeys(data,nameof(data.CORR_CARRERA),nameof(data.CORR_PLAN_ACADEMICO));
            data.CORR_EMPRESA=Empresa;
            var result=await _service.UpdateAsync(data,User.FindFirstValue(ClaimTypes.NameIdentifier),ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result?Ok(result):BadRequest(result);
        }
        [HttpPut("CambiarVigencia")]
        [Authorize(Policy="/aca-carreras|U")]
        public async Task<IActionResult> CambiarVigencia(ACA_PLANES_ACADEMICOSTable data)
        {
            this.ApplyQueryKeys(data,nameof(data.CORR_CARRERA),nameof(data.CORR_PLAN_ACADEMICO));
            data.CORR_EMPRESA=Empresa;
            var result=await _service.CambiarVigenciaAsync(data,User.FindFirstValue(ClaimTypes.NameIdentifier),ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result?Ok(result):BadRequest(result);
        }
        // Sin DELETE: se preservan las versiones y sus referencias históricas.
    }
}
