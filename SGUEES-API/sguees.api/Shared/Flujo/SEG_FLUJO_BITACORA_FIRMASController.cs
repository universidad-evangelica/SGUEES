using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class SEG_FLUJO_BITACORA_FIRMASController : ControllerBase
    {
        private readonly ISEG_FLUJO_BITACORA_FIRMASService _service;

        public SEG_FLUJO_BITACORA_FIRMASController(ISEG_FLUJO_BITACORA_FIRMASService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetFirmas")]
        [Authorize]
        public async Task<CResult> GetFirmas([FromQuery] SEG_FLUJO_BITACORA_FIRMASParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetFirmasAsync(Data);
        }
    }
}