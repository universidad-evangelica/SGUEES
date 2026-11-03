using System.Security.Claims;
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
    public class ACA_PERIODOS_MANTENIMIENTOController : ControllerBase
    {
        private readonly IACA_PERIODOS_MANTENIMIENTOService service;
        public ACA_PERIODOS_MANTENIMIENTOController(IACA_PERIODOS_MANTENIMIENTOService service) { this.service = service; }
        private int Empresa => int.TryParse(User.FindFirstValue("CORR_EMPRESA"), out var id) ? id : 0;
        [HttpGet("GetAll"), Authorize(Policy = "/aca-periodos-academicos|R")]
        public Task<CResult> GetAll([FromQuery] ACA_PERIODOConsulta data) { data.CORR_EMPRESA = Empresa; return service.GetAllAsync(data); }
        [HttpGet("GetCatalogos"), Authorize(Policy = "/aca-periodos-academicos|R")]
        public Task<CResult> GetCatalogos() => service.GetCatalogosAsync(Empresa);
        [HttpGet("GetHistorial"), Authorize(Policy = "/aca-periodos-academicos|R")]
        public Task<CResult> GetHistorial([FromQuery] ACA_PERIODOConsulta data) { data.CORR_EMPRESA = Empresa; return service.GetHistorialAsync(data); }
        [HttpGet("GetOferta"), Authorize(Policy = "/aca-periodos-academicos|R")]
        public Task<CResult> GetOferta([FromQuery] ACA_PERIODOConsulta data) { data.CORR_EMPRESA = Empresa; return service.GetOfertaAsync(data); }
        [HttpPost, Authorize(Policy = "/aca-periodos-academicos|C")]
        public async Task<IActionResult> Post(ACA_PERIODOInput data) { data.CORR_EMPRESA = Empresa; var r = await service.WriteAsync(1, data, User.FindFirstValue(ClaimTypes.NameIdentifier), ClientInfoHelper.GetClientStation(HttpContext)); return r.Result ? StatusCode(201, r) : BadRequest(r); }
        [HttpPut, Authorize(Policy = "/aca-periodos-academicos|U")]
        public async Task<IActionResult> Put(ACA_PERIODOInput data) { this.ApplyQueryKeys(data, nameof(data.CORR_PERIODO_ACADEMICO)); data.CORR_EMPRESA = Empresa; var r = await service.WriteAsync(2, data, User.FindFirstValue(ClaimTypes.NameIdentifier), ClientInfoHelper.GetClientStation(HttpContext)); return r.Result ? Ok(r) : BadRequest(r); }
        [HttpPut("ActivarInactivar"), Authorize(Policy = "/aca-periodos-academicos|U")]
        public async Task<IActionResult> ActivarInactivar(ACA_PERIODOInput data) { this.ApplyQueryKeys(data, nameof(data.CORR_PERIODO_ACADEMICO)); data.CORR_EMPRESA = Empresa; var r = await service.WriteAsync(3, data, User.FindFirstValue(ClaimTypes.NameIdentifier), ClientInfoHelper.GetClientStation(HttpContext)); return r.Result ? Ok(r) : BadRequest(r); }
    }
}
