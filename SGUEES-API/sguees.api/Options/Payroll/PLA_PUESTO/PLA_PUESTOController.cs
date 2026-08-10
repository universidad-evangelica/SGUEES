// Qué hace: endpoints REST del catálogo de puestos (PLA_PUESTO).
// Cómo: expone GetAll, Get, Post, Put, Delete y ActivarInactivar vía IPLA_PUESTOService.
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
    public class PLA_PUESTOController : ControllerBase
    {
        private readonly IPLA_PUESTOService _service;

        public PLA_PUESTOController(IPLA_PUESTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/pla-puesto|R")]
        // Qué hace: lista los puestos de la empresa en sesión.
        // Cómo: fija CORR_EMPRESA y llama a GetAllAsync del servicio.
        public async Task<CResult> GetAll([FromQuery] PLA_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/pla-puesto|R")]
        // Qué hace: obtiene un puesto de la empresa en sesión.
        // Cómo: fija CORR_EMPRESA y llama a GetAsync del servicio.
        public async Task<CResult> Get([FromQuery] PLA_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/pla-puesto|C")]
        // Qué hace: crea un puesto nuevo.
        // Cómo: completa auditoría con SetCreateAudit y llama a CreateAsync.
        public async Task<IActionResult> Post(PLA_PUESTOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/pla-puesto|U")]
        // Qué hace: actualiza un puesto existente.
        // Cómo: aplica CORR_PUESTO de query, completa auditoría y llama a UpdateAsync.
        public async Task<IActionResult> Put(PLA_PUESTOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(PLA_PUESTOTable.CORR_PUESTO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/pla-puesto|D")]
        // Qué hace: elimina un puesto.
        // Cómo: fija CORR_EMPRESA y llama a DeleteAsync del servicio.
        public async Task<IActionResult> Delete([FromQuery] PLA_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/pla-puesto|U")]
        // Qué hace: cambia el estado activo/inactivo del puesto.
        // Cómo: aplica llave de query, fija CORR_EMPRESA y llama a ActivarInactivarAsync.
        public async Task<IActionResult> ActivarInactivar(PLA_PUESTOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(PLA_PUESTOTable.CORR_PUESTO));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Qué hace: entrega puestos para el lookup de asignación a unidades.
        // Cómo: fija CORR_EMPRESA de sesión y llama GetAllAsync (autorizado para gen-unidades-puesto).
        [HttpGet("GetCORR_PUESTO_GEN_UNIDADES_PUESTO")]
        [Authorize(Policy = "/gen-unidades-puesto|R")]
        public async Task<CResult> GetCORR_PUESTO_GEN_UNIDADES_PUESTO([FromQuery] PLA_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        private void SetCreateAudit(PLA_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_PUESTO ??= true;
            Data.APROBACION_PUESTO ??= false;
        }

        private void SetUpdateAudit(PLA_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_PUESTO.HasValue)
            {
                Data.ESTADO_PUESTO = true;
            }
            if (!Data.APROBACION_PUESTO.HasValue)
            {
                Data.APROBACION_PUESTO = false;
            }
        }
    }
}
