using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Linq;

namespace sguees.api.Policies
{
    public class HasScopeHandler : AuthorizationHandler<HasScopeRequirement>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, HasScopeRequirement requirement)
        {
            // Verificando si existe el Claim
            string ClaimName;
            if (requirement.PolicyName.Contains("|"))
            {
                ClaimName = requirement.PolicyName.Split("|")[0].ToString();
            }
            else
            {
                ClaimName = requirement.PolicyName;
            }
            
            TrySucceedFromClaim(context, requirement, ClaimName);
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
