using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace sguees.api.Policies
{
    public class AuthorizationPolicyProvider : DefaultAuthorizationPolicyProvider
    {
        private readonly AuthorizationOptions _options;

        public AuthorizationPolicyProvider(IOptions<AuthorizationOptions> options) : base(options)
        {
            _options = options.Value;
        }

        public override async Task<AuthorizationPolicy> GetPolicyAsync(string policyName)
        {

            // Check static policies first
            var policy = await base.GetPolicyAsync(policyName);
            
            if (policy == null)
            {
                string policyValue;
                if (policyName.Contains("|"))
                {
                    policyValue = policyName.Split("|")[1].ToString();
                }
                else
                {
                    policyValue = "R";
                }
                
                var policyNew = new AuthorizationPolicyBuilder();
                policyNew.AddRequirements(new HasScopeRequirement(policyName, policyValue));
                policy = await Task.FromResult(policyNew.Build());

                // Add policy to the AuthorizationOptions, so we don't have to re-create it each time
                try {
                    await AddPolicyAsync(policyName, policy);
                }
                catch (NullReferenceException ex) {
                    Console.Write(ex);
                }                
            }
         
            return policy;
        }

        private async Task AddPolicyAsync(string policyName, AuthorizationPolicy policy) 
        {
            await Task.Run(() => {_options.AddPolicy(policyName, policy);});
        }
    }
}
