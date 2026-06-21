import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import StepChecklist from '../components/common/StepChecklist';
import Modal from '../components/common/Modal';

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse select-none">
    <div className="space-y-2.5">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="bg-white border border-gray-150 rounded-2xl p-5 h-28" />
    </div>
    <div className="space-y-2.5">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="bg-white border border-gray-150 rounded-2xl p-5 h-44" />
    </div>
    <div className="space-y-2.5">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="bg-white border border-gray-150 rounded-2xl p-5 h-20" />
    </div>
  </div>
);

const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    saveSituation,
    actionPlanProgress,
    updatePlanProgress,
    clearSituation,
  } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [togglingStepId, setTogglingStepId] = useState(null);

  // Mount logic: Fetch real dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const data = await api.get('/api/dashboard');
        setDashboardData(data);

        // Sync active situation local storage details if returned from server
        if (data && data.activeSituation) {
          saveSituation({
            situation: data.activeSituation.problemType,
            location: data.activeSituation.city,
            agreement: data.activeSituation.hasRentalAgreement,
            urgency: data.activeSituation.urgencyLevel,
            situationId: data.activeSituation.id,
            timestamp: data.activeSituation.timestamp || 'Saved recently',
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getSituationLabel = (sitKey) => {
    switch (sitKey) {
      case 'eviction_notice': return t('intake.q1Option1');
      case 'deposit_withheld': return t('intake.q1Option2');
      case 'rent_hike': return t('intake.q1Option3');
      case 'no_written_agreement': return t('intake.q1Option4');
      case 'gov_housing': return t('intake.q1Option5');
      default: return t('intake.q1Option6');
    }
  };

  const handleResume = () => {
    if (dashboardData?.activeSituation) {
      navigate('/results');
    }
  };

  const handleUpdateSituation = async () => {
    try {
      await api.del('/api/intake/clear');
      clearSituation();
      navigate('/intake');
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message || 'Failed to update situation.', type: 'error' }
      }));
    }
  };

  const handleStartFresh = async () => {
    try {
      setIsResetModalOpen(false);
      await api.del('/api/intake/clear');
      clearSituation();
      navigate('/intake');
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message || 'Failed to start fresh.', type: 'error' }
      }));
    }
  };

  const handleToggleChecklist = async (id, completed) => {
    try {
      setTogglingStepId(id);
      const stepNumber = id.replace('step', '');
      await api.patch(`/api/plan/step/${stepNumber}`, { isCompleted: completed });
      
      // Update local dashboard state
      setDashboardData(prev => {
        const updatedSteps = prev.actionPlan.steps.map(s => {
          if (s.stepNumber.toString() === stepNumber) {
            return { ...s, completed };
          }
          return s;
        });
        return {
          ...prev,
          actionPlan: { ...prev.actionPlan, steps: updatedSteps }
        };
      });

      updatePlanProgress(id, completed);
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message || 'Failed to update step progress.', type: 'error' }
      }));
    } finally {
      setTogglingStepId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 max-w-lg mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  // Map checklist steps
  const actionPlanSteps = (dashboardData?.actionPlan?.steps || []).map(step => ({
    id: `step${step.stepNumber || step.id}`,
    text: step.text,
    completed: !!step.completed
  }));

  const completedStepsCount = actionPlanSteps.filter(s => s.completed).length;
  const totalStepsCount = actionPlanSteps.length;
  const progressPercent = totalStepsCount > 0 ? (completedStepsCount / totalStepsCount) * 100 : 0;

  const savedResources = dashboardData?.savedResources || [];
  const activeSituation = dashboardData?.activeSituation;

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-lg mx-auto space-y-5 pb-10 select-none">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-textPrimary tracking-tight">
          {t('dash.title')}
        </h1>
        <p className="text-sm text-textMuted mt-1 font-semibold">
          {t('dash.subtitle')}
        </p>
      </div>

      {/* Section 1: Active Situation Card */}
      <div>
        <h2 className="text-[11px] font-extrabold text-textMuted uppercase tracking-wider mb-2.5">
          {t('dash.activeSituation')}
        </h2>
        {activeSituation ? (
          <Card padding="p-4">
            <div className="flex justify-between items-start mb-2.5">
              <h3 className="text-[14px] font-extrabold text-textPrimary leading-snug">
                {getSituationLabel(activeSituation.problemType)}
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-textMuted font-bold">
                <Clock size={12} />
                <span>{activeSituation.timestamp || 'Saved recently'}</span>
              </div>
            </div>
            <p className="text-xs text-textMuted font-semibold mb-4">
              {activeSituation.summaryText || `Location: ${activeSituation.city}`}
            </p>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={handleResume}
            >
              {t('dash.resumeCta')}
            </Button>
          </Card>
        ) : (
          <Card padding="p-4" className="text-center py-6">
            <AlertCircle size={24} className="text-textMuted mx-auto mb-2" />
            <p className="text-xs font-semibold text-textMuted mb-4">
              You haven't told us your situation yet.
            </p>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => navigate('/intake')}
            >
              Get Started
            </Button>
          </Card>
        )}
      </div>

      {/* Section 2: Action Plan Progress */}
      {activeSituation && actionPlanSteps.length > 0 && (
        <div>
          <h2 className="text-[11px] font-extrabold text-textMuted uppercase tracking-wider mb-2.5">
            {t('dash.progressHeader')}
          </h2>
          <Card padding="p-4">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-bold text-textPrimary">
                {t('dash.stepsCompleted', { completed: completedStepsCount, total: totalStepsCount })}
              </span>
              <span className="text-xs font-extrabold text-success">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <ProgressBar
              value={progressPercent}
              color="bg-success"
              height="h-2 mb-5"
            />
            <StepChecklist
              steps={actionPlanSteps}
              onToggle={handleToggleChecklist}
              loadingStepId={togglingStepId}
            />
          </Card>
        </div>
      )}

      {/* Section 3: Saved Resources */}
      <div>
        <h2 className="text-[11px] font-extrabold text-textMuted uppercase tracking-wider mb-2.5">
          {t('dash.savedResources')}
        </h2>
        {savedResources.length > 0 ? (
          <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-none snap-x">
            {savedResources.map((res) => (
              <div
                key={res.id}
                onClick={() => navigate('/resources')}
                className="w-44 h-20 border border-gray-200 rounded-xl bg-white p-3 shrink-0 flex flex-col justify-between hover:border-primary cursor-pointer transition-all duration-200 snap-center shadow-sm"
              >
                <div className="flex items-start gap-1.5">
                  <BookOpen size={14} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-xs font-bold text-textPrimary line-clamp-2 leading-tight">
                    {res.title}
                  </span>
                </div>
                <div className="flex justify-end items-center text-[10px] text-primary font-bold">
                  <span>View</span>
                  <ChevronRight size={10} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card padding="p-4" className="text-center py-6">
            <p className="text-xs font-semibold text-textMuted leading-relaxed max-w-xs mx-auto">
              {t('dash.emptyResources')}
            </p>
          </Card>
        )}
      </div>

      {/* Bottom Management Controls */}
      {activeSituation && (
        <div className="space-y-2 border-t border-gray-150 pt-5 mt-3 select-none">
          <Button
            variant="outlined"
            size="md"
            fullWidth
            onClick={handleUpdateSituation}
          >
            {t('dash.updateCta')}
          </Button>

          <Button
            variant="text"
            size="md"
            fullWidth
            onClick={() => setIsResetModalOpen(true)}
            className="text-textMuted hover:text-danger hover:bg-red-50"
          >
            {t('dash.startNewCta')}
          </Button>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Reset"
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold text-textPrimary leading-relaxed">
            {t('dash.modalTitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={handleStartFresh}
            >
              {t('dash.modalYes')}
            </Button>
            <Button
              variant="outlined"
              size="md"
              fullWidth
              onClick={() => setIsResetModalOpen(false)}
            >
              {t('dash.modalCancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
