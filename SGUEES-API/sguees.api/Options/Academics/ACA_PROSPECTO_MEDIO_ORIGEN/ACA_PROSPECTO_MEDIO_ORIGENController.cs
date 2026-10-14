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
    // Qué hace: medios por los que el prospecto conoció la universidad para la consulta de prospectos (pestaña Información personal).
    // Cómo lo hace: solo lectura con el permiso de la pantalla padre (/aca-prospecto);
    //               sin POST/PUT/DELETE hasta la fase de edición.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTO_MEDIO_ORIGENController : ControllerBase
    {
        private readonly IACA_PROSPECTO_MEDIO_ORIGENService _service;

        public ACA_PROSPECTO_MEDIO_ORIGENController(IACA_PROSPECTO_MEDIO_ORIGENService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_MEDIO_ORIGENParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTO_MEDIO_ORIGENParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        // Qué hace: actualiza un medio de origen del prospecto (permiso U del padre /aca-prospecto).
        [HttpPut]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Put(ACA_PROSPECTO_MEDIO_ORIGENTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_PROSPECTO_MEDIO_ORIGENTable.CORR_PROSPECTO_MEDIO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Qué hace: agrega un medio de origen al prospecto (uno por medio).
        [HttpPost]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Post(ACA_PROSPECTO_MEDIO_ORIGENTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Qué hace: elimina un medio de origen del prospecto.
        [HttpDelete]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Delete([FromQuery] ACA_PROSPECTO_MEDIO_ORIGENTable Data)
        {
            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        private void SetCreateAudit(ACA_PROSPECTO_MEDIO_ORIGENTable Data)
        {
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
        }

        private void SetUpdateAudit(ACA_PROSPECTO_MEDIO_ORIGENTable Data)
        {
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
