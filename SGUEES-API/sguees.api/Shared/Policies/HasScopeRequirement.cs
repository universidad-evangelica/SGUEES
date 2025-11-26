using System;
using Microsoft.AspNetCore.Authorization;

namespace scuees.api.Policies
{
    public class HasScopeRequirement : IAuthorizationRequirement
    {        
        public string PolicyName { get; }
        public string PolicyValue { get; }

        public HasScopeRequirement(string policyName, string policyValue)
        {
            PolicyName = policyName ?? throw new ArgumentNullException(nameof(policyName));
            PolicyValue = policyValue ?? throw new ArgumentNullException(nameof(policyValue));
        }
    }
}
