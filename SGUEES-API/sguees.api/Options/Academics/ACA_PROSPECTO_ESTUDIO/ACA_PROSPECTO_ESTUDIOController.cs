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
    // Qué hace: estudios previos del prospecto (pestaña Información académica).
    // Cómo lo hace: usa el permiso de la pantalla padre (/aca-prospecto): R para consultar y U para
    //               los cambios, porque los hijos del prospecto se rigen por el padre (C crearía
    //               prospectos). Un prospecto tiene a lo sumo tres estudios, uno por sección.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTO_ESTUDIOController : ControllerBase
    {
        private readonly IACA_PROSPECTO_ESTUDIOService _service;

        public ACA_PROSPECTO_ESTUDIOController(IACA_PROSPECTO_ESTUDIOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_ESTUDIOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTO_ESTUDIOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        // Qué hace: actualiza un estudio del prospecto.
        // Cómo lo hace: toma CORR_PROSPECTO_ESTUDIO del body o del query, completa auditoría y valida
        //               en el Service según la sección (media, universitarios o graduado UEES).
        [HttpPut]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Put(ACA_PROSPECTO_ESTUDIOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_PROSPECTO_ESTUDIOTable.CORR_PROSPECTO_ESTUDIO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Qué hace: crea un estudio del prospecto (uno por sección).
        [HttpPost]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Post(ACA_PROSPECTO_ESTUDIOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Qué hace: elimina un estudio del prospecto (al apagar el interruptor de su sección).
        // Cómo lo hace: PK por query (estándar DELETE); mismo permiso U del padre.
        [HttpDelete]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Delete([FromQuery] ACA_PROSPECTO_ESTUDIOTable Data)
        {
            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        private void SetCreateAudit(ACA_PROSPECTO_ESTUDIOTable Data)
        {
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
        }

        private void SetUpdateAudit(ACA_PROSPECTO_ESTUDIOTable Data)
        {
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
