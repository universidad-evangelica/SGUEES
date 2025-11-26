using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Linq;

namespace scuees.api.Policies
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
            
            if (!context.User.HasClaim(c => c.Type == ClaimName))
                return Task.CompletedTask;

            // Obteniendo el Claim para verificar si existe el permiso a verificar
            var scopes = context.User.FindFirst(c => c.Type == ClaimName).Value;

            // Succeed si el permiso se encuentra en el Claim
            if (scopes.Contains(requirement.PolicyValue))
                context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }
}
