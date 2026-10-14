using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using System.Security.Claims;
using sguees.api.Shared;

namespace sguees.Controllers
{
    // Qué hace: información laboral del prospecto para la consulta de prospectos (pestaña Información económica).
    // Cómo lo hace: solo lectura con el permiso de la pantalla padre (/aca-prospecto);
    //               sin POST/PUT/DELETE hasta la fase de edición.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTO_EMPLEOController : ControllerBase
    {
        private readonly IACA_PROSPECTO_EMPLEOService _service;

        public ACA_PROSPECTO_EMPLEOController(IACA_PROSPECTO_EMPLEOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_EMPLEOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTO_EMPLEOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        // Qué hace: actualiza la información laboral del prospecto.
        // Cómo lo hace: toma CORR_PROSPECTO_EMPLEO del body o del query, completa auditoría y llama a UpdateAsync.
        [HttpPut]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Put(ACA_PROSPECTO_EMPLEOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_PROSPECTO_EMPLEOTable.CORR_PROSPECTO_EMPLEO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Qué hace: crea la información laboral del prospecto (máximo una) y marca TRABAJA en la persona.
        // Cómo lo hace: los hijos del prospecto se rigen por el permiso U de /aca-prospecto (no por C,
        //               que crearía prospectos); completa auditoría de creación y llama a CreateAsync.
        [HttpPost]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Post(ACA_PROSPECTO_EMPLEOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Qué hace: elimina la información laboral del prospecto y deja TRABAJA en 0 en la persona.
        // Cómo lo hace: PK por query (estándar DELETE); mismo permiso U del padre.
        [HttpDelete]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Delete([FromQuery] ACA_PROSPECTO_EMPLEOTable Data)
        {
            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        private void SetCreateAudit(ACA_PROSPECTO_EMPLEOTable Data)
        {
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
        }

        private void SetUpdateAudit(ACA_PROSPECTO_EMPLEOTable Data)
        {
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
