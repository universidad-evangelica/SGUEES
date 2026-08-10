// Qué hace: endpoints REST de puestos asignados a unidades (tabla intermedia).
// Cómo: expone GetAll, Get, Post y Delete, llamando a IGEN_UNIDADES_PUESTOService.
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
    // Qué hace: controlador de puestos por unidad.
    // Cómo: expone el CRUD de la asignación unidad-puesto, cada acción protegida con Authorize por política.
    public class GEN_UNIDADES_PUESTOController : ControllerBase
    {
        private readonly IGEN_UNIDADES_PUESTOService _service;

        public GEN_UNIDADES_PUESTOController(IGEN_UNIDADES_PUESTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/gen-unidades-puesto|R")]
        // Qué hace: lista los puestos asignados a unidades.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetAllAsync del servicio (filtra por CORR_UNIDAD si viene).
        public async Task<CResult> GetAll([FromQuery] GEN_UNIDADES_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/gen-unidades-puesto|R")]
        // Qué hace: obtiene una asignación unidad-puesto específica.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetAsync del servicio.
        public async Task<CResult> Get([FromQuery] GEN_UNIDADES_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/gen-unidades-puesto|C")]
        // Qué hace: crea una asignación de puesto a una unidad.
        // Cómo: completa auditoría con SetCreateAudit y llama a CreateAsync del servicio.
        public async Task<IActionResult> Post(GEN_UNIDADES_PUESTOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/gen-unidades-puesto|D")]
        // Qué hace: elimina una asignación de puesto a una unidad.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a DeleteAsync del servicio.
        public async Task<IActionResult> Delete([FromQuery] GEN_UNIDADES_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Qué hace: obtiene CORR_EMPRESA del claim del usuario autenticado.
        // Cómo: busca el claim CORR_EMPRESA y lo parsea a int; si falta, retorna 0.
        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Qué hace: obtiene el identificador de usuario desde los claims.
        // Cómo: lee el claim NameIdentifier del usuario autenticado.
        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Qué hace: completa auditoría de creación y empresa de sesión antes del insert.
        // Cómo: asigna CORR_EMPRESA, usuarios, estaciones y fechas.
        private void SetCreateAudit(GEN_UNIDADES_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
        }
    }
}
