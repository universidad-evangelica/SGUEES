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
    public class PLA_NIVEL_ACADEMICOController : ControllerBase
    {
        private readonly IPLA_NIVEL_ACADEMICOService _service;

        public PLA_NIVEL_ACADEMICOController(IPLA_NIVEL_ACADEMICOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/pla-nivel-academico|R")]
        // Completa la empresa desde la sesión antes de consultar el catálogo.
        public async Task<CResult> GetAll([FromQuery] PLA_NIVEL_ACADEMICOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Atiende la consulta de un nivel académico dentro de la empresa de la sesión.
        [HttpGet("Get")]
        [Authorize(Policy = "/pla-nivel-academico|R")]
        public async Task<CResult> Get([FromQuery] PLA_NIVEL_ACADEMICOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/pla-nivel-academico|C")]
        // Asigna la auditoría de creación y devuelve el resultado del guardado.
        public async Task<IActionResult> Post(PLA_NIVEL_ACADEMICOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/pla-nivel-academico|U")]
        // Aplica la llave de la consulta y la auditoría antes de actualizar.
        public async Task<IActionResult> Put(PLA_NIVEL_ACADEMICOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(PLA_NIVEL_ACADEMICOTable.CORR_NIVEL_ACADEMICO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/pla-nivel-academico|D")]
        // Restringe la eliminación a la empresa de la sesión actual.
        public async Task<IActionResult> Delete([FromQuery] PLA_NIVEL_ACADEMICOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/pla-nivel-academico|U")]
        // Identifica el registro y solicita el cambio de estado en su empresa.
        public async Task<IActionResult> ActivarInactivar(PLA_NIVEL_ACADEMICOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(PLA_NIVEL_ACADEMICOTable.CORR_NIVEL_ACADEMICO));
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

        // Completa empresa, usuario, estación y fechas para un registro nuevo.
        private void SetCreateAudit(PLA_NIVEL_ACADEMICOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_NIVEL_ACADEMICO ??= true;
        }

        // Actualiza los datos de auditoría sin reemplazar la información de creación.
        private void SetUpdateAudit(PLA_NIVEL_ACADEMICOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_NIVEL_ACADEMICO.HasValue)
            {
                Data.ESTADO_NIVEL_ACADEMICO = true;
            }
        }
    }
}
