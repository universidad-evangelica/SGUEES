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
    // Endpoints REST del catálogo Payroll de tipo de puesto.
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class PLA_TIPO_PUESTOController : ControllerBase
    {
        private readonly IPLA_TIPO_PUESTOService _service;

        public PLA_TIPO_PUESTOController(IPLA_TIPO_PUESTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/pla-tipo-puesto|R")]
        // Completa la empresa desde la sesión antes de consultar el catálogo.
        public async Task<CResult> GetAll([FromQuery] PLA_TIPO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/pla-tipo-puesto|R")]
        // Obtiene un tipo filtrando por empresa de sesión.
        public async Task<CResult> Get([FromQuery] PLA_TIPO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpGet("GetCORR_TIPO_PUESTO_SC_COMPETENCIAS_CONDUCTUALES")]
        [Authorize(Policy = "/sc-competencias-conductuales|R")]
        // Provee el catálogo de tipos de puesto para competencias conductuales.
        public async Task<CResult> GetCORR_TIPO_PUESTO_SC_COMPETENCIAS_CONDUCTUALES([FromQuery] PLA_TIPO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/pla-tipo-puesto|C")]
        // Asigna la auditoría de creación y devuelve el resultado del guardado.
        public async Task<IActionResult> Post(PLA_TIPO_PUESTOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/pla-tipo-puesto|U")]
        // Aplica la llave de la consulta y la auditoría antes de actualizar.
        public async Task<IActionResult> Put(PLA_TIPO_PUESTOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(PLA_TIPO_PUESTOTable.CORR_TIPO_PUESTO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/pla-tipo-puesto|D")]
        // Restringe la eliminación a la empresa de la sesión actual.
        public async Task<IActionResult> Delete([FromQuery] PLA_TIPO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/pla-tipo-puesto|U")]
        // Identifica el registro y solicita el cambio de estado en su empresa.
        public async Task<IActionResult> ActivarInactivar(PLA_TIPO_PUESTOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(PLA_TIPO_PUESTOTable.CORR_TIPO_PUESTO));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Lee CORR_EMPRESA del claim del usuario autenticado.
        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Obtiene el login del usuario desde los claims.
        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Completa empresa, usuario, estación y fechas para un registro nuevo.
        private void SetCreateAudit(PLA_TIPO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_TIPO_PUESTO ??= true;
        }

        // Actualiza los datos de auditoría sin reemplazar la información de creación.
        private void SetUpdateAudit(PLA_TIPO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_TIPO_PUESTO.HasValue)
            {
                Data.ESTADO_TIPO_PUESTO = true;
            }
        }
    }
}
