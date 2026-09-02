using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace sguees.api.Policies
{
    public class HasScopeHandler : AuthorizationHandler<HasScopeRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, HasScopeRequirement requirement)
        {
            // Claim(s): "/ruta|R" o "/ruta-a,/ruta-b|R" (OR entre rutas, misma acción).
            string claimPart;
            if (requirement.PolicyName.Contains("|"))
            {
                claimPart = requirement.PolicyName.Split("|")[0];
            }
            else
            {
                claimPart = requirement.PolicyName;
            }

            foreach (var claimName in claimPart.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                if (TrySucceedFromClaim(context, requirement, claimName))
                {
                    break;
                }
            }

            return Task.CompletedTask;
        }

        private static bool TrySucceedFromClaim(
            AuthorizationHandlerContext context,
            HasScopeRequirement requirement,
            string claimName)
        {
            if (!context.User.HasClaim(c => c.Type == claimName))
                return false;

            var scopes = context.User.FindFirst(c => c.Type == claimName)?.Value ?? string.Empty;
            if (scopes.Contains(requirement.PolicyValue))
            {
                context.Succeed(requirement);
                return true;
            }

            return false;
        }
    }
}
