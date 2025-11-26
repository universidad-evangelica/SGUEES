using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eFrameworkAPI.Core
{
    public class CResult<TData>: IResult
    {
        public decimal ErrorCode { get; set; }
        public string ErrorMessage { get; set; }
        public string ErrorSource { get; set; }
        public bool Result { get; set; }
        public object CodeHelper { get; set; }
        public int RowsAffected { get; set; }
        public TData Data { get; set; }

        public CResult()
        {
            ErrorCode = 0;
            ErrorSource = "";
            ErrorMessage = "";
            RowsAffected = 0;
            CodeHelper = 0;
            Result = false;
        }
    }
}
