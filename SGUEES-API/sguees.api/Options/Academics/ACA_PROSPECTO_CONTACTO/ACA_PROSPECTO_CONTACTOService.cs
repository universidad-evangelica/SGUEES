using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_CONTACTOService : IACA_PROSPECTO_CONTACTOService
    {
        private readonly IACA_PROSPECTO_CONTACTORepository _repo;

        public ACA_PROSPECTO_CONTACTOService(IACA_PROSPECTO_CONTACTORepository repo)
        {
            _repo = repo;
        }

        // Qué hace: correos y teléfonos del prospecto (pestaña Información personal).
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0
        //               y, sin él, devolvería los datos de todos los prospectos.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_CONTACTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: un registro por su llave (CORR_PROSPECTO_CONTACTO); sin llave, el primero del prospecto.
        // Cómo lo hace: exige CORR_PROSPECTO por la misma razón que GetAllAsync;
        //               la llave es opcional porque eFramework omite los enteros en 0.
        public async Task<CResult> GetAsync(ACA_PROSPECTO_CONTACTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = "Debe indicar el prospecto" };

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=xWhere.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO_CONTACTO",Value=xWhere.CORR_PROSPECTO_CONTACTO,DbType=System.Data.DbType.Int32},
            };

            return await _repo.GetAsync(p);
        }

        // Qué hace: códigos telefónicos de país, la misma lista del registro del portal.
        public async Task<CResult> GetCODIGO_PAIS_ACA_PROSPECTOAsync()
        {
            return await _repo.GetCODIGO_PAISAsync();
        }

        // Qué hace: valida y agrega un contacto del prospecto.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_PERSONA <= 0)
                return ErrorValidacion("Debe indicar la persona del prospecto.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_CONTACTO <= 0)
                return ErrorValidacion("Debe indicar el contacto a modificar.");

            var validacion = Validar(Data);
            if (validacion != null) return validacion;

            return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            if (Data == null || Data.CORR_PROSPECTO_CONTACTO <= 0)
                return ErrorValidacion("Debe indicar el contacto a eliminar.");

            return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
        }

        // Qué hace: reglas comunes de alta y modificación del contacto.
        // Cómo lo hace: el dato es obligatorio (máximo 200) y el tipo es exactamente uno: teléfono o
        //               correo (la tabla lo expresa con bits, no con catálogo). Un correo debe tener
        //               forma de correo. Quién es el principal de cada tipo lo resuelve el repositorio.
        private static CResult Validar(ACA_PROSPECTO_CONTACTOTable Data)
        {
            Data.CONTACTO = string.IsNullOrWhiteSpace(Data.CONTACTO) ? null : Data.CONTACTO.Trim();

            if (Data.CONTACTO == null)
                return ErrorValidacion("Ingrese el teléfono o el correo.");
            if (Data.CONTACTO.Length > 200)
                return ErrorValidacion("El contacto no puede superar 200 caracteres.");
            if (Data.ES_TELEFONO == Data.ES_CORREO)
                return ErrorValidacion("Indique si el contacto es un teléfono o un correo.");
            if (Data.ES_CORREO && !EsCorreo(Data.CONTACTO))
                return ErrorValidacion("El correo no tiene un formato válido (ejemplo: nombre@dominio.com).");
            if (Data.ES_TELEFONO && !EsTelefono(Data.CONTACTO))
                return ErrorValidacion("El teléfono debe llevar código de país y de 7 a 12 dígitos (ejemplo: +503 76150644).");

            return null;
        }

        // Qué hace: forma de correo: algo@algo.algo, sin espacios ni segunda arroba.
        private static bool EsCorreo(string valor) =>
            System.Text.RegularExpressions.Regex.IsMatch(valor, @"^[^\s@]+@[^\s@]+\.[^\s@]+$");

        // Qué hace: forma de teléfono igual a la del registro del portal: "+503 76150644", es decir,
        //           código de país (primer token del catálogo, puede ser "+1+767"), un espacio y el
        //           número con 7 a 12 dígitos (admite espacios, guiones y paréntesis).
        private static bool EsTelefono(string valor)
        {
            var espacio = valor.IndexOf(' ');
            if (espacio <= 0) return false;

            var codigo = valor.Substring(0, espacio);
            var numero = valor.Substring(espacio + 1).Trim();
            if (!System.Text.RegularExpressions.Regex.IsMatch(codigo, @"^\+\d{1,4}(\+\d{1,4})?$")) return false;

            var digitos = 0;
            foreach (var c in numero)
            {
                if (char.IsDigit(c)) { digitos++; continue; }
                if (c == ' ' || c == '-' || c == '(' || c == ')') continue;
                return false;
            }
            return digitos >= 7 && digitos <= 12;
        }

        private static CResult ErrorValidacion(string mensaje)
        {
            return new CResult() { Data = null, Result = false, CodeHelper = 0, ErrorCode = -1, ErrorMessage = mensaje, ErrorSource = "[ACA_PROSPECTO_CONTACTOService]", RowsAffected = 0 };
        }
    }
}
