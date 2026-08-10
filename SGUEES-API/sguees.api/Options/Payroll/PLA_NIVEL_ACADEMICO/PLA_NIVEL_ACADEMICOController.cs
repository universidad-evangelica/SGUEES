// Endpoints REST del catálogo Payroll de nivel académico.
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
    // Qué hace: expone el CRUD del catálogo de nivel académico con autorización por política.
    public class PLA_NIVEL_ACADEMICOController : ControllerBase
    {
        private readonly IPLA_NIVEL_ACADEMICOService _service;

        public PLA_NIVEL_ACADEMICOController(IPLA_NIVEL_ACADEMICOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/pla-nivel-academico|R")]
        // Qué hace: lista los niveles académicos de la empresa en sesión.
        // Cómo: fija CORR_EMPRESA y llama a GetAllAsync del servicio.
        public async Task<CResult> GetAll([FromQuery] PLA_NIVEL_ACADEMICOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/pla-nivel-academico|R")]
        // Qué hace: obtiene un nivel académico de la empresa en sesión.
        // Cómo: fija CORR_EMPRESA y llama a GetAsync del servicio.
        public async Task<CResult> Get([FromQuery] PLA_NIVEL_ACADEMICOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        // Qué hace: entrega niveles académicos para el lookup del mantenimiento de puestos.
        // Cómo: fija CORR_EMPRESA y llama a GetAllAsync (autorizado para pla-puesto).
        [HttpGet("GetCORR_NIVEL_ACADEMICO_PLA_PUESTO")]
        [Authorize(Policy = "/pla-puesto|R")]
        public async Task<CResult> GetCORR_NIVEL_ACADEMICO_PLA_PUESTO([FromQuery] PLA_NIVEL_ACADEMICOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/pla-nivel-academico|C")]
        // Qué hace: crea un nivel académico nuevo.
        // Cómo: completa la auditoría de creación y llama a CreateAsync del servicio.
        public async Task<IActionResult> Post(PLA_NIVEL_ACADEMICOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/pla-nivel-academico|U")]
        // Qué hace: actualiza un nivel académico existente.
        // Cómo: copia la llave de la URL al cuerpo, completa la auditoría y llama a UpdateAsync del servicio.
        public async Task<IActionResult> Put(PLA_NIVEL_ACADEMICOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(PLA_NIVEL_ACADEMICOTable.CORR_NIVEL_ACADEMICO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/pla-nivel-academico|D")]
        // Qué hace: elimina un nivel académico de la empresa en sesión.
        // Cómo: fija CORR_EMPRESA y llama a DeleteAsync del servicio.
        public async Task<IActionResult> Delete([FromQuery] PLA_NIVEL_ACADEMICOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/pla-nivel-academico|U")]
        // Qué hace: cambia el estado activo/inactivo de un nivel académico.
        // Cómo: copia la llave de la URL, fija CORR_EMPRESA y llama a ActivarInactivarAsync del servicio.
        public async Task<IActionResult> ActivarInactivar(PLA_NIVEL_ACADEMICOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(PLA_NIVEL_ACADEMICOTable.CORR_NIVEL_ACADEMICO));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Qué hace: obtiene CORR_EMPRESA del claim del usuario autenticado.
        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Qué hace: obtiene el identificador de usuario desde los claims.
        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Qué hace: completa los datos de auditoría de un registro nuevo.
        // Cómo: fija empresa, usuario, estación y fechas; deja ESTADO_NIVEL_ACADEMICO en true si viene vacío.
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

        // Qué hace: completa los datos de auditoría de una actualización.
        // Cómo: fija empresa, usuario, estación y fecha; conserva ESTADO_NIVEL_ACADEMICO o lo deja en true si falta.
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
