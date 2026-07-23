// Qué hace: endpoints REST del catálogo competencias técnicas.
// Cómo: expone GetAll, Get, GetNextCodigo, lookups de padre y nivel 3, Post, Put, Delete y ActivarInactivar, llamando a ISC_COMPETENCIAS_TECNICASService.
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
    // Qué hace: controlador de competencias técnicas.
    // Cómo: expone el CRUD, lookups jerárquicos y cambio de estado, cada acción protegida con Authorize por política.
    public class SC_COMPETENCIAS_TECNICASController : ControllerBase
    {
        private readonly ISC_COMPETENCIAS_TECNICASService _service;

        public SC_COMPETENCIAS_TECNICASController(ISC_COMPETENCIAS_TECNICASService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        // Qué hace: atiende el listado de competencias técnicas.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetAllAsync del servicio.
        public async Task<CResult> GetAll([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        // Qué hace: atiende la consulta de una competencia técnica puntual.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetAsync del servicio.
        public async Task<CResult> Get([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpGet("GetCORR_COMPETENCIAS_TECNICAS_PADRE_SC_COMPETENCIAS_TECNICAS")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        // Qué hace: provee los posibles padres para construir la jerarquía.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetPadresAsync del servicio.
        public async Task<CResult> GetCORR_COMPETENCIAS_TECNICAS_PADRE_SC_COMPETENCIAS_TECNICAS(
            [FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetPadresAsync(Data);
        }

        [HttpGet("GetCORR_COMPETENCIAS_TECNICAS_NIV3_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        // Qué hace: provee competencias de nivel tres agrupadas para el descriptor de puesto.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetCatalogoNivel3DescriptorAsync del servicio.
        public async Task<CResult> GetCORR_COMPETENCIAS_TECNICAS_NIV3_SC_DESCRIPTOR_PUESTO([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetCatalogoNivel3DescriptorAsync(Data);
        }

        [HttpGet("GetNextCodigo")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        // Qué hace: genera el siguiente código para el padre de nivel 2 indicado.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetNextCodigoAsync del servicio.
        public async Task<CResult> GetNextCodigo([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetNextCodigoAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-competencias-tecnicas|C")]
        // Qué hace: crea una competencia técnica.
        // Cómo: completa la auditoría con SetCreateAudit y llama a CreateAsync del servicio.
        public async Task<IActionResult> Post(SC_COMPETENCIAS_TECNICASTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-competencias-tecnicas|U")]
        // Qué hace: actualiza una competencia técnica.
        // Cómo: aplica las claves de la consulta con ApplyQueryKeys, completa la auditoría con SetUpdateAudit y llama a UpdateAsync del servicio.
        public async Task<IActionResult> Put(SC_COMPETENCIAS_TECNICASTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_COMPETENCIAS_TECNICASTable.CORR_COMPETENCIAS_TECNICAS));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-competencias-tecnicas|D")]
        // Qué hace: elimina una competencia técnica.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a DeleteAsync del servicio.
        public async Task<IActionResult> Delete([FromQuery] SC_COMPETENCIAS_TECNICASTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/sc-competencias-tecnicas|U")]
        // Qué hace: cambia el estado activo/inactivo de la competencia técnica.
        // Cómo: aplica las claves con ApplyQueryKeys, fija CORR_EMPRESA de la sesión y llama a ActivarInactivarAsync del servicio.
        public async Task<IActionResult> ActivarInactivar(SC_COMPETENCIAS_TECNICASTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_COMPETENCIAS_TECNICASTable.CORR_COMPETENCIAS_TECNICAS));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Qué hace: obtiene CORR_EMPRESA del usuario autenticado.
        // Cómo: lee el claim CORR_EMPRESA del contexto de usuario y lo convierte a entero.
        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Qué hace: obtiene el identificador de usuario desde los claims.
        // Cómo: busca el claim ClaimTypes.NameIdentifier en la colección de claims del usuario.
        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Qué hace: completa la auditoría de creación del registro.
        // Cómo: asigna CORR_EMPRESA, usuario, estación, fechas y estado inicial por defecto en true.
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

        // Qué hace: completa la auditoría de actualización del registro.
        // Cómo: asigna CORR_EMPRESA, usuario, estación y fecha de actualización sin modificar los datos de creación.
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
