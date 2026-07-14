using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace sguees.api.Policies
{
    public class AuthorizationPolicyProvider : DefaultAuthorizationPolicyProvider
    {
        private readonly AuthorizationOptions _options;
        private readonly object _policyLock = new();

        public AuthorizationPolicyProvider(IOptions<AuthorizationOptions> options) : base(options)
        {
            _options = options.Value;
        }

        public override async Task<AuthorizationPolicy> GetPolicyAsync(string policyName)
        {
            var policy = await base.GetPolicyAsync(policyName);

            if (policy != null)
            {
                return policy;
            }

            lock (_policyLock)
            {
                policy = _options.GetPolicy(policyName);
                if (policy != null)
                {
                    return policy;
                }

                var policyValue = policyName.Contains('|')
                    ? policyName.Split('|')[1]
                    : "R";

                var policyNew = new AuthorizationPolicyBuilder();
                policyNew.AddRequirements(new HasScopeRequirement(policyName, policyValue));
                policy = policyNew.Build();
                _options.AddPolicy(policyName, policy);
            }

            return policy;
        }
    }
}
