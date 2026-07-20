// Qué hace: endpoints REST del catálogo frecuencia.
// Cómo: expone GetAll, Get, Post, Put, Delete y ActivarInactivar, llamando a ISC_FRECUENCIAService.
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
    // Qué hace: controlador de frecuencia.
    // Cómo: expone el CRUD y el lookup de frecuencias activas, cada acción protegida con Authorize por política.
    public class SC_FRECUENCIAController : ControllerBase
    {
        private readonly ISC_FRECUENCIAService _service;

        public SC_FRECUENCIAController(ISC_FRECUENCIAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-frecuencia|R")]
        // Qué hace: atiende el listado de frecuencias.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetAllAsync del servicio.
        public async Task<CResult> GetAll([FromQuery] SC_FRECUENCIAParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-frecuencia|R")]
        // Qué hace: atiende la consulta de una frecuencia puntual.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetAsync del servicio.
        public async Task<CResult> Get([FromQuery] SC_FRECUENCIAParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpGet("GetCORR_FRECUENCIA_SC_DESCRIPTOR_KPI_FUNCION")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        // Qué hace: provee frecuencias activas para los indicadores del descriptor de puesto.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetFrecuenciasActivasAsync del servicio.
        public async Task<CResult> GetCORR_FRECUENCIA_SC_DESCRIPTOR_KPI_FUNCION([FromQuery] SC_FRECUENCIAParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetFrecuenciasActivasAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-frecuencia|C")]
        // Qué hace: crea una frecuencia.
        // Cómo: completa la auditoría con SetCreateAudit y llama a CreateAsync del servicio.
        public async Task<IActionResult> Post(SC_FRECUENCIATable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-frecuencia|U")]
        // Qué hace: actualiza una frecuencia.
        // Cómo: aplica las claves de la consulta con ApplyQueryKeys, completa la auditoría con SetUpdateAudit y llama a UpdateAsync del servicio.
        public async Task<IActionResult> Put(SC_FRECUENCIATable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_FRECUENCIATable.CORR_FRECUENCIA));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-frecuencia|D")]
        // Qué hace: elimina una frecuencia.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a DeleteAsync del servicio.
        public async Task<IActionResult> Delete([FromQuery] SC_FRECUENCIATable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/sc-frecuencia|U")]
        // Qué hace: cambia el estado activo/inactivo de una frecuencia.
        // Cómo: aplica las claves de la consulta, fija CORR_EMPRESA de la sesión y llama a ActivarInactivarAsync del servicio.
        public async Task<IActionResult> ActivarInactivar(SC_FRECUENCIATable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_FRECUENCIATable.CORR_FRECUENCIA));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Qué hace: obtiene la empresa de la sesión.
        // Cómo: lee el claim CORR_EMPRESA del usuario autenticado.
        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Qué hace: obtiene el usuario de la sesión.
        // Cómo: lee el claim NameIdentifier del usuario autenticado.
        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Qué hace: completa la auditoría de creación.
        // Cómo: fija CORR_EMPRESA, usuario, estación y fechas de creación/actualización, y aplica ESTADO_FRECUENCIA activo por defecto.
        private void SetCreateAudit(SC_FRECUENCIATable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_FRECUENCIA ??= true;
        }

        // Qué hace: completa la auditoría de actualización.
        // Cómo: fija CORR_EMPRESA, usuario, estación y fecha de actualización, y aplica ESTADO_FRECUENCIA activo si no viene informado.
        private void SetUpdateAudit(SC_FRECUENCIATable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_FRECUENCIA.HasValue)
            {
                Data.ESTADO_FRECUENCIA = true;
            }
        }
    }
}
