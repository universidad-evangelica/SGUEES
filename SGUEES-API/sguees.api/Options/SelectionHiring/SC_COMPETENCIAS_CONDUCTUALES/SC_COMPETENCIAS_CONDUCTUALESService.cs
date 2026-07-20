// Qué hace: lógica de negocio del catálogo competencias conductuales.
// Cómo: valida los datos y llama a ISC_COMPETENCIAS_CONDUCTUALESRepository para ejecutar el CRUD.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
  // Qué hace: servicio de competencias conductuales.
  // Cómo: valida los datos y llama al repositorio para persistir la información.
  public class SC_COMPETENCIAS_CONDUCTUALESService : ISC_COMPETENCIAS_CONDUCTUALESService
  {
    private readonly ISC_COMPETENCIAS_CONDUCTUALESRepository _repo;

    public SC_COMPETENCIAS_CONDUCTUALESService(ISC_COMPETENCIAS_CONDUCTUALESRepository repo)
    {
      _repo = repo;
    }

    // Qué hace: obtiene el listado de competencias conductuales.
    // Cómo: llama a GetAllAsync del repositorio con los parámetros armados por BuildParameters.
    public async Task<CResult> GetAllAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere)
    {
      return await _repo.GetAllAsync(BuildParameters(xWhere));
    }

    // Qué hace: obtiene una competencia conductual puntual.
    // Cómo: llama a GetAsync del repositorio filtrando por CORR_EMPRESA y CORR_COMPETENCIAS_CONDUCTUALES.
    public async Task<CResult> GetAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere)
    {
      var p = new List<CParameter>
      {
        new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
        new CParameter() { ParameterName = "CORR_COMPETENCIAS_CONDUCTUALES", Value = xWhere.CORR_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
      };

      return await _repo.GetAsync(p);
    }

    // Qué hace: crea una competencia conductual.
    // Cómo: valida la empresa de sesión y los datos con ValidateEmpresaSesion y Validate, normaliza con NormalizeData y llama a CreateAsync del repositorio.
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

    // Qué hace: actualiza una competencia conductual.
    // Cómo: valida la empresa de sesión, los datos y el CORR_COMPETENCIAS_CONDUCTUALES a actualizar, normaliza con NormalizeData y llama a UpdateAsync del repositorio.
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

    // Qué hace: elimina una competencia conductual.
    // Cómo: valida la empresa de sesión con ValidateEmpresaSesion y llama a DeleteAsync del repositorio.
    public async Task<CResult> DeleteAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
    {
      var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
      if (empresaError != null)
      {
        return empresaError;
      }

      return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
    }

    // Qué hace: cambia el estado activo/inactivo de una competencia conductual.
    // Cómo: valida la empresa de sesión y el CORR_COMPETENCIAS_CONDUCTUALES a actualizar, y llama a ActivarInactivarAsync del repositorio.
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

    // Qué hace: arma los parámetros de filtro para el repositorio.
    // Cómo: construye la lista con CORR_EMPRESA a partir de xWhere.
    private static List<CParameter> BuildParameters(SC_COMPETENCIAS_CONDUCTUALESParam xWhere)
    {
      return new List<CParameter>
      {
        new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
      };
    }

    // Qué hace: normaliza los datos antes de guardar.
    // Cómo: recorta espacios de NOMBRE_COMPETENCIAS_CONDUCTUALES y DESCRIPCION, y aplica ESTADO_COMPETENCIAS_CONDUCTUALES activo cuando no viene informado.
    private static void NormalizeData(SC_COMPETENCIAS_CONDUCTUALESTable Data)
    {
      Data.NOMBRE_COMPETENCIAS_CONDUCTUALES = Data.NOMBRE_COMPETENCIAS_CONDUCTUALES?.Trim();
      Data.DESCRIPCION = Data.DESCRIPCION?.Trim();
      Data.ESTADO_COMPETENCIAS_CONDUCTUALES ??= true;
    }

    // Qué hace: valida los datos obligatorios de la competencia conductual.
    // Cómo: comprueba que Data no sea nulo, que CORR_TIPO_PUESTO sea válido, y que NOMBRE_COMPETENCIAS_CONDUCTUALES y DESCRIPCION no estén vacíos ni superen sus límites.
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

    // Qué hace: obtiene las competencias conductuales activas para el descriptor de puesto.
    // Cómo: llama a GetCatalogoDescriptorAsync del repositorio filtrando por CORR_EMPRESA y arma el CResult con el listado.
    public async Task<CResult> GetCatalogoDescriptorAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere)
    {
      var rows = await _repo.GetCatalogoDescriptorAsync(xWhere.CORR_EMPRESA);
      return new CResult
      {
        Data = rows,
        Result = true,
        CodeHelper = 0,
        ErrorCode = 0,
        ErrorMessage = "",
        ErrorSource = "",
        RowsAffected = rows.Count,
      };
    }

    // Qué hace: verifica que exista empresa en la sesión.
    // Cómo: si corrEmpresa es mayor a cero devuelve null; de lo contrario devuelve un CResult con el error de empresa no asignada.
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

    // Qué hace: construye un resultado de error de validación.
    // Cómo: arma un CResult con Result en false y el mensaje recibido.
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
