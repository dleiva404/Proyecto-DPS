'use client';

import { useMemo, useState } from 'react';
import { empleadosMock, type Empleado } from '../../mocks/empleados';

function esEmpleadoActivo(empleado: Empleado) {
  return empleado.estadoEmpleado === 'A' || empleado.estadoEmpleado.toLowerCase() === 'activo';
}

function descargarReporte(empleados: Empleado[]) {
  const encabezados = ['ID', 'Nombre completo', 'Departamento', 'Empresa', 'Contratacion', 'Estado'];
  const filas = empleados.map((empleado: any) => [
    empleado.empleadoId,
    `${empleado.nombres} ${empleado.apellidoPaterno} ${empleado.apellidoMaterno}`,
    `Depto ${empleado.departamentoId}`,
    empleado.empresa || 'Didelco',
    empleado.fechaContratacion,
    esEmpleadoActivo(empleado) ? 'Activo' : 'Inactivo',
  ]);
  const csv = [encabezados, ...filas]
    .map((fila) => fila.map((valor) => `"${valor.replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = 'reporte-empleados.csv';
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function ReportesPage() {
  const [empleados] = useState<Empleado[]>(empleadosMock);
  const [searchTerm, setSearchTerm] = useState('');
  const [empresaFiltro, setEmpresaFiltro] = useState('Todas');
  const [deptoFiltro, setDeptoFiltro] = useState('Todos');

  const empleadosFiltrados = useMemo(() => {
    const busqueda = searchTerm.toLowerCase().trim();

    return empleados.filter((emp: any) => {
      const id = (emp.empleadoId || '').toLowerCase();
      const nombres = (emp.nombres || '').toLowerCase();
      const paterno = (emp.apellidoPaterno || '').toLowerCase();
      const materno = (emp.apellidoMaterno || '').toLowerCase();
      const nombreCompleto = `${nombres} ${paterno} ${materno}`.trim();

      const empresaNombre = emp.empresa || 'Didelco';
      const departamentoOriginal = `Depto ${emp.departamentoId || ''}`;
      const departamentoTexto = departamentoOriginal.toLowerCase();

      const coincideTexto =
        !busqueda ||
        id.includes(busqueda) ||
        nombreCompleto.includes(busqueda) ||
        empresaNombre.toLowerCase().includes(busqueda) ||
        departamentoTexto.includes(busqueda);

      const coincideEmpresa =
        empresaFiltro === 'Todas' ||
        empresaNombre.toLowerCase() === empresaFiltro.toLowerCase();

      const coincideDepto =
        deptoFiltro === 'Todos' ||
        departamentoTexto === deptoFiltro.toLowerCase() ||
        (emp.departamentoId && `depto ${emp.departamentoId}` === deptoFiltro.toLowerCase());

      return coincideTexto && coincideEmpresa && coincideDepto;
    });
  }, [empleados, searchTerm, empresaFiltro, deptoFiltro]);

  const totalFiltrados = empleadosFiltrados.length;
  const totalActivos = useMemo(() => {
    return empleadosFiltrados.filter(esEmpleadoActivo).length;
  }, [empleadosFiltrados]);

  const textoEmpresaKPI = useMemo(() => {
    if (empresaFiltro !== 'Todas') {
      return empresaFiltro;
    }

    const empresasEnVista = Array.from(
      new Set(empleadosFiltrados.map((e: any) => e.empresa || 'Didelco'))
    ).filter(Boolean);

    if (empresasEnVista.length === 1) {
      return empresasEnVista[0];
    } else if (empresasEnVista.length > 1) {
      return `${empresasEnVista.length} Empresas`;
    }

    return 'Todas';
  }, [empresaFiltro, empleadosFiltrados]);

  return (
    <div className="p-8 space-y-6">
      {/* Header de la sección */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reportes de Empleados</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Consulta, filtrado avanzado y exportación del personal registrado de Grupo Calma
          </p>
        </div>
        <button
          type="button"
          onClick={() => descargarReporte(empleadosFiltrados)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all text-xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar a Excel / PDF
        </button>
      </div>

      {/* Tarjetas de Resumen (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Resultados Obtenidos</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalFiltrados}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Colaboradores Activos</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{totalActivos}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Filtro Empresa</p>
            <h3 className="text-lg font-bold text-slate-700 mt-1">{textoEmpresaKPI}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m0 0v-5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tarjeta Principal de Tabla */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="relative w-full lg:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, nombre o depto..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Empresa:</label>
              <select
                value={empresaFiltro}
                onChange={(e) => setEmpresaFiltro(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todas">Todas</option>
                <option value="Didelco">Didelco</option>
                <option value="Steel">Steel</option>
                <option value="EFL">EFL</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Depto:</label>
              <select
                value={deptoFiltro}
                onChange={(e) => setDeptoFiltro(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todos">Todos</option>
                <option value="Depto 01">Depto 01</option>
                <option value="Depto 02">Depto 02</option>
                <option value="Depto 03">Depto 03</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Nombre Completo</th>
                <th className="py-3 px-4 font-semibold">Departamento</th>
                <th className="py-3 px-4 font-semibold">Empresa</th>
                <th className="py-3 px-4 font-semibold">Contratación</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {empleadosFiltrados.length > 0 ? (
                empleadosFiltrados.map((emp: any) => {
                  const esActivo = esEmpleadoActivo(emp);
                  const nombreCompleto = `${emp.nombres} ${emp.apellidoPaterno} ${emp.apellidoMaterno}`;
                  const empresaNombre = emp.empresa || 'Didelco';

                  return (
                    <tr key={emp.empleadoId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {emp.empleadoId}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {nombreCompleto}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                          Depto {emp.departamentoId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {empresaNombre}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {emp.fechaContratacion || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            esActivo
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-rose-50 text-rose-600 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              esActivo ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          ></span>
                          {esActivo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron colaboradores con los criterios seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}