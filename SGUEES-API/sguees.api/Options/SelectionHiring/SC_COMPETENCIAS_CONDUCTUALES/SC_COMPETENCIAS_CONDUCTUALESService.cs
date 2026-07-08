using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
  public class SC_COMPETENCIAS_CONDUCTUALESService : ISC_COMPETENCIAS_CONDUCTUALESService
  {
    private readonly ISC_COMPETENCIAS_CONDUCTUALESRepository _repo;

    public SC_COMPETENCIAS_CONDUCTUALESService(ISC_COMPETENCIAS_CONDUCTUALESRepository repo)
    {
      _repo = repo;
    }

    public async Task<CResult> GetAllAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere)
    {
      return await _repo.GetAllAsync(BuildParameters(xWhere));
    }

    public async Task<CResult> GetAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere)
    {
      var p = new List<CParameter>
      {
        new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
        new CParameter() { ParameterName = "CORR_COMPETENCIAS_CONDUCTUALES", Value = xWhere.CORR_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
      };

      return await _repo.GetAsync(p);
    }

    public async Task<CResult> CreateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
    {
      var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
      if (empresaError != null)
      {
        return empresaError;
      }

      var validation = Validate(Data);
      if (validation != null)
      {
        return validation;
      }

      NormalizeData(Data);
      return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
    }

    public async Task<CResult> UpdateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
    {
      var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
      if (empresaError != null)
      {
        return empresaError;
      }

      var validation = Validate(Data);
      if (validation != null)
      {
        return validation;
      }

      if (Data.CORR_COMPETENCIAS_CONDUCTUALES <= 0)
      {
        return ValidationError("No se pudo identificar la competencia conductual a actualizar.");
      }

      NormalizeData(Data);
      return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
    }

    public async Task<CResult> DeleteAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
    {
      var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
      if (empresaError != null)
      {
        return empresaError;
      }

      return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
    }

    public async Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
    {
      var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
      if (empresaError != null)
      {
        return empresaError;
      }

      if (Data.CORR_COMPETENCIAS_CONDUCTUALES <= 0)
      {
        return ValidationError("No se pudo identificar la competencia conductual a actualizar.");
      }

      return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
    }

    private static List<CParameter> BuildParameters(SC_COMPETENCIAS_CONDUCTUALESParam xWhere)
    {
      return new List<CParameter>
      {
        new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
      };
    }

    private static void NormalizeData(SC_COMPETENCIAS_CONDUCTUALESTable Data)
    {
      Data.NOMBRE_COMPETENCIAS_CONDUCTUALES = Data.NOMBRE_COMPETENCIAS_CONDUCTUALES?.Trim();
      Data.DESCRIPCION = Data.DESCRIPCION?.Trim();
      Data.ESTADO_COMPETENCIAS_CONDUCTUALES ??= true;
    }

    private static CResult Validate(SC_COMPETENCIAS_CONDUCTUALESTable Data)
    {
      if (Data == null)
      {
        return ValidationError("No se recibieron datos de la competencia conductual.");
      }

      if (!Data.CORR_TIPO_PUESTO.HasValue || Data.CORR_TIPO_PUESTO.Value <= 0)
      {
        return ValidationError("Debe seleccionar el tipo de puesto.");
      }

      if (string.IsNullOrWhiteSpace(Data.NOMBRE_COMPETENCIAS_CONDUCTUALES))
      {
        return ValidationError("Debe ingresar el nombre de la competencia conductual.");
      }

      if (Data.NOMBRE_COMPETENCIAS_CONDUCTUALES.Trim().Length > 150)
      {
        return ValidationError("El nombre de la competencia conductual no puede superar 150 caracteres.");
      }

      if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
      {
        return ValidationError("Debe ingresar la descripcion de la competencia conductual.");
      }

      if (Data.DESCRIPCION.Trim().Length > 500)
      {
        return ValidationError("La descripcion no puede superar 500 caracteres.");
      }

      return null;
    }

    private static CResult ValidateEmpresaSesion(int corrEmpresa)
    {
      if (corrEmpresa > 0)
      {
        return null;
      }

      return new CResult
      {
        Data = null,
        Result = false,
        CodeHelper = 0,
        ErrorCode = 4100,
        ErrorMessage = "No se pudo guardar la competencia conductual porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
        ErrorSource = "[SC_COMPETENCIAS_CONDUCTUALESService]",
        RowsAffected = 0
      };
    }

    private static CResult ValidationError(string message)
    {
      return new CResult
      {
        Data = null,
        Result = false,
        CodeHelper = 0,
        ErrorCode = -1,
        ErrorMessage = message,
        ErrorSource = "[SC_COMPETENCIAS_CONDUCTUALESService]",
        RowsAffected = 0
      };
    }
  }
}
