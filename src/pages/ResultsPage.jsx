import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Info, List, CheckSquare, Share2, AlertTriangle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import StepChecklist from '../components/common/StepChecklist';
import SourcePill from '../components/common/SourcePill';
import ExpandableRow from '../components/common/ExpandableRow';

const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse select-none">
    {[1, 2, 3].map((n) => (
      <div key={n} className="bg-white border border-gray-150 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="h-4 bg-gray-200 rounded-md w-1/3" />
        <div className="h-3.5 bg-gray-200 rounded-md w-full" />
        <div className="h-3.5 bg-gray-200 rounded-md w-5/6" />
        <div className="h-3.5 bg-gray-200 rounded-md w-2/3" />
      </div>
    ))}
  </div>
);

const ResultsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    savedSituation,
    actionPlanProgress,
    updatePlanProgress,
    isLoggedIn,
    isGuest,
    clearSituation,
  } = useAuth();

  // API Plan State
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Toast State
  const [activeModal, setActiveModal] = useState(null); // 'source' | 'share' | 'optionDetails' | null
  const [selectedOptionTitle, setSelectedOptionTitle] = useState('');
  const [selectedOptionText, setSelectedOptionText] = useState('');
  const [togglingStepId, setTogglingStepId] = useState(null);

  // Local fallback state
  const mockSituation = savedSituation || {
    situation: 'eviction',
    otherSituation: '',
    location: 'Delhi',
    otherLocation: '',
    agreement: 'no',
    urgency: 'urgent',
  };

  // Mount logic: Fetch plan from backend
  useEffect(() => {
    const fetchPlan = async () => {
      if (!isLoggedIn) return;
      try {
        setIsLoading(true);
        const data = await api.get('/api/plan/current');
        if (data) {
          setPlanData(data);
          // Sync backend checklist completion state to context
          if (data.actionPlan) {
            data.actionPlan.forEach((step) => {
              updatePlanProgress(`step${step.stepNumber || step.id}`, !!step.completed);
            });
          }
        }
      } catch (err) {
        console.error('Failed to load plan from server:', err);
        // Fall back to rule-based mock
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [isLoggedIn]);

  const getSituationLabel = () => {
    switch (mockSituation.situation) {
      case 'eviction': return t('intake.q1Option1');
      case 'deposit': return t('intake.q1Option2');
      case 'rent_hike': return t('intake.q1Option3');
      case 'no_agreement': return t('intake.q1Option4');
      case 'gov_housing': return t('intake.q1Option5');
      default: return mockSituation.otherSituation || t('intake.q1Option6');
    }
  };

  const getAgreementLabel = () => {
    switch (mockSituation.agreement) {
      case 'yes': return t('intake.q3Option1');
      case 'no': return t('intake.q3Option2');
      default: return t('intake.q3Option3');
    }
  };

  const getUrgencyLabel = () => {
    switch (mockSituation.urgency) {
      case 'urgent': return t('intake.q4Option1');
      case 'soon': return t('intake.q4Option2');
      default: return t('intake.q4Option3');
    }
  };

  // Rule-based fallback interpreter
  const getInterpretationText = () => {
    const city = mockSituation.location === 'other' ? mockSituation.otherLocation : mockSituation.location;
    if (mockSituation.situation === 'eviction') {
      if (mockSituation.agreement === 'no') {
        return `Since you are in ${city} and do not have a written agreement, you are still protected under local tenancy regulations. Proving the terms of tenancy might require utility bills, rent receipts, or chats. Under general housing laws, a landlord cannot evict you without a valid legal reason and a formal notice period.`;
      }
      return `As you are in ${city} and have a written agreement, your rights are dictated by the terms of the lease and the local Rent Control Act. Your landlord must provide a formal written notice of eviction specifying the grounds (e.g. non-payment of rent, owner's personal use) before taking legal action.`;
    }
    if (mockSituation.situation === 'rent_hike') {
      return `Under standard state rent control laws, landlords are capped on how much they can increase rent annually (typically 5-10% depending on the state). Arbitrary hikes exceeding the agreed-upon lease terms or state limits are illegal and can be disputed.`;
    }
    if (mockSituation.situation === 'deposit') {
      return `Security deposits must be refunded within the period stipulated in the contract (usually 30 days of moving out). Landlords can only deduct for structural damage, not normal wear and tear. You can claim the refund through a legal demand notice.`;
    }
    return `Your housing situation in ${city} falls under general urban tenancy guidelines. Tenancy rules require mutual consent for lease terminations, eviction notices, and rent adjustment schedules.`;
  };

  const getSourceLabel = () => {
    const city = mockSituation.location === 'other' ? mockSituation.otherLocation : mockSituation.location;
    if (city.toLowerCase() === 'delhi') {
      return 'Delhi Rent Control Act, 1958';
    }
    if (city.toLowerCase() === 'mumbai' || city.toLowerCase() === 'pune') {
      return 'Maharashtra Rent Control Act, 1999';
    }
    if (city.toLowerCase() === 'bengluru' || city.toLowerCase() === 'bengaluru') {
      return 'Karnataka Rent Control Act, 1999';
    }
    return 'State Rent Control Act & Model Tenancy Act';
  };

  const getSourceDescription = () => {
    const source = getSourceLabel();
    return `The ${source} regulates the relationship between landlords and tenants. It outlines tenant rights, protects tenants against arbitrary rent increases, provides safeguards against illegal evictions without a court decree, and details the responsibilities for building repairs.`;
  };

  // Compile checklist items (dynamic API data or local mock)
  const getActionPlanSteps = () => {
    if (planData && planData.actionPlan) {
      return planData.actionPlan.map(step => ({
        id: `step${step.stepNumber || step.id}`,
        text: step.text,
        completed: !!actionPlanProgress[`step${step.stepNumber || step.id}`]
      }));
    }

    return [
      { id: 'step1', text: 'Collect all lease documents, communication logs (emails, WhatsApp threads), and payment history.', completed: !!actionPlanProgress['step1'] },
      { id: 'step2', text: 'Write down a detailed, dated timeline of the events leading to the current housing issue.', completed: !!actionPlanProgress['step2'] },
      { id: 'step3', text: 'Identify the nearest Free Legal Aid Clinic or Rent Authority office in your district.', completed: !!actionPlanProgress['step3'] },
      { id: 'step4', text: 'Draft a formal response letter addressing the landlord\'s claims (consulting an advisor if needed).', completed: !!actionPlanProgress['step4'] },
    ];
  };

  const handleToggleChecklist = async (id, completed) => {
    if (!isLoggedIn) {
      // Guest users: update local storage progress only
      updatePlanProgress(id, completed);
      return;
    }

    try {
      setTogglingStepId(id);
      const stepNumber = id.replace('step', '');
      await api.patch(`/api/plan/step/${stepNumber}`, { isCompleted: completed });
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

  // Card 1: Clear / Edit Intake
  const handleClearIntake = async () => {
    try {
      if (isLoggedIn) {
        await api.del('/api/intake/clear');
      }
      clearSituation();
      navigate('/intake');
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message || 'Failed to clear situation.', type: 'error' }
      }));
    }
  };

  // Save or Share Trigger
  const handleCopyLink = () => {
    const currentUrl = window.location.origin + '/results';
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        const copySuccessText = i18n.language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Link copied!';
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: copySuccessText, type: 'success' }
        }));
        setActiveModal(null);
      })
      .catch(() => {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Failed to copy link.', type: 'error' }
        }));
      });
  };

  const handleDownloadPdf = () => {
    const activePlan = planData || {
      interpretation: getInterpretationText(),
      actionPlan: getActionPlanSteps(),
      source: { title: getSourceLabel(), sourceUrl: 'https://indiacode.nic.in' }
    };

    const doc = new jsPDF();
    let y = 20;

    const checkPageOverflow = (heightNeeded) => {
      if (y + heightNeeded > 275) {
        doc.addPage();
        y = 20;
      }
    };

    // Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(26, 86, 219);
    doc.text("ClearPath India - Custom Action Plan", 14, y);
    doc.setDrawColor(26, 86, 219);
    doc.setLineWidth(0.5);
    doc.line(14, y + 5, 196, y + 5);
    y += 15;

    // Situation Summary
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text("SITUATION SUMMARY", 14, y);
    y += 7;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(`- Issue: ${getSituationLabel()}`, 16, y);
    y += 6;
    doc.text(`- City: ${mockSituation.location === 'other' ? mockSituation.otherLocation : mockSituation.location}`, 16, y);
    y += 6;
    doc.text(`- Rental Agreement: ${getAgreementLabel()}`, 16, y);
    y += 6;
    doc.text(`- Urgency: ${getUrgencyLabel()}`, 16, y);
    y += 12;

    // Legal Interpretation
    checkPageOverflow(30);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text("LEGAL INTERPRETATION", 14, y);
    y += 7;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const interpLines = doc.splitTextToSize(activePlan.interpretation, 180);
    
    interpLines.forEach((line) => {
      checkPageOverflow(6);
      doc.text(line, 14, y);
      y += 5;
    });
    y += 8;

    // Action Steps
    checkPageOverflow(30);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text("RECOMMENDED ACTION STEPS", 14, y);
    y += 7;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    if (activePlan.actionPlan) {
      activePlan.actionPlan.forEach((step, idx) => {
        const stepText = `${idx + 1}. ${step.text}`;
        const stepLines = doc.splitTextToSize(stepText, 180);
        stepLines.forEach((line) => {
          checkPageOverflow(6);
          doc.text(line, 14, y);
          y += 5;
        });
        y += 2;
      });
    }
    y += 6;

    // Statutory Law
    checkPageOverflow(30);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text("APPLICABLE STATUTORY LAW", 14, y);
    y += 7;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(`- Source: ${activePlan.source?.title || 'Rent Control Act'}`, 14, y);
    y += 5;
    doc.text(`- Reference URL: ${activePlan.source?.sourceUrl || 'https://indiacode.nic.in'}`, 14, y);
    y += 12;

    // Footer Divider & Disclaimer
    checkPageOverflow(25);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text("Helpline: 1516 (Delhi DLSA) / 15100 (National NALSA)", 14, y);
    doc.text("This action plan was compiled dynamically by ClearPath India for informational purposes.", 14, y + 5);

    doc.save("ClearPath_Action_Plan.pdf");

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Action plan PDF download initiated.', type: 'success' }
    }));
    setActiveModal(null);
  };

  const handleOptionCta = (optionTitle, ctaType) => {
    if (ctaType === 'help') {
      navigate('/help');
    } else if (ctaType === 'resources') {
      navigate('/resources');
    } else {
      setSelectedOptionTitle(optionTitle);
      setSelectedOptionText(`You can check more details about ${optionTitle} in the Resource library or speak to a Legal Aid representative.`);
      setActiveModal('optionDetails');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 max-w-lg mx-auto">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-lg mx-auto space-y-4 select-none">
      <h1 className="text-xl font-extrabold text-textPrimary tracking-tight">
        {t('results.title')}
      </h1>

      {/* Card 1: Your Situation Summary */}
      <Card padding="p-4" className="relative">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 text-textMuted text-xs font-bold uppercase tracking-wider">
            <FileText size={15} />
            <span>{t('results.situationHeader')}</span>
          </div>
          <button
            onClick={handleClearIntake}
            className="text-xs font-bold text-primary hover:underline hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-all"
          >
            {t('results.edit')}
          </button>
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm font-semibold text-textPrimary">
          <p>• {getSituationLabel()}</p>
          <p>• Location: {mockSituation.location === 'other' ? mockSituation.otherLocation : mockSituation.location}</p>
          <p>• Agreement: {getAgreementLabel()}</p>
          <p>• Urgency: {getUrgencyLabel()}</p>
        </div>
      </Card>

      {/* Card 2: What This Means For You */}
      <Card padding="p-4" background="bg-blue-50/50" borderColor="border-blue-150">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2.5">
          <Info size={15} className="text-primary" />
          <span>{t('results.meansHeader')}</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-textPrimary font-semibold mb-3">
          {planData?.interpretation || getInterpretationText()}
        </p>
        <div className="flex flex-col gap-2.5">
          <div>
            <SourcePill
              label={planData?.source?.title || getSourceLabel()}
              onClick={() => setActiveModal('source')}
            />
          </div>
          <p className="text-[10px] font-semibold text-textMuted leading-tight">
            {t('results.disclaimer')}
          </p>
        </div>
      </Card>

      {/* Card 3: Options Available to You */}
      <Card padding="p-4">
        <div className="flex items-center gap-2 text-textMuted text-xs font-bold uppercase tracking-wider mb-2">
          <List size={15} />
          <span>{t('results.optionsHeader')}</span>
        </div>
        <div className="divide-y divide-gray-150">
          {(planData?.options || [
            { id: 'legal_aid', title: t('results.optionsLegalAid'), description: 'Every district in India has a free legal aid centre under NALSA. You are entitled to free legal help.', cta: 'Find Nearest Centre', ctaType: 'help' },
            { id: 'complaint', title: t('results.optionsComplaint'), description: 'Approach your local Rent Authority or Rent Tribunal to file a dispute regarding tenancy notice breaches.', cta: 'See Steps', ctaType: 'details' },
            { id: 'pmay', title: t('results.optionsPmay'), description: 'Pradhan Mantri Awas Yojana (PMAY) provides affordable housing credit subsidies to low-to-middle income groups.', cta: 'Check Eligibility', ctaType: 'resources' },
            { id: 'guide', title: t('results.optionsGuide'), description: 'Read our tenant rights handbook detailing notice periods, locks, and essential utilities protection laws.', cta: 'Read Guide', ctaType: 'resources' }
          ]).map((opt) => (
            <ExpandableRow key={opt.id || opt.title} title={opt.title}>
              <p className="mb-2 text-xs">
                {opt.description}
              </p>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => handleOptionCta(opt.title, opt.ctaType)}
              >
                {opt.cta || 'Details'}
              </Button>
            </ExpandableRow>
          ))}
        </div>
      </Card>

      {/* Guest Soft Sign Up Upgrade Banner */}
      {isGuest && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col gap-3 animate-fade-in shadow-sm">
          <div className="flex gap-2 text-yellow-800">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold leading-relaxed">
              Save your action plan so you don't lose it. Create a free account in 10 seconds.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/auth/signup')}
              className="text-xs h-9"
            >
              Create Account
            </Button>
          </div>
        </div>
      )}

      {/* Card 4: Your Action Plan */}
      <Card padding="p-4">
        <div className="flex items-center gap-2 text-success text-xs font-bold uppercase tracking-wider mb-3.5">
          <CheckSquare size={15} />
          <span>{t('results.actionHeader')}</span>
        </div>
        
        <StepChecklist
          steps={getActionPlanSteps()}
          onToggle={handleToggleChecklist}
          loadingStepId={togglingStepId}
        />

        <div className="mt-6 border-t border-gray-100 pt-5">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setActiveModal('share')}
            className="!bg-accent hover:!bg-orange-600 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20"
          >
            <Share2 size={16} className="mr-2" />
            {t('results.saveShare')}
          </Button>
        </div>
      </Card>

      {/* Source Details Modal */}
      <Modal
        isOpen={activeModal === 'source'}
        onClose={() => setActiveModal(null)}
        title={planData?.source?.title || getSourceLabel()}
      >
        <p className="text-sm text-textPrimary font-semibold mb-3">Statutory Protection Details</p>
        <p>{planData?.source?.description || getSourceDescription()}</p>
        <p className="mt-2.5">
          This legislation provides that tenants cannot be summarily evicted. A landlord must petition the Rent Authority and prove specific statutory defaults (like non-payment of rent, subletting without consent, or causing structural damage).
        </p>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={activeModal === 'share'}
        onClose={() => setActiveModal(null)}
        title={t('results.saveShare')}
      >
        <div className="space-y-3.5">
          <p className="text-xs font-semibold text-textMuted mb-2">
            Save this plan to your device or copy the link to share.
          </p>
          <Button
            variant="outlined"
            size="md"
            fullWidth
            onClick={handleCopyLink}
          >
            Copy Plan Link
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleDownloadPdf}
          >
            Download Plan as PDF
          </Button>
        </div>
      </Modal>

      {/* Option Details Modal */}
      <Modal
        isOpen={activeModal === 'optionDetails'}
        onClose={() => setActiveModal(null)}
        title={selectedOptionTitle}
      >
        <p className="mb-3">{selectedOptionText}</p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setActiveModal(null)}
        >
          Close
        </Button>
      </Modal>
    </div>
  );
};

export default ResultsPage;
