using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTOService : IACA_PROSPECTOService
    {
        private readonly IACA_PROSPECTORepository _repo;

        public ACA_PROSPECTOService(IACA_PROSPECTORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: listado de prospectos de un ciclo (año + número de período).
        // Cómo lo hace: exige el ciclo porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los prospectos de todos los ciclos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.ANIO <= 0 || xWhere.NUMERO_PERIODO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe seleccionar un ciclo" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="ANIO",Value=xWhere.ANIO,DbType=System.Data.DbType.Int16},
                new CParameter() {ParameterName="NUMERO_PERIODO",Value=xWhere.NUMERO_PERIODO,DbType=System.Data.DbType.Byte},
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: encabezado de un prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync.
        public async Task<CResult> GetAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: carreras que el prospecto puede elegir en su ciclo (para el cambio de carrera).
        // Cómo lo hace: la oferta depende del período del prospecto, así que exige su llave.
        public async Task<CResult> GetCORR_CARRERA_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return ErrorValidacion("Debe indicar el prospecto");

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetCarrerasDelCicloAsync(p);
        }

        // Qué hace: modalidades con plan vigente de la carrera elegida.
        public async Task<CResult> GetCORR_MODALIDAD_ACA_PROSPECTOAsync(ACA_PROSPECTOParam xWhere)
        {
            if (xWhere.CORR_CARRERA <= 0)
                return ErrorValidacion("Debe indicar la carrera");

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_CARRERA",Value=xWhere.CORR_CARRERA,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetModalidadesDeCarreraAsync(p);
        }

        public async Task<CResult> CreateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: valida el encabezado antes de actualizar.
        // Cómo lo hace: desde el ERP solo se editan FORMA_INGRESO (NI, EQ, CC, RI) y FINANCIA_ESTUDIOS.
        public async Task<CResult> UpdateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO <= 0)
                return ErrorValidacion("Debe indicar el prospecto a modificar.");

            Data.FORMA_INGRESO = Data.FORMA_INGRESO?.Trim().ToUpperInvariant();
            Data.FINANCIA_ESTUDIOS = string.IsNullOrWhiteSpace(Data.FINANCIA_ESTUDIOS) ? null : Data.FINANCIA_ESTUDIOS.Trim();

            if (string.IsNullOrWhiteSpace(Data.FORMA_INGRESO) || System.Array.IndexOf(FormasIngreso, Data.FORMA_INGRESO) < 0)
                return ErrorValidacion("La forma de ingreso debe ser NI, EQ, CC o RI.");

            if (Data.FINANCIA_ESTUDIOS != null && Data.FINANCIA_ESTUDIOS.Length > 100)
                return ErrorValidacion("Financia estudios no puede superar 100 caracteres.");

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        private static readonly string[] FormasIngreso = { "NI", "EQ", "CC", "RI" };

        private static CResult ErrorValidacion(string mensaje)
        {
            return new CResult() { Data = null, Result = false, CodeHelper = 0, ErrorCode = -1, ErrorMessage = mensaje, ErrorSource = "[ACA_PROSPECTOService]", RowsAffected = 0 };
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }
    }
}
