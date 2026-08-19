using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class SC_REQUISICION_PERSONALController: ControllerBase
    {
        private readonly ISC_REQUISICION_PERSONALService _service;
        
        public SC_REQUISICION_PERSONALController(ISC_REQUISICION_PERSONALService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-requisicion-personal|R")]
        public async Task<CResult> GetAll([FromQuery] SC_REQUISICION_PERSONALParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-requisicion-personal|R")]
        public async Task<CResult> Get([FromQuery] SC_REQUISICION_PERSONALParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-requisicion-personal|C")]
        public async Task<IActionResult> Post(SC_REQUISICION_PERSONALTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

            Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;

            var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            if (resultado.ErrorCode == 0)
            {
                return StatusCode(201, resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }

        [HttpPut]
        [Authorize(Policy = "/sc-requisicion-personal|U")]
        public async Task<IActionResult> Put(SC_REQUISICION_PERSONALTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            if (resultado.ErrorCode == 0)
            {
                return StatusCode(201, resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-requisicion-personal|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_REQUISICION_PERSONALTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            if (resultado.ErrorCode == 0)
            {
                return Ok(resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }

        //Funcion para traerme la data de SEG_FLUJO_BITACORA
        [HttpGet("GetCORR_BITACORA_SC_REQUISICION_PERSONAL")]
        [Authorize(Policy = "/sc-requisicion-personal|R")]
        public async Task<CResult> GetCORR_BITACORA_SC_REQUISICION_PERSONAL([FromQuery] SC_REQUISICION_PERSONAL_BITACORAParam Data)
        {
            Data.CORR_TIPO_DOCUMENTO = 101 ;

            return await _service.GetAllAsyncBitacoraByCORR_REQUISICION(Data);
        }

        /// <summary>
        /// Listado para modal en sc-solicitud-empleo (permiso del consumidor, no de requisición).
        /// </summary>
        [HttpGet("GetAll_SC_SOLICITUD_EMPLEO")]
        [Authorize(Policy = "/sc-solicitud-empleo|R")]
        public async Task<CResult> GetAll_SC_SOLICITUD_EMPLEO([FromQuery] SC_REQUISICION_PERSONALParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllForSolicitudEmpleoAsync(Data);
        }
    }
}
