using System.Collections.Generic;
using eFrameworkAPI.Core.QA;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace sguees.api.Controllers
{
    [ApiController]
    [Route("api/qa/options")]
    [AllowAnonymous] // Público en desarrollo para facilitar pruebas
    public class OptionsQAController : ControllerBase
    {
        private readonly IOptionsQAEvaluator _evaluator;

        public OptionsQAController(IOptionsQAEvaluator evaluator)
        {
            _evaluator = evaluator;
        }

        [HttpPost]
        public ActionResult<IEnumerable<OptionsQAFinding>> Post()
        {
            var findings = _evaluator.Evaluate();
            return Ok(findings);
        }
    }
}
