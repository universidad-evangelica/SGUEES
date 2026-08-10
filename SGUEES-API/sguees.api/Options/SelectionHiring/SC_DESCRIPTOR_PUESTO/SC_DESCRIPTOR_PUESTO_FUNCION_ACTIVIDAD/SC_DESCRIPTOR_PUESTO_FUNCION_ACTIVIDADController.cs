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
    public class SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADController : ControllerBase
    {
        private readonly ISC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADService _service;

        public SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADController(ISC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        // Obtiene el listado de actividad de la función aplicando los filtros recibidos.
        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetAll([FromQuery] SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Obtiene un registro de actividad de la función con los identificadores recibidos.
        [HttpGet("Get")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> Get([FromQuery] SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        // Consulta el listado de actividad de la función asociado al descriptor.
        [HttpGet("GetCORR_ACTIVIDAD_SC_DESCRIPTOR_PUESTO_FUNCION")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetCORR_ACTIVIDAD_SC_DESCRIPTOR_PUESTO_FUNCION([FromQuery] SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Crea un registro de actividad de la función con la auditoría de la sesión.
        [HttpPost]
        [Authorize(Policy = "/sc-descriptor-puesto|C")]
        public async Task<IActionResult> Post(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data)
        {
            // Completa auditoría de creación y empresa de sesión.
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Actualiza el registro de actividad de la función y su auditoría de modificación.
        [HttpPut]
        [Authorize(Policy = "/sc-descriptor-puesto|U")]
        public async Task<IActionResult> Put(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data)
        {
            // Aplica la llave primaria recibida por query string.
            this.ApplyQueryKeys(Data, nameof(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable.CORR_ACTIVIDAD));
            // Actualiza auditoría de modificación y empresa de sesión.
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Elimina el registro de actividad de la función solicitado para la empresa de la sesión.
        [HttpDelete]
        [Authorize(Policy = "/sc-descriptor-puesto|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data)
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
        private void SetCreateAudit(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data)
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
        private void SetUpdateAudit(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
