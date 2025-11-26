using System;
using System.Collections.Generic;
using eFrameworkAPI.Core;

namespace eFrameworkAPI.Data
{
    public interface IService
    {
        IResult GetAll(BaseParam xWhere);
        IResult Create(BaseEntity Data);
        IResult Update(BaseEntity Data);
        IResult Delete(BaseEntity Data);
        void RefrescaResultado(IResult xResultado, object xData, UpdateType _EstadoMtto, Action Refrescar);
        void SetDataSource(IResult xResultado, object xData);
    }
}
