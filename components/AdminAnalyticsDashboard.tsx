'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, BarChart3, Globe, MonitorSmartphone, Users } from 'lucide-react';

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];

type AnalyticsSummary = {
  totalVisits: number;
  uniqueVisitors: number;
  mostVisitedPage: { path: string; visits: number };
  averagePagePerVisit: number;
  timeSeries: { date: string; visits: number; label: string }[];
  countryStats: { name: string; count: number; percent: number }[];
  deviceStats: { name: string; count: number; percent: number }[];
  browserStats: { name: string; count: number; percent: number }[];
  recentVisits: Array<{
    id: string;
    path: string;
    country: string;
    city: string;
    device: string;
    browser: string;
    timestamp: string;
    referrer: string;
  }>;
  rangeLabel?: string;
};

const RANGE_OPTIONS = [1, 7, 30];

export function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  const deviceChartData = useMemo(() => data?.deviceStats ?? [], [data]);
  const browserChartData = useMemo(() => data?.browserStats ?? [], [data]);
  const countryChartData = useMemo(() => data?.countryStats ?? [], [data]);

  if (loading || !data) {
    return (
      <div className="rounded-3xl border border-gray-800 bg-[#0d1117] p-8 text-gray-400">
        İstatistikler yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-400">{data.rangeLabel ?? 'Son 7 Gün'}</div>
        <div className="flex gap-2 rounded-full border border-gray-800 bg-[#0b1220] p-1">
          {RANGE_OPTIONS.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                days === range ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {range === 1 ? 'Bugün' : `Son ${range} Gün`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={<Users className="h-4 w-4" />} label="Toplam Ziyaret" value={data.totalVisits} accent="blue" />
        <MetricCard icon={<Activity className="h-4 w-4" />} label="Tekil Ziyaretçi" value={data.uniqueVisitors} accent="green" />
        <MetricCard icon={<BarChart3 className="h-4 w-4" />} label="En Çok Okunan Sayfa" value={data.mostVisitedPage.path} accent="purple" compact />
        <MetricCard icon={<Globe className="h-4 w-4" />} label="Ortalama Sayfa/Ziyaret" value={data.averagePagePerVisit.toFixed(2)} accent="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-gray-800 bg-[#0d1117] p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Ziyaretçi Trendi</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeSeries}>
                <defs>
                  <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#9ca3af" tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="visits" stroke="#60a5fa" fill="url(#visitsFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-[#0d1117] p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Ülke Dağılımı</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryChartData.slice(0, 6)}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <ChartCard title="Cihaz Dağılımı">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={deviceChartData} dataKey="count" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                {deviceChartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            {deviceChartData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {item.name}
                </div>
                <span>{item.percent}%</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Tarayıcı Dağılımı">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={browserChartData} dataKey="count" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                {browserChartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            {browserChartData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                  {item.name}
                </div>
                <span>{item.percent}%</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Son Ziyaretler">
          <div className="space-y-3 text-sm">
            {data.recentVisits.map((visit) => (
              <div key={visit.id} className="rounded-xl border border-gray-800 bg-[#111827] p-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{new Date(visit.timestamp).toLocaleString('tr-TR')}</span>
                  <span>{visit.referrer}</span>
                </div>
                <p className="mt-2 font-medium text-white">{visit.path}</p>
                <p className="text-xs text-gray-400">{visit.city}, {visit.country} • {visit.device} • {visit.browser}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
  compact = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: 'blue' | 'green' | 'purple' | 'amber';
  compact?: boolean;
}) {
  const accentMap = {
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
    green: 'text-green-400 border-green-500/30 bg-green-500/5',
    purple: 'text-violet-400 border-violet-500/30 bg-violet-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  };

  return (
    <div className={`rounded-2xl border p-4 ${accentMap[accent]}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="rounded-full bg-black/30 p-2">{icon}</span>
      </div>
      <div className={`font-bold text-white ${compact ? 'text-lg' : 'text-3xl'}`}>
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-gray-800 bg-[#0d1117] p-5">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}
