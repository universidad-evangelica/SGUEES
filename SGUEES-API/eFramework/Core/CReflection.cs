using System;
using System.Linq;

namespace eFramework.Core
{
    public class CReflection
    {
        public void FillObjectWithProperty(ref object objectTo, string propertyName, object propertyValue)
        {
            Type tOb2 = objectTo.GetType();
            try //Para tolerar el fallo cuando en el objeto no exista la propiedad
            {
                var prop = tOb2.GetProperty(propertyName); 
                if (prop != null) 
                {
                    if (prop.PropertyType == typeof(List<string>)) 
                    {
                        prop.SetValue(objectTo, ((string)propertyValue).Split(",").ToList<string>());
                    } else {
                        prop.SetValue(objectTo, propertyValue);
                    }
                }
            }
            catch (System.Exception)
            {            
            }            
        }
    }
}
