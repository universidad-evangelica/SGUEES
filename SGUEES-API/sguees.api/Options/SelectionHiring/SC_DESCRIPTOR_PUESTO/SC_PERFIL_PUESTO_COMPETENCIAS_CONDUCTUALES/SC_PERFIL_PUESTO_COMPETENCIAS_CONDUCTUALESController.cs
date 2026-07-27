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
    public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESController : ControllerBase
    {
        private readonly ISC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESService _service;

        public SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESController(ISC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        // Obtiene el listado de competencia conductual del perfil aplicando los filtros recibidos.
        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetAll([FromQuery] SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Obtiene un registro de competencia conductual del perfil con los identificadores recibidos.
        [HttpGet("Get")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> Get([FromQuery] SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        // Crea un registro de competencia conductual del perfil con la auditoría de la sesión.
        [HttpPost]
        [Authorize(Policy = "/sc-descriptor-puesto|C")]
        public async Task<IActionResult> Post(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data)
        {
            // Completa auditoría de creación y empresa de sesión.
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Actualiza el registro de competencia conductual del perfil y su auditoría de modificación.
        [HttpPut]
        [Authorize(Policy = "/sc-descriptor-puesto|U")]
        public async Task<IActionResult> Put(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data)
        {
            this.ApplyQueryKeys(
                Data,
                nameof(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable.CORR_DESCRIPTOR_PUESTO),
                nameof(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable.CORR_PERFIL_PUESTO),
                nameof(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable.CORR_COMPETENCIAS_CONDUCTUALES));
            // Actualiza auditoría de modificación y empresa de sesión.
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Elimina el registro de competencia conductual del perfil solicitado para la empresa de la sesión.
        [HttpDelete]
        [Authorize(Policy = "/sc-descriptor-puesto|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Lee CORR_EMPRESA del claim de la sesión autenticada.

        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Obtiene el identificador de usuario desde los claims.

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Completa los datos de auditoría requeridos para una creación.
        private void SetCreateAudit(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
        }

        // Completa los datos de auditoría requeridos para una actualización.
        private void SetUpdateAudit(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
