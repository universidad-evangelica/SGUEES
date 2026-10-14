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
    // Qué hace: cabecera del estudio socioeconómico del prospecto para la consulta de prospectos (pestaña Información económica).
    // Cómo lo hace: solo lectura con el permiso de la pantalla padre (/aca-prospecto);
    //               sin POST/PUT/DELETE hasta la fase de edición.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTO_SOCIOECONOMICOController : ControllerBase
    {
        private readonly IACA_PROSPECTO_SOCIOECONOMICOService _service;

        public ACA_PROSPECTO_SOCIOECONOMICOController(IACA_PROSPECTO_SOCIOECONOMICOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_SOCIOECONOMICOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTO_SOCIOECONOMICOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        // Qué hace: actualiza la cabecera del estudio socioeconómico (aplica cuota máxima).
        // Cómo lo hace: toma CORR_PROSPECTO_SOCIOECONOMICO del body o del query, completa auditoría y llama a UpdateAsync.
        //               La versión del cuestionario y los términos aceptados no se editan desde el ERP.
        [HttpPut]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Put(ACA_PROSPECTO_SOCIOECONOMICOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_PROSPECTO_SOCIOECONOMICOTable.CORR_PROSPECTO_SOCIOECONOMICO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        private void SetUpdateAudit(ACA_PROSPECTO_SOCIOECONOMICOTable Data)
        {
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
