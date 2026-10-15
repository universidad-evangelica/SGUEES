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
    public class ACA_CARRERAS_SEDESController : ControllerBase
    {
        private readonly IACA_CARRERAS_SEDESService _service;
        public ACA_CARRERAS_SEDESController(IACA_CARRERAS_SEDESService service) { _service=service; }
        private int Empresa => int.TryParse(User.FindFirstValue("CORR_EMPRESA"),out var id)?id:0;
        [HttpGet("GetAll")]
        [Authorize(Policy="/aca-carreras|R")]
        public Task<CResult> GetAll([FromQuery] ACA_CARRERAS_SEDESParam data)
        {
            data.CORR_EMPRESA=Empresa;
            return _service.GetAllAsync(data);
        }
        [HttpPost]
        [Authorize(Policy="/aca-carreras|C")]
        public async Task<IActionResult> Post(ACA_CARRERAS_SEDESTable data)
        {
            data.CORR_EMPRESA=Empresa;
            var result=await _service.CreateAsync(data,User.FindFirstValue(ClaimTypes.NameIdentifier),ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result?StatusCode(201,result):BadRequest(result);
        }
        [HttpPut("ActivarInactivar")]
        [Authorize(Policy="/aca-carreras|U")]
        public async Task<IActionResult> ActivarInactivar(ACA_CARRERAS_SEDESTable data)
        {
            this.ApplyQueryKeys(data,nameof(ACA_CARRERAS_SEDESTable.CORR_CARRERA),nameof(ACA_CARRERAS_SEDESTable.CORR_SEDE));
            data.CORR_EMPRESA=Empresa;
            var result=await _service.ActivarInactivarAsync(data,User.FindFirstValue(ClaimTypes.NameIdentifier),ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result?Ok(result):BadRequest(result);
        }
        // No se expone DELETE: las asociaciones se conservan para períodos e historial.
    }
}
