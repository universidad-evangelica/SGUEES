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
    // Qué hace: consulta de prospectos de pregrado (Académico → Consultas → Prospectos).
    // Cómo lo hace: solo expone lectura; sin POST/PUT/DELETE hasta la fase de edición.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTOController : ControllerBase
    {
        private readonly IACA_PROSPECTOService _service;

        public ACA_PROSPECTOController(IACA_PROSPECTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        // Qué hace: actualiza los datos editables del encabezado (forma de ingreso y quién financia).
        // Cómo lo hace: toma CORR_PROSPECTO del body o del query, completa auditoría y llama a UpdateAsync.
        //               ESTADO y los campos de proceso no se tocan: pertenecen a la migración a estudiante.
        // Qué hace: carreras que el prospecto puede elegir en su ciclo (cambio de carrera desde el ERP).
        // Cómo lo hace: misma oferta que el formulario del aspirante, más la condición de plan vigente.
        [HttpGet("GetCORR_CARRERA_ACA_PROSPECTO")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetCORR_CARRERA_ACA_PROSPECTO([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_CARRERA_ACA_PROSPECTOAsync(Data);
        }

        // Qué hace: modalidades con plan vigente de la carrera elegida.
        [HttpGet("GetCORR_MODALIDAD_ACA_PROSPECTO")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetCORR_MODALIDAD_ACA_PROSPECTO([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_MODALIDAD_ACA_PROSPECTOAsync(Data);
        }

        [HttpPut]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Put(ACA_PROSPECTOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_PROSPECTOTable.CORR_PROSPECTO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        private void SetUpdateAudit(ACA_PROSPECTOTable Data)
        {
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
