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
    public class ACA_BEC_ENTIDAD_FINANCIADORAController : ControllerBase
    {
        private readonly IACA_BEC_ENTIDAD_FINANCIADORAService _service;

        public ACA_BEC_ENTIDAD_FINANCIADORAController(IACA_BEC_ENTIDAD_FINANCIADORAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-bec-entidad-financiadora|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_BEC_ENTIDAD_FINANCIADORAParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-bec-entidad-financiadora|R")]
        public async Task<CResult> Get([FromQuery] ACA_BEC_ENTIDAD_FINANCIADORAParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/aca-bec-entidad-financiadora|C")]
        public async Task<IActionResult> Post(ACA_BEC_ENTIDAD_FINANCIADORATable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/aca-bec-entidad-financiadora|U")]
        public async Task<IActionResult> Put(ACA_BEC_ENTIDAD_FINANCIADORATable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_BEC_ENTIDAD_FINANCIADORATable.CORR_ENTIDAD_FINANCIADORA));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/aca-bec-entidad-financiadora|D")]
        public async Task<IActionResult> Delete([FromQuery] ACA_BEC_ENTIDAD_FINANCIADORATable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/aca-bec-entidad-financiadora|U")]
        public async Task<IActionResult> ActivarInactivar(ACA_BEC_ENTIDAD_FINANCIADORATable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_BEC_ENTIDAD_FINANCIADORATable.CORR_ENTIDAD_FINANCIADORA));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
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

        private void SetCreateAudit(ACA_BEC_ENTIDAD_FINANCIADORATable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ACTIVO = true;
        }

        private void SetUpdateAudit(ACA_BEC_ENTIDAD_FINANCIADORATable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}

