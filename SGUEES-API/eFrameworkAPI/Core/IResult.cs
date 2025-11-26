using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eFrameworkAPI.Core
{
    public interface IResult
    {
        decimal ErrorCode { get; set; }
        string ErrorMessage { get; set; }
        string ErrorSource { get; set; }
        bool Result { get; set; }
        object CodeHelper { get; set; }
        int RowsAffected { get; set; }
    }
}
