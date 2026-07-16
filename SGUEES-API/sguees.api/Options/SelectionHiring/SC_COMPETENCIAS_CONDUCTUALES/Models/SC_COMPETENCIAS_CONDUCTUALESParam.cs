using eFramework.Data;

namespace SGUEES.Models
{
  public class SC_COMPETENCIAS_CONDUCTUALESParam : BaseParam
  {
    public int CORR_EMPRESA { get; set; }
    public int CORR_COMPETENCIAS_CONDUCTUALES { get; set; }
    public int PAGE { get; set; } = 1;
    public int PAGE_SIZE { get; set; } = 10;
    public string SORT_FIELD { get; set; }
    public bool? SORT_DESC { get; set; }
  }
}
