using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class SC_RIESGO_PUESTOController : ControllerBase
    {
        private readonly ISC_RIESGO_PUESTOService _service;

        public SC_RIESGO_PUESTOController(ISC_RIESGO_PUESTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        // Atiende la consulta del listado de riesgos de puesto y la limita a la empresa de la sesión.
        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-riesgo-puesto|R")]
        public async Task<CResult> GetAll([FromQuery] SC_RIESGO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Atiende la consulta de un riesgo de puesto dentro de la empresa de la sesión.
        [HttpGet("Get")]
        [Authorize(Policy = "/sc-riesgo-puesto|R")]
        public async Task<CResult> Get([FromQuery] SC_RIESGO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpGet("GetCORR_RIESGO_PUESTO_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        // Provee riesgos activos para el descriptor.
        public async Task<CResult> GetCORR_RIESGO_PUESTO_SC_DESCRIPTOR_PUESTO([FromQuery] SC_RIESGO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetCatalogoDescriptorAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-riesgo-puesto|C")]
        // Completa auditoría antes de crear el riesgo.
        public async Task<IActionResult> Post(SC_RIESGO_PUESTOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-riesgo-puesto|U")]
        // Aplica la llave consultada y la auditoría antes de actualizar.
        public async Task<IActionResult> Put(SC_RIESGO_PUESTOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_RIESGO_PUESTOTable.CORR_RIESGO_PUESTO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Valida el contexto de empresa y elimina el riesgo de puesto indicado por sus claves.
        [HttpDelete]
        [Authorize(Policy = "/sc-riesgo-puesto|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_RIESGO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Identifica el registro y solicita el cambio de estado activo/inactivo en su empresa.
        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/sc-riesgo-puesto|U")]
        public async Task<IActionResult> ActivarInactivar(SC_RIESGO_PUESTOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_RIESGO_PUESTOTable.CORR_RIESGO_PUESTO));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Obtiene la empresa asociada a la sesión para aislar las operaciones del usuario.
        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Obtiene el identificador del usuario autenticado para registrar la auditoría.
        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Completa empresa, usuario, estación y fechas del registro nuevo.
        private void SetCreateAudit(SC_RIESGO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_RIESGO_PUESTO ??= true;
        }

        // Actualiza auditoría sin reemplazar la información de creación.
        private void SetUpdateAudit(SC_RIESGO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_RIESGO_PUESTO.HasValue)
            {
                Data.ESTADO_RIESGO_PUESTO = true;
            }
        }
    }
}
