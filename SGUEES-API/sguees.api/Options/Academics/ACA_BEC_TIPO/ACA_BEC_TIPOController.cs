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
    public class ACA_BEC_TIPOController : ControllerBase
    {
        private readonly IACA_BEC_TIPOService _service;

        public ACA_BEC_TIPOController(IACA_BEC_TIPOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-bec-tipo|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_BEC_TIPOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-bec-tipo|R")]
        public async Task<CResult> Get([FromQuery] ACA_BEC_TIPOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpGet("Origenes")]
        [Authorize(Policy = "/aca-bec-tipo|R")]
        public async Task<CResult> Origenes()
        {
            return await _service.GetOrigenesAsync(GetCorrEmpresa());
        }

        [HttpGet("Convenios")]
        [Authorize(Policy = "/aca-bec-tipo|R")]
        public async Task<CResult> Convenios()
        {
            return await _service.GetConveniosAsync(GetCorrEmpresa());
        }

        [HttpPost]
        [Authorize(Policy = "/aca-bec-tipo|C")]
        public async Task<IActionResult> Post(ACA_BEC_TIPOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/aca-bec-tipo|U")]
        public async Task<IActionResult> Put(ACA_BEC_TIPOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_BEC_TIPOTable.CORR_BECA));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/aca-bec-tipo|D")]
        public async Task<IActionResult> Delete([FromQuery] ACA_BEC_TIPOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/aca-bec-tipo|U")]
        public async Task<IActionResult> ActivarInactivar(ACA_BEC_TIPOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_BEC_TIPOTable.CORR_BECA));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }


        [HttpGet("Cuestionarios")][Authorize(Policy="/aca-bec-tipo|R")]
        public Task<CResult> Cuestionarios()=>_service.CuestionariosAsync(GetCorrEmpresa());
        [HttpGet("PlantillasFormulario")][Authorize(Policy="/aca-bec-tipo|R")]
        public Task<CResult> PlantillasFormulario()=>_service.PlantillasFormularioAsync(GetCorrEmpresa());
        [HttpGet("Formularios")][Authorize(Policy="/aca-bec-tipo|R")]
        public Task<CResult> Formularios()=>_service.FormulariosAsync(GetCorrEmpresa());
        [HttpGet("Versiones")][Authorize(Policy="/aca-bec-tipo|R")]
        public Task<CResult> Versiones()=>_service.VersionesAsync(GetCorrEmpresa());
        [HttpGet("Asignaciones")][Authorize(Policy="/aca-bec-tipo|R")]
        public Task<CResult> Asignaciones([FromQuery]int CORR_BECA)=>_service.AsignacionesAsync(GetCorrEmpresa(),CORR_BECA);
        [HttpGet("CiclosFormulario")][Authorize(Policy="/aca-bec-tipo|R")]
        public Task<CResult> CiclosFormulario()=>_service.CiclosFormularioAsync(GetCorrEmpresa());
        [HttpPost("CrearFormulario")][Authorize(Policy="/aca-bec-tipo|C")]
        public Task<IActionResult> CrearFormulario(BecaFormularioCambio data)=>GuardarConfiguracion("CREAR_FORMULARIO",data);
        [HttpPost("EditarFormulario")][Authorize(Policy="/aca-bec-tipo|U")]
        public Task<IActionResult> EditarFormulario(BecaFormularioCambio data)=>GuardarConfiguracion("EDITAR_FORMULARIO",data);
        [HttpPost("CrearVersion")][Authorize(Policy="/aca-bec-tipo|C")]
        public Task<IActionResult> CrearVersion(BecaFormularioCambio data)=>GuardarConfiguracion("CREAR_VERSION",data);
        [HttpPost("EditarVersion")][Authorize(Policy="/aca-bec-tipo|U")]
        public Task<IActionResult> EditarVersion(BecaFormularioCambio data)=>GuardarConfiguracion("EDITAR_VERSION",data);
        [HttpPost("PublicarVersion")][Authorize(Policy="/aca-bec-tipo|U")]
        public Task<IActionResult> PublicarVersion(BecaFormularioCambio data)=>GuardarConfiguracion("PUBLICAR",data);
        [HttpPost("ReabrirVersion")][Authorize(Policy="/aca-bec-tipo|U")]
        public Task<IActionResult> ReabrirVersion(BecaFormularioCambio data)=>GuardarConfiguracion("REABRIR",data);
        [HttpPost("AsignarVersion")][Authorize(Policy="/aca-bec-tipo|U")]
        public Task<IActionResult> AsignarVersion(BecaFormularioCambio data)=>GuardarConfiguracion("ASIGNAR",data);
        [HttpPost("RetirarAsignacion")][Authorize(Policy="/aca-bec-tipo|U")]
        public Task<IActionResult> RetirarAsignacion(BecaFormularioCambio data)=>GuardarConfiguracion("RETIRAR",data);
        private async Task<IActionResult> GuardarConfiguracion(string operacion,BecaFormularioCambio data) {
            if(data==null)return BadRequest();
            data.CORR_EMPRESA=GetCorrEmpresa();
            var result=await _service.GuardarFormularioAsync(operacion,data,GetUsuario(),ClientInfoHelper.GetClientStation(HttpContext));
            return result.ErrorCode==0?Ok(result):BadRequest(result);
        }

        [HttpPost("CrearFormularioVacio")][Authorize(Policy="/aca-bec-tipo|C")]
        public Task<IActionResult> CrearFormularioVacio(BecaFormularioCambio data)=>GuardarConfiguracion("CREAR_DESDE_CERO",data);
        [HttpGet("ContenidoCuestionario")][Authorize(Policy="/aca-bec-tipo|R")]
        public Task<CResult> ContenidoCuestionario([FromQuery]int CORR_BECA,[FromQuery]int CORR_FORMULARIO_VERSION)=>_service.ContenidoCuestionarioAsync(GetCorrEmpresa(),CORR_BECA,CORR_FORMULARIO_VERSION);
        [HttpPost("AgregarElemento")][Authorize(Policy="/aca-bec-tipo|C")]
        public Task<IActionResult> AgregarElemento(BecaCuestionarioCambio data)=>GuardarElemento("AGREGAR",data);
        [HttpPost("EditarElemento")][Authorize(Policy="/aca-bec-tipo|U")]
        public Task<IActionResult> EditarElemento(BecaCuestionarioCambio data)=>GuardarElemento("EDITAR",data);
        [HttpPost("QuitarElemento")][Authorize(Policy="/aca-bec-tipo|D")]
        public Task<IActionResult> QuitarElemento(BecaCuestionarioCambio data)=>GuardarElemento("QUITAR",data);
        private async Task<IActionResult> GuardarElemento(string operacion,BecaCuestionarioCambio data) {
            if(data==null)return BadRequest();
            data.CORR_EMPRESA=GetCorrEmpresa();
            var result=await _service.GuardarCuestionarioAsync(operacion,data,GetUsuario(),ClientInfoHelper.GetClientStation(HttpContext));
            return result.ErrorCode==0?Ok(result):BadRequest(result);
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

        private void SetCreateAudit(ACA_BEC_TIPOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_BECA = string.IsNullOrWhiteSpace(Data.ESTADO_BECA) ? "ACTIVA" : Data.ESTADO_BECA;
        }

        private void SetUpdateAudit(ACA_BEC_TIPOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            Data.ESTADO_BECA = string.IsNullOrWhiteSpace(Data.ESTADO_BECA) ? "ACTIVA" : Data.ESTADO_BECA;
        }
    }
}
