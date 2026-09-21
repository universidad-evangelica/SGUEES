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
    public class ACA_PROSPECTO_CONTACTORepository : BaseRepository<ACA_PROSPECTO_CONTACTOTable>, IACA_PROSPECTO_CONTACTORepository
    {
        private const string _TableName = "ACA_PROSPECTO_CONTACTO";
        private const string _ViewName = "V_ACA_PROSPECTO_CONTACTO";

        public ACA_PROSPECTO_CONTACTORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: correos y teléfonos del prospecto.
        // Cómo lo hace: lee V_ACA_PROSPECTO_CONTACTO ordenado por ES_PRINCIPAL DESC, ES_CORREO DESC, CORR_PROSPECTO_CONTACTO.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "ES_PRINCIPAL DESC, ES_CORREO DESC, CORR_PROSPECTO_CONTACTO");
                var response = new List<ACA_PROSPECTO_CONTACTOView>().FromDataReader(reader).ToList();

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

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<ACA_PROSPECTO_CONTACTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
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

        // Qué hace: alta, modificación y eliminación aún no habilitadas.
        // Cómo lo hace: /aca-prospecto es de solo consulta; IRepository exige los métodos, así que
        //               responden un error claro hasta la fase de edición.
        public Task<CResult> CreateAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> UpdateAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> DeleteAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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
                ErrorMessage = $"Operación no habilitada: {_TableName} es de solo consulta.",
                ErrorSource = ""
            };
        }
    }
}
