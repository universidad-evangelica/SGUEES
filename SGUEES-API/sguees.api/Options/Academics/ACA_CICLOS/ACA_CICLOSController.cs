using System.Security.Claims;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    [ApiController, Authorize, Route("[controller]")]
    public class ACA_CICLOSController : ControllerBase
    {
        private readonly IACA_CICLOSService repo;
        public ACA_CICLOSController(IACA_CICLOSService repo) { this.repo = repo; }
        private int Empresa => int.TryParse(User.FindFirstValue("CORR_EMPRESA"), out var id) ? id : 0;
        [HttpGet("Areas"), Authorize(Policy = "/aca-periodos-academicos|R")] public Task<CResult> Areas() => repo.Areas(Empresa);
        [HttpGet("GetAll"), Authorize(Policy = "/aca-periodos-academicos|R")] public Task<CResult> GetAll(int CORR_AREA_ACADEMICA = 0) => repo.Listar(Empresa, CORR_AREA_ACADEMICA);
        [HttpGet("Detalle"), Authorize(Policy = "/aca-periodos-academicos|R")] public Task<CResult> Detalle(int CORR_CICLO_ACADEMICO) => repo.Detalle(Empresa, CORR_CICLO_ACADEMICO);
        [HttpGet("Catalogos"), Authorize(Policy = "/aca-periodos-academicos|R")] public Task<CResult> Catalogos() => repo.Catalogos(Empresa);
        [HttpGet("Oferta"), Authorize(Policy = "/aca-periodos-academicos|R")] public Task<CResult> Oferta(int CORR_CICLO_ACADEMICO, int CORR_SEDE, DateTime FECHA_REFERENCIA) => repo.Oferta(Empresa, CORR_CICLO_ACADEMICO, CORR_SEDE, FECHA_REFERENCIA);
        private async Task<IActionResult> Write(string op, ACA_CICLOInput data) { var r = await repo.Write(op, Empresa, data, User.FindFirstValue(ClaimTypes.NameIdentifier), ClientInfoHelper.GetClientStation(HttpContext)); return r.Result ? Ok(r) : BadRequest(r); }
        [HttpPost, Authorize(Policy = "/aca-periodos-academicos|C")] public Task<IActionResult> Post(ACA_CICLOInput data) => Write("CREAR", data);
        [HttpPut, Authorize(Policy = "/aca-periodos-academicos|U")] public Task<IActionResult> Put(ACA_CICLOInput data) => Write("GUARDAR", data);
        [HttpPut("Sede"), Authorize(Policy = "/aca-periodos-academicos|U")] public Task<IActionResult> Sede(ACA_CICLOInput data) => Write("SEDE", data);
        [HttpPut("Facultad"), Authorize(Policy = "/aca-periodos-academicos|U")] public Task<IActionResult> Facultad(ACA_CICLOInput data) => Write("FACULTAD", data);
        [HttpPut("Carrera"), Authorize(Policy = "/aca-periodos-academicos|U")] public Task<IActionResult> Carrera(ACA_CICLOInput data) => Write("CARRERA", data);
        [HttpPut("Todas"), Authorize(Policy = "/aca-periodos-academicos|U")] public Task<IActionResult> Todas(ACA_CICLOInput data) => Write("TODAS", data);
        [HttpPut("Habilitar"), Authorize(Policy = "/aca-periodos-academicos|U")] public Task<IActionResult> Habilitar(ACA_CICLOInput data) => Write("HABILITAR", data);
        [HttpPut("Borrador"), Authorize(Policy = "/aca-periodos-academicos|U")] public Task<IActionResult> Borrador(ACA_CICLOInput data) => Write("BORRADOR", data);
        [HttpPut("Cerrar"), Authorize(Policy = "/aca-periodos-academicos|U")] public Task<IActionResult> Cerrar(ACA_CICLOInput data) => Write("CERRAR", data);
    }
}
