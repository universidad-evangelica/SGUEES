// Endpoints REST del catálogo requerimiento organizacional.
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
    // Qué hace: expone el CRUD y los lookups de requerimiento organizacional con autorización por política.
    public class SC_REQUERIMIENTO_ORGANIZACIONALController : ControllerBase
    {
        private readonly ISC_REQUERIMIENTO_ORGANIZACIONALService _service;

        public SC_REQUERIMIENTO_ORGANIZACIONALController(ISC_REQUERIMIENTO_ORGANIZACIONALService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetCORR_REQUERIMIENTO_ORGANIZACIONAL_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        // Qué hace: entrega los requerimientos organizacionales activos para el lookup del descriptor de puesto.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetCatalogoDescriptorAsync del servicio.
        public async Task<CResult> GetCORR_REQUERIMIENTO_ORGANIZACIONAL_SC_DESCRIPTOR_PUESTO([FromQuery] SC_REQUERIMIENTO_ORGANIZACIONALParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetCatalogoDescriptorAsync(Data);
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-requerimiento-organizacional|R")]
        // Qué hace: lista los requerimientos organizacionales de la empresa en sesión.
        // Cómo: fija CORR_EMPRESA y llama a GetAllAsync del servicio.
        public async Task<CResult> GetAll([FromQuery] SC_REQUERIMIENTO_ORGANIZACIONALParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-requerimiento-organizacional|R")]
        // Qué hace: obtiene un requerimiento organizacional de la empresa en sesión.
        // Cómo: fija CORR_EMPRESA y llama a GetAsync del servicio.
        public async Task<CResult> Get([FromQuery] SC_REQUERIMIENTO_ORGANIZACIONALParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-requerimiento-organizacional|C")]
        // Qué hace: crea un requerimiento organizacional nuevo.
        // Cómo: completa la auditoría de creación y llama a CreateAsync del servicio.
        public async Task<IActionResult> Post(SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-requerimiento-organizacional|U")]
        // Qué hace: actualiza un requerimiento organizacional existente.
        // Cómo: copia la llave de la URL al cuerpo, completa la auditoría y llama a UpdateAsync del servicio.
        public async Task<IActionResult> Put(SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_REQUERIMIENTO_ORGANIZACIONALTable.CORR_REQUERIMIENTO_ORGANIZACIONAL));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-requerimiento-organizacional|D")]
        // Qué hace: elimina un requerimiento organizacional de la empresa en sesión.
        // Cómo: fija CORR_EMPRESA y llama a DeleteAsync del servicio.
        public async Task<IActionResult> Delete([FromQuery] SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/sc-requerimiento-organizacional|U")]
        // Qué hace: cambia el estado activo/inactivo de un requerimiento organizacional.
        // Cómo: copia la llave de la URL, fija CORR_EMPRESA y llama a ActivarInactivarAsync del servicio.
        public async Task<IActionResult> ActivarInactivar(SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_REQUERIMIENTO_ORGANIZACIONALTable.CORR_REQUERIMIENTO_ORGANIZACIONAL));
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
        // Cómo: fija empresa, usuario, estación y fechas; deja ESTADO_REQUERIMIENTO_ORGANIZACIONAL en true si viene vacío.
        private void SetCreateAudit(SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_REQUERIMIENTO_ORGANIZACIONAL ??= true;
        }

        // Qué hace: completa los datos de auditoría de una actualización.
        // Cómo: fija empresa, usuario, estación y fecha; conserva ESTADO_REQUERIMIENTO_ORGANIZACIONAL o lo deja en true si falta.
        private void SetUpdateAudit(SC_REQUERIMIENTO_ORGANIZACIONALTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_REQUERIMIENTO_ORGANIZACIONAL.HasValue)
            {
                Data.ESTADO_REQUERIMIENTO_ORGANIZACIONAL = true;
            }
        }
    }
}
