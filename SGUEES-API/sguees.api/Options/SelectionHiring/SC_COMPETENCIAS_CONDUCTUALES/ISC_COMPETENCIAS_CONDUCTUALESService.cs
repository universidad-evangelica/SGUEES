using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
  public interface ISC_COMPETENCIAS_CONDUCTUALESService
  {
    Task<CResult> GetAllAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere);
    Task<CResult> GetAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere);
    Task<CResult> CreateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    Task<CResult> UpdateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    Task<CResult> DeleteAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
  }
}
