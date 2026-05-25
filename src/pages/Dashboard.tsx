import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Trash2, Eye, Plus, Star,
  Calendar, Hash, LogOut,
} from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import AuthNavbar from '@/components/AuthNavbar';
import CosmicBackground from '@/components/CosmicBackground';
import { getReports, deleteReport } from '@/utils/reportStorage';
import { numberMeanings } from '@/utils/numerologyMeanings';
import { useState, useEffect } from 'react';
import type { SavedReport } from '@/utils/reportStorage';

const Dashboard = () => {
  const { user, logout } = useAuth0();
  const navigate = useNavigate();
  const [reports, setReports] = useState<SavedReport[]>([]);

  const userId = user?.sub || '';

  useEffect(() => {
    if (userId) {
      setReports(getReports(userId));
    }
  }, [userId]);

  const handleDelete = (reportId: string) => {
    deleteReport(userId, reportId);
    setReports(getReports(userId));
  };

  const handleViewReport = (report: SavedReport) => {
    // Store the report data in sessionStorage and navigate to home to view it
    sessionStorage.setItem('view_report', JSON.stringify(report.reportData));
    navigate('/?view=saved');
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      <AuthNavbar />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Header */}
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <UserAvatar picture={user?.picture} name={user?.name} size="lg" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                  Welcome back, <span className="gold-text">{user?.given_name || user?.name?.split(' ')[0] || 'Explorer'}</span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {user?.email}
                  <span className="text-gray-600 mx-2">•</span>
                  {reports.length} saved report{reports.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </header>

          {/* Quick Actions */}
          <section className="mb-10" aria-label="Quick actions">
            <div className="flex flex-wrap gap-3">
              <Link to="/">
                <Button className="cosmic-button" id="new-report-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Report
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-gray-400 hover:text-white hover:bg-white/5"
                id="dashboard-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </section>

          {/* Saved Reports */}
          <section aria-label="Saved reports">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-heading">
              <Star className="w-5 h-5 text-amber-400" />
              Your Saved Reports
            </h2>

            {reports.length === 0 ? (
              <div className="glass-morphism-elevated p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 mb-5">
                  <Sparkles className="w-8 h-8 text-amber-400/60" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Reports Yet</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  Generate your first Chaldean numerology report and it will be saved here automatically.
                </p>
                <Link to="/">
                  <Button className="cosmic-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Get Your Free Report
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => {
                  const lpMeaning = numberMeanings[report.lifePathNumber as keyof typeof numberMeanings];
                  const exMeaning = numberMeanings[report.expressionNumber as keyof typeof numberMeanings];

                  return (
                    <div
                      key={report.id}
                      className="nebula-card group hover:border-amber-500/20 transition-all duration-300"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-white truncate">
                            {report.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(report.savedAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                          aria-label={`Delete report for ${report.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Number Summary */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-amber-500/8 border border-amber-500/10 text-center">
                          <div className="text-lg font-display font-bold text-amber-400">
                            {report.lifePathNumber}
                          </div>
                          <div className="text-[9px] text-gray-500 uppercase tracking-wider">Life Path</div>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-500/8 border border-purple-500/10 text-center">
                          <div className="text-lg font-display font-bold text-purple-400">
                            {report.expressionNumber}
                          </div>
                          <div className="text-[9px] text-gray-500 uppercase tracking-wider">Expression</div>
                        </div>
                        <div className="p-2 rounded-lg bg-rose-500/8 border border-rose-500/10 text-center">
                          <div className="text-lg font-display font-bold text-rose-400">
                            {report.soulUrgeNumber}
                          </div>
                          <div className="text-[9px] text-gray-500 uppercase tracking-wider">Soul Urge</div>
                        </div>
                      </div>

                      {/* Archetype badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium border border-amber-500/15">
                          <Hash className="w-2.5 h-2.5 inline mr-0.5" />
                          {lpMeaning?.title || `Number ${report.lifePathNumber}`}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-medium border border-purple-500/15">
                          {exMeaning?.title || `Number ${report.expressionNumber}`}
                        </span>
                      </div>

                      {/* View Button */}
                      <Button
                        onClick={() => handleViewReport(report)}
                        variant="ghost"
                        className="w-full text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        View Full Report
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Account Info */}
          <section className="mt-12" aria-label="Account information">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-heading">
              Account
            </h2>
            <div className="glass-morphism p-5">
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Email</span>
                  <span className="text-gray-300">{user?.email || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Auth Provider</span>
                  <span className="text-gray-300 capitalize">
                    {user?.sub?.split('|')[0]?.replace('-', ' ') || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Email Verified</span>
                  <span className={user?.email_verified ? 'text-emerald-400' : 'text-orange-400'}>
                    {user?.email_verified ? '✓ Verified' : '✗ Not verified'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-600 text-xs border-t border-white/5 px-4">
        <p>© {new Date().getFullYear()} Luthor Sparks Costello AI Studio 508C1A Church ® ™ All Rights Reserved and Retained. None Waived.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
