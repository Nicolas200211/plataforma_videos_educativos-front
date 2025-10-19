import { useState } from 'react';
import { subscriptionsService } from '../../services/subscriptions.service';

export function EnrollmentsDebug() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log('🔍 Probando endpoint /enrollments...');
      console.log('Token:', localStorage.getItem('access_token')?.substring(0, 20) + '...');

      const result = await subscriptionsService.getAllEnrollments();

      console.log('✅ Respuesta exitosa:', result);
      setData(result);
    } catch (err: any) {
      console.error('❌ Error:', err);
      console.error('Respuesta del servidor:', err.response?.data);
      console.error('Status:', err.response?.status);
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Diagnóstico de Enrollments</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Información del Sistema</h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Token presente:</strong>{' '}
            {localStorage.getItem('access_token') ? '✅ Sí' : '❌ No'}
          </div>
          <div>
            <strong>Usuario:</strong>{' '}
            {JSON.parse(localStorage.getItem('user') || '{}')?.fullName || 'N/A'}
          </div>
          <div>
            <strong>Rol:</strong>{' '}
            {JSON.parse(localStorage.getItem('user') || '{}')?.role || 'N/A'}
          </div>
          <div>
            <strong>API URL:</strong> http://localhost:3000/api/v1
          </div>
          <div>
            <strong>Endpoint:</strong> GET /api/v1/enrollments
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <button
          onClick={testEndpoint}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Probando...' : 'Probar Endpoint'}
        </button>
      </div>

      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-800">Cargando...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Mensaje:</strong> {error.message}
            </div>
            <div>
              <strong>Status:</strong> {error.status}
            </div>
            <div>
              <strong>Respuesta del servidor:</strong>
              <pre className="mt-2 p-4 bg-red-100 rounded overflow-x-auto">
                {JSON.stringify(error.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Datos recibidos ({Array.isArray(data) ? data.length : 0} enrollments)
          </h3>
          <pre className="mt-2 p-4 bg-green-100 rounded overflow-x-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
