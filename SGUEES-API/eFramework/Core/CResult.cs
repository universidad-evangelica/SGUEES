namespace eFramework.Core
{
    public class CResult
    {
        public decimal ErrorCode { get; set; }
        public string ErrorMessage { get; set; }
        public string ErrorSource { get; set; }        
        public bool Result { get; set; }
        public object CodeHelper { get; set; }
        public int RowsAffected { get; set; }
        public object Data { get; set; }

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
