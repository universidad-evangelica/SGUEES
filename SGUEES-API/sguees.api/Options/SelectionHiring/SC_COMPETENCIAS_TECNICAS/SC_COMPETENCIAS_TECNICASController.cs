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
    public class SC_COMPETENCIAS_TECNICASController : ControllerBase
    {
        private readonly ISC_COMPETENCIAS_TECNICASService _service;

        public SC_COMPETENCIAS_TECNICASController(ISC_COMPETENCIAS_TECNICASService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        // Atiende la consulta del listado de competencias técnicas y la limita a la empresa de la sesión.
        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        public async Task<CResult> GetAll([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Atiende la consulta de una competencia técnica dentro de la empresa de la sesión.
        [HttpGet("Get")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        public async Task<CResult> Get([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpGet("GetCORR_COMPETENCIAS_TECNICAS_PADRE_SC_COMPETENCIAS_TECNICAS")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        // Provee los posibles padres para construir la jerarquía.
        public async Task<CResult> GetCORR_COMPETENCIAS_TECNICAS_PADRE_SC_COMPETENCIAS_TECNICAS(
            [FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetPadresAsync(Data);
        }

        [HttpGet("GetCORR_COMPETENCIAS_TECNICAS_NIV3_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        // Provee competencias de nivel tres agrupadas para el descriptor.
        public async Task<CResult> GetCORR_COMPETENCIAS_TECNICAS_NIV3_SC_DESCRIPTOR_PUESTO([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetCatalogoNivel3DescriptorAsync(Data);
        }

        [HttpGet("GetNextCodigo")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        // Genera el siguiente código para el padre indicado.
        public async Task<CResult> GetNextCodigo([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetNextCodigoAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-competencias-tecnicas|C")]
        // Completa auditoría y crea la competencia en la empresa de la sesión.
        public async Task<IActionResult> Post(SC_COMPETENCIAS_TECNICASTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-competencias-tecnicas|U")]
        // Aplica la llave consultada y la auditoría antes de actualizar.
        public async Task<IActionResult> Put(SC_COMPETENCIAS_TECNICASTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_COMPETENCIAS_TECNICASTable.CORR_COMPETENCIAS_TECNICAS));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Valida el contexto de empresa y elimina la competencia técnica indicada por sus claves.
        [HttpDelete]
        [Authorize(Policy = "/sc-competencias-tecnicas|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_COMPETENCIAS_TECNICASTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Identifica el registro y solicita el cambio de estado activo/inactivo en su empresa.
        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/sc-competencias-tecnicas|U")]
        public async Task<IActionResult> ActivarInactivar(SC_COMPETENCIAS_TECNICASTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_COMPETENCIAS_TECNICASTable.CORR_COMPETENCIAS_TECNICAS));
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
        private void SetCreateAudit(SC_COMPETENCIAS_TECNICASTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_COMPETENCIAS_TECNICAS ??= true;
        }

        // Actualiza auditoría sin reemplazar la información de creación.
        private void SetUpdateAudit(SC_COMPETENCIAS_TECNICASTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_COMPETENCIAS_TECNICAS.HasValue)
            {
                Data.ESTADO_COMPETENCIAS_TECNICAS = true;
            }
        }
    }
}
