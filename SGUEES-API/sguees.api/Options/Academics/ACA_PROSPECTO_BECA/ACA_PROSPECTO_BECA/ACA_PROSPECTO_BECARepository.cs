using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: lectura del encabezado de la solicitud de beca.
    // Cómo lo hace: V_ACA_PROSPECTO_BECA_CONSULTA. Insert, update y delete aún no escriben.
    public class ACA_PROSPECTO_BECARepository : BaseRepository<ACA_PROSPECTO_BECATable>, IACA_PROSPECTO_BECARepository
    {
        private const string _TableName = "ACA_PROSPECTO_BECA";
        private const string _ViewName = "V_ACA_PROSPECTO_BECA_CONSULTA";

        public ACA_PROSPECTO_BECARepository(IConfiguration config) :
                base(config.GetConnectionString("admisionConnection") ?? config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            return await LeerAsync<ACA_PROSPECTO_BECAView>(_ViewName, xWhere, "FECHA_SOLICITUD DESC");
        }

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            return await LeerAsync<ACA_PROSPECTO_BECAView>(_ViewName, xWhere, "CORR_PROSPECTO_BECA");
        }

        public Task<CResult> CreateAsync(ACA_PROSPECTO_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> UpdateAsync(ACA_PROSPECTO_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> DeleteAsync(ACA_PROSPECTO_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        private async Task<CResult> LeerAsync<T>(string vista, List<CParameter> xWhere, string orden)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(vista, xWhere, orden);
                var response = new List<T>().FromDataReader(reader).ToList();

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
            catch (Exception e)
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

        private static CResult OperacionNoHabilitada()
        {
            return new CResult()
            {
                Data = null,
                Result = false,
                RowsAffected = 0,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = $"Operación no habilitada: {_TableName} es de solo consulta.",
                ErrorSource = ""
            };
        }
    }
}
