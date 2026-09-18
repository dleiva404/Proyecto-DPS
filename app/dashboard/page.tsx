'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const solicitudesPendientes = [
  { id: '1', nombre: 'Juan Pérez', codigo: 'EMP-0102', empresa: 'Didelco', sucursal: 'San Salvador', tipo: 'Vacaciones', fecha: '17 Agosto' },
  { id: '2', nombre: 'Ana Flores', codigo: 'EMP-0215', empresa: 'Steel', sucursal: '—', tipo: 'Permiso Médico', fecha: '15 Agosto' },
  { id: '3', nombre: 'Carlos Rivas', codigo: 'EMP-0083', empresa: 'Didelco', sucursal: 'Usulután', tipo: 'Constancia Laboral', fecha: '11 Agosto' },
  { id: '4', nombre: 'José Sánchez', codigo: 'EMP-0341', empresa: 'EFL', sucursal: '—', tipo: 'Vacaciones', fecha: '9 Agosto' },
  { id: '5', nombre: 'Francisco Casco', codigo: 'EMP-0178', empresa: 'Copro', sucursal: '—', tipo: 'Permiso Médico', fecha: '14 Agosto' },
  { id: '6', nombre: 'Ana Cruz', codigo: 'EMP-0204', empresa: 'Depósitos de Centroamérica', sucursal: '—', tipo: 'Constancia Laboral', fecha: '16 Agosto' },
  { id: '7', nombre: 'Roberto Gomez', codigo: 'EMP-0288', empresa: 'Propetrol', sucursal: '—', tipo: 'Vacaciones', fecha: '18 Agosto' },
  { id: '8', nombre: 'Elena Torres', codigo: 'EMP-0312', empresa: 'Inver Calma', sucursal: '—', tipo: 'Permiso Médico', fecha: '20 Agosto' },
];

const datosVencimiento = [
  { name: 'Juan P.', dias: 3 },
  { name: 'José S.', dias: 5 },
  { name: 'Ana F.', dias: 2 },
  { name: 'Carlos R.', dias: 7 },
  { name: 'Elena T.', dias: 4 },
];

export default function DashboardPage() {
  return (
    <div className="p-8 bg-slate-50 min-h-[calc(100vh-5rem)]">
      <div className="flex gap-8 items-start">
        {/* Columna Izquierda: Tabla de Solicitudes (Alineada en altura con la columna derecha) */}
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between" style={{ minHeight: '612px' }}>
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4">Solicitudes pendientes de aprobación</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3 font-semibold">Empleado</th>
                    <th className="py-3 px-3 font-semibold">Empresa</th>
                    <th className="py-3 px-3 font-semibold">Sucursal</th>
                    <th className="py-3 px-3 font-semibold">Tipo</th>
                    <th className="py-3 px-3 font-semibold">Fecha</th>
                    <th className="py-3 px-3 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-600 divide-y divide-slate-50">
                  {solicitudesPendientes.map((sol) => (
                    <tr key={sol.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{sol.nombre}</p>
                        <p className="text-[10px] text-slate-400">{sol.codigo}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{sol.empresa}</td>
                      <td className="py-3 px-3 text-slate-400">{sol.sucursal}</td>
                      <td className="py-3 px-3 text-slate-600">{sol.tipo}</td>
                      <td className="py-3 px-3 text-slate-600">{sol.fecha}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center font-bold">✓</button>
                          <button className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center font-bold">✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 text-right text-[11px] text-slate-400 border-t border-slate-100">
            Mostrando 8 solicitudes pendientes
          </div>
        </div>

        {/* Columna Derecha: Tarjetas de Progreso y Gráfica Roja */}
        <div className="w-80 space-y-6">
          {/* Panel de Progreso General */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Vacaciones</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[85%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Permisos</span>
                <span>60%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[60%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                <span>Constancias</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[40%]"></div>
              </div>
            </div>
          </div>

          {/* Vacaciones próximas a vencer */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Vacaciones próximas a vencer</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-800">Juan Pérez</p>
                  <p className="text-[10px] text-slate-400">EMP-0102</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div>
                  <p className="text-xs font-bold text-slate-800">José Sanchez</p>
                  <p className="text-[10px] text-slate-400">EMP-0341</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
            </div>
          </div>

          {/* Gráfica Roja de Vencimientos */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-3">Vacaciones Próximas a Vencer (Días)</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosVencimiento}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                  <YAxis stroke="#94a3b8" fontSize={9} />
                  <Tooltip />
                  <Bar dataKey="dias" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}