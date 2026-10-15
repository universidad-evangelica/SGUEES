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

namespace sguees.Controllers
{
    // Qué hace: API de la sección "Sedes de la Facultad" dentro de /aca-facultades.
    // Cómo lo hace: es un detalle sin opción de menú propia, así que usa el permiso de la pantalla padre:
    //               leer con R; asignar, cambiar estado o quitar una sede es modificar la facultad (U).
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ACA_FACULTADES_SEDESController : ControllerBase
    {
        private readonly IACA_FACULTADES_SEDESService _service;

        public ACA_FACULTADES_SEDESController(IACA_FACULTADES_SEDESService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-facultades|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_FACULTADES_SEDESParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-facultades|R")]
        public async Task<CResult> Get([FromQuery] ACA_FACULTADES_SEDESParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/aca-facultades|U")]
        public async Task<IActionResult> Post(ACA_FACULTADES_SEDESTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/aca-facultades|U")]
        public async Task<IActionResult> Put(ACA_FACULTADES_SEDESTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_FACULTADES_SEDESTable.CORR_FACULTAD), nameof(ACA_FACULTADES_SEDESTable.CORR_SEDE));
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/aca-facultades|U")]
        public async Task<IActionResult> Delete([FromQuery] ACA_FACULTADES_SEDESTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
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
    }
}
