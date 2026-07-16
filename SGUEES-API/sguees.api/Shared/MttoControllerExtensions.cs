using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace sguees.api.Shared
{
    /// <summary>
    /// Helpers HTTP para mantenimientos SGUEES.
    /// Unifica PK en PUT: body + query (patrón SPA CData.Put).
    /// </summary>
    public static class MttoControllerExtensions
    {
        /// <summary>
        /// Si la PK en el body viene vacía o en 0, la toma del query string.
        /// Si el body ya trae un valor válido, no lo sobrescribe.
        /// </summary>
        public static void ApplyQueryKeys<T>(this ControllerBase controller, T data, params string[] propertyNames)
            where T : class
        {
            if (data == null || propertyNames == null || propertyNames.Length == 0)
            {
                return;
            }

            var type = typeof(T);

            foreach (var name in propertyNames)
            {
                if (string.IsNullOrWhiteSpace(name))
                {
                    continue;
                }

                var property = type.GetProperty(name);
                if (property == null || !property.CanWrite)
                {
                    continue;
                }

                var current = property.GetValue(data);
                if (!IsEmptyKeyValue(current, property.PropertyType))
                {
                    continue;
                }

                if (!controller.Request.Query.TryGetValue(name, out var values))
                {
                    continue;
                }

                var raw = values.FirstOrDefault();
                if (string.IsNullOrWhiteSpace(raw))
                {
                    continue;
                }

                if (TryConvertQueryValue(raw, property.PropertyType, out var converted))
                {
                    property.SetValue(data, converted);
                }
            }
        }

        private static bool IsEmptyKeyValue(object? value, Type propertyType)
        {
            if (value == null)
            {
                return true;
            }

            var underlying = Nullable.GetUnderlyingType(propertyType) ?? propertyType;

            if (underlying == typeof(string))
            {
                return string.IsNullOrWhiteSpace((string)value);
            }

            if (underlying == typeof(int))
            {
                return (int)value <= 0;
            }

            if (underlying == typeof(long))
            {
                return (long)value <= 0;
            }

            if (underlying == typeof(decimal))
            {
                return (decimal)value <= 0;
            }

            if (underlying == typeof(Guid))
            {
                return (Guid)value == Guid.Empty;
            }

            return false;
        }

        private static bool TryConvertQueryValue(string raw, Type propertyType, out object? converted)
        {
            converted = null;
            var underlying = Nullable.GetUnderlyingType(propertyType) ?? propertyType;

            try
            {
                if (underlying == typeof(string))
                {
                    converted = raw;
                    return true;
                }

                if (underlying == typeof(int))
                {
                    if (int.TryParse(raw, out var intValue))
                    {
                        converted = intValue;
                        return true;
                    }

                    return false;
                }

                if (underlying == typeof(long))
                {
                    if (long.TryParse(raw, out var longValue))
                    {
                        converted = longValue;
                        return true;
                    }

                    return false;
                }

                if (underlying == typeof(decimal))
                {
                    if (decimal.TryParse(raw, out var decimalValue))
                    {
                        converted = decimalValue;
                        return true;
                    }

                    return false;
                }

                if (underlying == typeof(Guid))
                {
                    if (Guid.TryParse(raw, out var guidValue))
                    {
                        converted = guidValue;
                        return true;
                    }

                    return false;
                }

                if (underlying == typeof(bool))
                {
                    if (bool.TryParse(raw, out var boolValue))
                    {
                        converted = boolValue;
                        return true;
                    }

                    return false;
                }

                converted = Convert.ChangeType(raw, underlying);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
