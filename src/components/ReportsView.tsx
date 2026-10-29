import React from 'react';
import { AvenueOfService, RotaractEvent } from '../types/rotaract';
import {
  FileBarChart,
  Download,
  Printer,
  Users,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Award,
  Layers,
} from 'lucide-react';
import { formatReadableDate } from '../utils/dateHelpers';

interface ReportsViewProps {
  events: RotaractEvent[];
}

const ALL_AVENUES: AvenueOfService[] = [
  'Community Service',
  'Professional Development',
  'Technical & Innovations',
  'Club Service',
  'International Service',
  'Sports & Cultural',
  'Public Relations',
];

export const ReportsView: React.FC<ReportsViewProps> = ({ events }) => {
  const completedEvents = events.filter((e) => e.status === 'completed' || e.date < '2026-10-29');
  const upcomingEvents = events.filter((e) => e.status === 'upcoming' || e.date > '2026-10-29');

  // Total impact calculations
  const totalAttendeesReached = events.reduce(
    (acc, e) => acc + (e.actualAttendees || e.expectedAttendees || 0),
    0
  );
  const totalBudgetUtilized = events.reduce(
    (acc, e) => acc + (e.actualExpense || e.budget || 0),
    0
  );

  // Breakdown by Avenue
  const avenueStats = ALL_AVENUES.map((av) => {
    const matching = events.filter((e) => e.avenue === av);
    const count = matching.length;
    const attendees = matching.reduce(
      (acc, e) => acc + (e.actualAttendees || e.expectedAttendees || 0),
      0
    );
    const budget = matching.reduce((acc, e) => acc + (e.budget || 0), 0);
    const percentage = events.length > 0 ? Math.round((count / events.length) * 100) : 0;
    return { avenue: av, count, attendees, budget, percentage };
  });

  const handleExportFullCsv = () => {
    const headers = [
      'EventID',
      'Title',
      'Avenue',
      'Date',
      'Status',
      'Venue',
      'Chairperson',
      'Attendees',
      'BudgetINR',
      'Description',
    ];
    const rows = events.map((e) => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.avenue}"`,
      e.date,
      e.status,
      `"${e.venue.replace(/"/g, '""')}"`,
      `"${e.chairperson.replace(/"/g, '""')}"`,
      e.actualAttendees || e.expectedAttendees,
      e.budget,
      `"${(e.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `rotaract-rscoe-district3131-full-report-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-red-200 bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-[#800000]" />
            Club Performance & District 3131 Reporting
          </h2>
          <p className="text-xs text-gray-500">
            Rotaract Club of Rajarshi Shahu College of Engineering, Tathawade · Rotary Year 2026-27
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportFullCsv}
            className="flex items-center gap-1.5 rounded-lg bg-[#800000] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#660000] shadow-xs"
          >
            <Download className="h-4 w-4" />
            Download District CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Aggregate KPI Impact Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-[#800000]">
            <span>Total Projects</span>
            <Layers className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-gray-900">
            {events.length}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">
            {completedEvents.length} completed · {upcomingEvents.length} upcoming
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-[#800000]">
            <span>Total Reach</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-gray-900">
            {totalAttendeesReached.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Students & community members</div>
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-[#800000]">
            <span>Total Budget</span>
            <IndianRupee className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-gray-900">
            ₹{totalBudgetUtilized.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">Funded via club & sponsors</div>
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-[#800000]">
            <span>Rotary Citation</span>
            <Award className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#800000]">100%</div>
          <div className="text-[11px] text-gray-500 mt-0.5">District criteria fulfilled</div>
        </div>
      </div>

      {/* Avenue of Service Distribution Breakdown */}
      <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          Avenue of Service Distribution
        </h3>

        <div className="mt-4 space-y-4">
          {avenueStats.map((stat) => (
            <div key={stat.avenue} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-900 font-bold">{stat.avenue}</span>
                <span className="text-gray-600">
                  {stat.count} {stat.count === 1 ? 'project' : 'projects'} ({stat.percentage}%) ·{' '}
                  {stat.attendees} reach · ₹{stat.budget.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-red-100 overflow-hidden">
                <div
                  className="h-full bg-[#800000] rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(stat.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Chronological History Table */}
      <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          Official Project Records (District 3131 Format)
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#660000] text-white uppercase text-[11px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Project Title</th>
                <th className="py-2.5 px-3">Avenue</th>
                <th className="py-2.5 px-3">Chairperson</th>
                <th className="py-2.5 px-3">Venue</th>
                <th className="py-2.5 px-3">Beneficiaries</th>
                <th className="py-2.5 px-3">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-red-50/40">
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                    {formatReadableDate(ev.date)}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-gray-900 max-w-xs truncate">
                    {ev.title}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-[#800000]">
                      {ev.avenue}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 truncate">{ev.chairperson}</td>
                  <td className="py-2.5 px-3 max-w-[140px] truncate">{ev.venue}</td>
                  <td className="py-2.5 px-3 font-semibold">
                    {ev.actualAttendees || ev.expectedAttendees}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#800000]">
                    ₹{ev.budget.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
