using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: datos de períodos académicos que consumen otras pantallas.
    // Cómo lo hace: hoy solo expone el combo de ciclos de la consulta de prospectos
    //               (GetCICLO_ACA_PROSPECTO); el resto del CRUD queda sin habilitar.
    public class ACA_PERIODOS_ACADEMICOSRepository : BaseRepository<ACA_PERIODOS_ACADEMICOSTable>, IACA_PERIODOS_ACADEMICOSRepository
    {
        private const string _TableName = "ACA_PERIODOS_ACADEMICOS";
        private const string _ViewCiclo = "V_ACA_PROSPECTO_CICLO";

        public ACA_PERIODOS_ACADEMICOSRepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: ciclos de pregrado para el combo de la consulta de prospectos.
        // Cómo lo hace: lee V_ACA_PROSPECTO_CICLO, el más reciente primero; ES_CICLO_DEFECTO
        //               indica cuál seleccionar al abrir la pantalla.
        public async Task<CResult> GetCICLO_ACA_PROSPECTOAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewCiclo, xWhere, "CLAVE_CICLO DESC");
                var response = new List<ACA_PERIODOS_ACADEMICOS_CICLOView>().FromDataReader(reader).ToList();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response.Count;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: consulta general y CRUD de períodos aún no habilitados.
        // Cómo lo hace: IRepository exige los métodos; responden un error claro hasta que
        //               exista una pantalla propia de períodos académicos.
        public Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> CreateAsync(ACA_PERIODOS_ACADEMICOSTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> UpdateAsync(ACA_PERIODOS_ACADEMICOSTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> DeleteAsync(ACA_PERIODOS_ACADEMICOSTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        private static CResult OperacionNoHabilitada()
        {
            return new CResult()
            {
                Data = null,
                Result = false,
                RowsAffected = 0,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = $"Operación no habilitada: {_TableName} solo expone GetCICLO_ACA_PROSPECTO.",
                ErrorSource = ""
            };
        }
    }
}
