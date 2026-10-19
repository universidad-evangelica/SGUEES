using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;
using sguees.Repositories;

namespace sguees.Controllers
{
    // Qué hace: API del mantenimiento de Facultades (Académico › Tablas Generales › Facultades).
    // Cómo lo hace: patrón A+ con estado de catálogo; la empresa y el usuario salen del token y cada acción
    //               exige el permiso de /aca-facultades (R, C, U, D).
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ACA_FACULTADESController : ControllerBase
    {
        private readonly IACA_FACULTADESService _service;
        private readonly IACA_CARRERASLookupRepository _carrerasLookup;

        public ACA_FACULTADESController(IACA_FACULTADESService service, IACA_CARRERASLookupRepository carrerasLookup)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
            _carrerasLookup = carrerasLookup ?? throw new ArgumentNullException(nameof(carrerasLookup));
        }

        [HttpGet("GetCORR_FACULTAD_ACA_CARRERAS")]
        [Authorize(Policy = "/aca-carreras|R")]
        public Task<CResult> GetCORR_FACULTAD_ACA_CARRERAS()
            => _carrerasLookup.GetAsync(CatalogoCarrera.Facultades, GetCorrEmpresa());

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-facultades|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_FACULTADESParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-facultades|R")]
        public async Task<CResult> Get([FromQuery] ACA_FACULTADESParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/aca-facultades|C")]
        public async Task<IActionResult> Post(ACA_FACULTADESTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/aca-facultades|U")]
        public async Task<IActionResult> Put(ACA_FACULTADESTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_FACULTADESTable.CORR_FACULTAD));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/aca-facultades|D")]
        public async Task<IActionResult> Delete([FromQuery] ACA_FACULTADESTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/aca-facultades|U")]
        public async Task<IActionResult> ActivarInactivar(ACA_FACULTADESTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_FACULTADESTable.CORR_FACULTAD));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        private void SetCreateAudit(ACA_FACULTADESTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ACTIVO ??= true;
        }

        private void SetUpdateAudit(ACA_FACULTADESTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
