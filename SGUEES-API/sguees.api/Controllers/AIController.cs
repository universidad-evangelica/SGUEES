using Microsoft.AspNetCore.Mvc;
using eFrameworkAPI.Core.AI;

namespace sguees.api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly IAIModelRouter _router;
        private readonly IAIProvider _provider;

        public AIController(IAIModelRouter router, IAIProvider provider)
        {
            _router = router;
            _provider = provider;
        }

        public class CompleteRequest
        {
            public string? Prompt { get; set; }
            public string? Model { get; set; } // opcional, sobreescribe el default
        }

        [HttpPost("complete")]
        public async Task<IActionResult> Complete([FromBody] CompleteRequest request)
        {
            var requestedModel = request.Model;
            // Permitir también por header (sobrescribe lo del body si viene)
            if (Request.Headers.TryGetValue("X-AI-Model", out var headerModel) && !string.IsNullOrWhiteSpace(headerModel))
            {
                requestedModel = headerModel!;
            }

            var model = _router.ResolveModel(requestedModel);
            var prompt = request.Prompt ?? string.Empty;
            var result = await _provider.CompleteAsync(model, prompt, HttpContext.RequestAborted);
            return Ok(new { model, result });
        }
    }
}
