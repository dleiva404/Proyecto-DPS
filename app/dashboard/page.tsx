'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const kpis = [
  { titulo: 'Empleados Activos', valor: '248', cambio: '+12 este mes', positivo: true },
  { titulo: 'Solicitudes Pendientes', valor: '12', cambio: 'Requieren atención', alerta: true },
  { titulo: 'Vacaciones Activas', valor: '18', cambio: 'En Agosto', neutral: true },
  { titulo: 'Constancias Emitidas', valor: '34', cambio: 'Últimos 30 días', positivo: true },
];

const tendenciaMensual = [
  { mes: 'Mar', vacaciones: 12, permisos: 8, constancias: 15 },
  { mes: 'Abr', vacaciones: 19, permisos: 12, constancias: 18 },
  { mes: 'May', vacaciones: 15, permisos: 10, constancias: 14 },
  { mes: 'Jun', vacaciones: 22, permisos: 14, constancias: 20 },
  { mes: 'Jul', vacaciones: 30, permisos: 18, constancias: 25 },
  { mes: 'Ago', vacaciones: 25, permisos: 15, constancias: 22 },
];

const resumenEmpresas = [
  { name: 'Inver Calma', value: 120, color: '#2563eb' },
  { name: 'Didelco', value: 45, color: '#0ea5e9' },
  { name: 'Steel', value: 30, color: '#10b981' },
  { name: 'Propultran', value: 28, color: '#f59e0b' },
  { name: 'Copro', value: 22, color: '#8b5cf6' },
  { name: 'DCA', value: 25, color: '#ec4899' },
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
    // Usamos space-y-6 para dar el respiro perfecto entre los KPIs y las gráficas inferiores
    <div className="p-6 bg-slate-50 flex flex-col space-y-6">
      
      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400">{kpi.titulo}</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-800">{kpi.valor}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                kpi.alerta ? 'bg-amber-50 text-amber-600' :
                kpi.positivo ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {kpi.cambio}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Secciones Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Histórico de Solicitudes</h2>
                <p className="text-[11px] text-slate-400">Volumen mensual de trámites procesados</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Vacaciones</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Permisos</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tendenciaMensual}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Area type="monotone" dataKey="vacaciones" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="permisos" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Pastel de Empresas */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-0.5">Distribución por Empresa</h2>
            <p className="text-[11px] text-slate-400 mb-3">Proporción de colaboradores activos por compañía</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resumenEmpresas}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {resumenEmpresas.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                {resumenEmpresas.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-50 px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="font-medium text-slate-700 truncate">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800 ml-1">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800">Atención de Trámites</h3>
            
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Vacaciones Atendidas</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Permisos Médicos</span>
                <span>60%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[60%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Constancias Laborales</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full w-[40%]" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-2.5">Vacaciones Próximas a Vencer</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Juan Pérez</p>
                  <p className="text-[9px] text-slate-400">EMP-0102 • Didelco</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div>
                  <p className="text-[11px] font-bold text-slate-800">José Sanchez</p>
                  <p className="text-[9px] text-slate-400">EMP-0341 • EFL</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-2">Días Restantes para Vencimiento</h3>
            <div className="h-32">
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