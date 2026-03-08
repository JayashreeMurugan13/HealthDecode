"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell, ReferenceLine } from "recharts";

interface TrendData {
  parameter: string;
  data: { date: string; value: number; status: string }[];
  unit: string;
  normalRange: { min: number; max: number };
}

export default function HealthTrendsPage() {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [selectedParameter, setSelectedParameter] = useState<string>("");

  useEffect(() => {
    loadHealthTrends();
  }, []);

  const loadHealthTrends = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;

    const user = JSON.parse(currentUser);
    const reportsKey = `reports_${user.id}`;
    const reports = JSON.parse(localStorage.getItem(reportsKey) || '[]');

    const parameterMap = new Map<string, any[]>();

    reports.forEach((report: any, reportIndex: number) => {
      if (report.extractedData?.parameters) {
        report.extractedData.parameters.forEach((param: any, paramIndex: number) => {
          const key = param.parameter;
          if (!parameterMap.has(key)) {
            parameterMap.set(key, []);
          }
          parameterMap.get(key)?.push({
            date: new Date(report.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: parseFloat(param.result),
            status: param.status,
            unit: param.unit,
            normalRange: param.normalRange,
            uniqueId: `${reportIndex}-${paramIndex}`,
          });
        });
      }
    });

    const trendData: TrendData[] = [];
    parameterMap.forEach((data, parameter) => {
      if (data.length > 0) {
        const ranges = data[0].normalRange.split('-').map((v: string) => parseFloat(v));
        trendData.push({
          parameter,
          data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
          unit: data[0].unit,
          normalRange: { min: ranges[0] || 0, max: ranges[1] || 100 },
        });
      }
    });

    // Sort by number of readings (most first) to show parameters with graphs first
    trendData.sort((a, b) => b.data.length - a.data.length);

    setTrends(trendData);
    if (trendData.length > 0 && !selectedParameter) {
      // Auto-select first parameter with 2+ readings, or first parameter if none
      const paramWithMultipleReadings = trendData.find(t => t.data.length >= 2);
      setSelectedParameter(paramWithMultipleReadings?.parameter || trendData[0].parameter);
    }
  };

  const selectedTrend = trends.find(t => t.parameter === selectedParameter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return '#22C55E';
      case 'low': return '#EAB308';
      case 'high': return '#F97316';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTrendDirection = (data: any[]) => {
    if (data.length < 2) return null;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    return last > first ? 'up' : last < first ? 'down' : 'stable';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Health Trends</h1>
        <p className="text-muted-foreground mt-1">Track your health parameters over time</p>
      </motion.div>

      {trends.length === 0 ? (
        <motion.div className="p-12 rounded-2xl bg-white border border-border text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Data Yet</h3>
          <p className="text-muted-foreground">Upload multiple reports to see trends</p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends.map((trend, index) => {
              const direction = getTrendDirection(trend.data);
              const latestValue = trend.data[trend.data.length - 1];
              
              return (
                <motion.button
                  key={trend.parameter}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedParameter === trend.parameter ? 'border-[#0066FF] bg-[#0066FF]/5' : 'border-border bg-white hover:border-[#0066FF]/50'
                  }`}
                  onClick={() => setSelectedParameter(trend.parameter)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{trend.parameter}</h3>
                    {direction === 'up' && <TrendingUp className="w-5 h-5 text-orange-500" />}
                    {direction === 'down' && <TrendingDown className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{latestValue.value}</span>
                    <span className="text-sm text-muted-foreground">{trend.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(latestValue.status) }} />
                    <span className="text-xs text-muted-foreground">{trend.data.length} reading{trend.data.length > 1 ? 's' : ''}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {selectedTrend && (
            <motion.div className="p-6 rounded-2xl bg-white border border-border" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={selectedParameter}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{selectedTrend.parameter}</h2>
                  <p className="text-sm text-muted-foreground">Normal: {selectedTrend.normalRange.min}-{selectedTrend.normalRange.max} {selectedTrend.unit}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedTrend.data.length} reading{selectedTrend.data.length > 1 ? 's' : ''}</span>
                </div>
              </div>

              {selectedTrend.data.length === 1 ? (
                <div className="space-y-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{
                        name: selectedTrend.parameter,
                        value: selectedTrend.data[0].value,
                        min: selectedTrend.normalRange.min,
                        max: selectedTrend.normalRange.max
                      }]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 'auto']} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
                        <ReferenceLine y={selectedTrend.normalRange.min} stroke="#22C55E" strokeDasharray="5 5" label={{ value: 'Min Normal', position: 'right', fontSize: 10 }} />
                        <ReferenceLine y={selectedTrend.normalRange.max} stroke="#22C55E" strokeDasharray="5 5" label={{ value: 'Max Normal', position: 'right', fontSize: 10 }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          <Cell fill={getStatusColor(selectedTrend.data[0].status)} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <p className="text-sm text-muted-foreground">📊 Single reading shown. Upload more reports with this parameter to see trend analysis over time.</p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedTrend.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB' }} />
                    <Legend />
                    <Line key="upper-normal" type="monotone" dataKey={() => selectedTrend.normalRange.max} stroke="#22C55E" strokeDasharray="5 5" dot={false} name="Upper Normal" strokeWidth={1} />
                    <Line key="lower-normal" type="monotone" dataKey={() => selectedTrend.normalRange.min} stroke="#22C55E" strokeDasharray="5 5" dot={false} name="Lower Normal" strokeWidth={1} />
                    <Line key="actual-value" type="monotone" dataKey="value" stroke="#0066FF" strokeWidth={3} dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      return <circle key={`dot-${payload.uniqueId}`} cx={cx} cy={cy} r={6} fill={getStatusColor(payload.status)} stroke="#fff" strokeWidth={2} />;
                    }} name={selectedTrend.parameter} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Value</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedTrend.data.map((item) => (
                      <tr key={item.uniqueId} className="hover:bg-secondary/50">
                        <td className="px-4 py-3 text-sm text-foreground">{item.date}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{item.value} {selectedTrend.unit}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${getStatusColor(item.status)}20`, color: getStatusColor(item.status) }}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
