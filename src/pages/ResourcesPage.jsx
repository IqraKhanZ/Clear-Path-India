import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Scale, Shield, TrendingUp, Home, BookOpen, Download, Bookmark, BookmarkCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ExpandableRow from '../components/common/ExpandableRow';

const SkeletonCard = () => (
  <div className="bg-white border border-gray-150 rounded-xl p-4 w-40 h-[120px] shrink-0 animate-pulse shadow-sm">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
    <div className="h-3.5 bg-gray-200 rounded w-full mb-1.5" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
  </div>
);

const ResourcesPage = () => {
  const { t, i18n } = useTranslation();
  const { isLoggedIn, savedResources, toggleSaveResource, savedSituation } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [activeModal, setActiveModal] = useState(null); // 'article' | 'pmay_calc' | 'referrals' | null
  const [selectedArticle, setSelectedArticle] = useState({ title: '', content: '' });
  const [referralList, setReferralList] = useState([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);

  // Calculator State
  const [householdIncome, setHouseholdIncome] = useState('');
  const [pmayEligibility, setPmayEligibility] = useState(null);

  // Document checklist local state
  const [docStates, setDocStates] = useState({
    agreement: false,
    aadhaar: false,
    receipts: false,
    chat_logs: false,
    bank: false,
  });

  const toggleDoc = (key) => {
    setDocStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch resources with search query debouncing
  const fetchResources = async (query = '') => {
    try {
      setIsLoading(true);
      const lang = i18n.language || 'en';
      const path = query.trim() 
        ? `/api/resources?search=${encodeURIComponent(query.trim())}&lang=${lang}` 
        : `/api/resources?lang=${lang}`;
      
      const data = await api.get(path);
      setResources(data || []);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchResources(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, i18n.language]);

  const handleReadRight = (title, content) => {
    setSelectedArticle({ title, content });
    setActiveModal('article');
  };

  const handlePmayCalcSubmit = (e) => {
    e.preventDefault();
    const income = parseFloat(householdIncome);
    if (isNaN(income) || income < 0) {
      setPmayEligibility('invalid');
      return;
    }
    if (income <= 300000) {
      setPmayEligibility('EWS (Economically Weaker Section) - Eligible for maximum interest subsidy of 6.5% and direct credit assistance.');
    } else if (income <= 600000) {
      setPmayEligibility('LIG (Low Income Group) - Eligible for interest subsidy of 6.5% on housing loans up to ₹6 Lakh.');
    } else if (income <= 1200000) {
      setPmayEligibility('MIG I (Middle Income Group I) - Eligible for interest subsidy of 4.0% on housing loans up to ₹9 Lakh.');
    } else if (income <= 1800000) {
      setPmayEligibility('MIG II (Middle Income Group II) - Eligible for interest subsidy of 3.0% on housing loans up to ₹12 Lakh.');
    } else {
      setPmayEligibility('Not eligible under income categories (Income exceeds ₹18 Lakh/year).');
    }
  };

  const handleDownloadChecklist = () => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(26, 86, 219); // Primary blue
    doc.text("ClearPath India - Document Checklist", 14, 20);
    doc.setDrawColor(26, 86, 219);
    doc.setLineWidth(0.5);
    doc.line(14, 25, 196, 25);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Please gather the following documents for your housing dispute:", 14, 34);

    let y = 45;
    const items = [
      { title: "1. RENTAL AGREEMENT", desc: "Original signed copy, mapped register copies, and identity proofs." },
      { title: "2. RENT RECEIPTS & TRANSFERS", desc: "Bank statement transaction history, UPI netbanking receipts." },
      { title: "3. LANDLORD COMMUNICATIONS", desc: "WhatsApp conversation transcripts, email logs, written notice slips." },
      { title: "4. UTILITY BILL COPIES", desc: "Electricity/water bills, maintenance payments, or NOC cards." }
    ];

    items.forEach((item) => {
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(17, 24, 39); // Dark primary text
      doc.text(item.title, 14, y);
      y += 6;
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(75, 85, 99); // Gray body text
      doc.text(item.desc, 14, y);
      y += 12;
    });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, 196, y);
    y += 10;

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("Helpline: 1516 (Delhi DLSA) / 15100 (National NALSA)", 14, y);
    doc.text("This document is for information and general guidance only.", 14, y + 6);

    doc.save("ClearPath_Document_Checklist.pdf");

    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Document checklist PDF download initiated.', type: 'success' }
    }));
  };

  // Bookmark Toggle
  const handleToggleBookmark = async (resource) => {
    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Create a free account to save resources.', type: 'warning' }
      }));
      return;
    }

    const isBookmarked = savedResources.some(r => r.id === resource.id);
    try {
      if (isBookmarked) {
        await api.del(`/api/resources/bookmark/${resource.id}`);
      } else {
        await api.post(`/api/resources/bookmark/${resource.id}`);
      }
      toggleSaveResource(resource);
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message || 'Failed to toggle bookmark.', type: 'error' }
      }));
    }
  };

  // Legal Aid Referral Modal Search
  const handleFindNearestCentre = async () => {
    const userCity = savedSituation?.location === 'other' ? savedSituation.otherLocation : savedSituation?.location;
    if (!userCity) {
      // User has no saved location in context
      setReferralList([]);
      setActiveModal('referrals');
      return;
    }

    try {
      setIsLoadingReferrals(true);
      setActiveModal('referrals');
      const data = await api.get(`/api/resources/referrals?type=legal_aid&city=${encodeURIComponent(userCity)}`);
      setReferralList(data || []);
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message || 'Failed to load referral centres.', type: 'error' }
      }));
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  // Mapped topics
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Scale': return Scale;
      case 'Shield': return Shield;
      case 'TrendingUp': return TrendingUp;
      default: return Home;
    }
  };

  const rights = resources.filter(r => r.category === 'rights');
  const schemes = resources.filter(r => r.category === 'scheme');
  const glossary = resources.filter(r => r.category === 'glossary');

  return (
    <div className="min-h-screen bg-background px-4 py-6 max-w-lg mx-auto space-y-6 pb-12 select-none">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-textPrimary tracking-tight">
          {t('res.title')}
        </h1>
        <div className="relative mt-3 select-none">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder={t('res.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 border border-gray-255 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="flex gap-3 overflow-x-auto pb-2">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        </div>
      ) : (
        <>
          {resources.length === 0 && searchQuery.trim() !== '' ? (
            <div className="text-center py-10 bg-white border border-gray-150 rounded-2xl">
              <BookOpen size={32} className="text-textMuted mx-auto mb-2" />
              <p className="text-sm font-semibold text-textMuted leading-relaxed">
                {i18n.language === 'hi' ? 'खोज के लिए कोई परिणाम नहीं मिला।' : 'No results found for your search.'}
              </p>
            </div>
          ) : (
            <>
              {/* Section 1: Know Your Rights */}
              {rights.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-extrabold text-textMuted uppercase tracking-wider mb-2.5">
                    {t('res.rightsHeader')}
                  </h2>
                  <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-none snap-x">
                    {rights.map(art => {
                      const ArtIcon = getIcon(art.iconName);
                      const isBookmarked = savedResources.some(r => r.id === art.id);
                      
                      return (
                        <div
                          key={art.id}
                          className="w-40 h-[120px] border border-gray-200 rounded-xl bg-white p-3 shrink-0 flex flex-col justify-between hover:border-primary snap-center shadow-sm relative group"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(art)}
                            className="absolute top-2.5 right-2.5 text-textMuted hover:text-primary transition-colors focus:outline-none"
                            aria-label="Bookmark resource"
                          >
                            {isBookmarked ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} />}
                          </button>
                          <div>
                            <ArtIcon size={16} className="text-primary mb-1 shrink-0" />
                            <h3 className="text-xs font-bold text-textPrimary leading-tight line-clamp-2 pr-4">
                              {art.title}
                            </h3>
                          </div>
                          <button
                            onClick={() => handleReadRight(art.title, art.content)}
                            className="text-[11px] font-extrabold text-primary hover:underline text-left"
                          >
                            {t('res.readBtn')} →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: Government Schemes */}
              {schemes.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-extrabold text-textMuted uppercase tracking-wider mb-2.5">
                    {t('res.schemesHeader')}
                  </h2>
                  <div className="space-y-3">
                    {schemes.map(sch => {
                      const isBookmarked = savedResources.some(r => r.id === sch.id);
                      return (
                        <Card key={sch.id} padding="p-4" className="bg-white relative">
                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(sch)}
                            className="absolute top-3.5 right-3.5 text-textMuted hover:text-primary transition-colors focus:outline-none"
                            aria-label="Bookmark scheme"
                          >
                            {isBookmarked ? <BookmarkCheck size={16} className="text-primary" /> : <Bookmark size={16} />}
                          </button>
                          <h3 className="text-sm font-bold text-textPrimary leading-snug pr-6">{sch.name || sch.title}</h3>
                          <p className="text-xs text-textMuted leading-relaxed mt-1 font-semibold">{sch.desc || sch.summary}</p>
                          <div className="mt-3 flex items-center justify-between gap-2.5">
                            <span className="text-[10px] font-extrabold text-primary bg-blue-50 border border-blue-100 rounded-md px-2.5 py-1">
                              {sch.eligibility}
                            </span>
                            {sch.id === 'pmay' && (
                              <Button
                                variant="outlined"
                                size="sm"
                                onClick={() => {
                                  setPmayEligibility(null);
                                  setHouseholdIncome('');
                                  setActiveModal('pmay_calc');
                                }}
                                className="text-xs h-8 py-1.5 font-semibold"
                              >
                                {t('res.checkEligibility')}
                              </Button>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 3: Document Checklist (only shown if not actively searching) */}
              {searchQuery === '' && (
                <div>
                  <h2 className="text-[11px] font-extrabold text-textMuted uppercase tracking-wider mb-2.5">
                    {t('res.docChecklistHeader')}
                  </h2>
                  <Card padding="p-4" className="bg-white">
                    <div className="space-y-3 select-none">
                      {[
                        { key: 'agreement', text: 'Rental Agreement (original or photocopy)' },
                        { key: 'aadhaar', text: 'Aadhaar Card (identity proof)' },
                        { key: 'receipts', text: 'Rent Receipts / Bank Transfer Proofs' },
                        { key: 'chat_logs', text: 'Communication Records (WhatsApp, Emails)' },
                        { key: 'bank', text: 'Bank Statements showing rental transactions' },
                      ].map(doc => (
                        <div
                          key={doc.key}
                          onClick={() => toggleDoc(doc.key)}
                          className="flex items-center gap-3.5 cursor-pointer group"
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                              docStates[doc.key]
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-300 bg-white group-hover:border-primary'
                            }`}
                          >
                            {docStates[doc.key] && (
                              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-xs sm:text-sm transition-colors duration-200 ${
                              docStates[doc.key] ? 'text-textMuted line-through font-semibold' : 'text-textPrimary font-semibold'
                            }`}
                          >
                            {doc.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <Button
                        variant="outlined"
                        size="md"
                        fullWidth
                        onClick={handleDownloadChecklist}
                        className="text-xs"
                      >
                        <Download size={14} className="mr-1.5" />
                        {t('res.downloadChecklist')}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Section 4: Glossary */}
              {glossary.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-extrabold text-textMuted uppercase tracking-wider mb-2.5">
                    {t('res.glossaryHeader')}
                  </h2>
                  <Card padding="px-4 py-1" className="bg-white">
                    <div className="divide-y divide-gray-150">
                      {glossary.map(item => (
                        <ExpandableRow key={item.term || item.title} title={item.term || item.title} className="py-2.5">
                          <p className="text-xs sm:text-sm leading-relaxed text-textMuted">
                            {item.definition || item.content}
                          </p>
                        </ExpandableRow>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Details Article Modal */}
      <Modal
        isOpen={activeModal === 'article'}
        onClose={() => setActiveModal(null)}
        title={selectedArticle.title}
      >
        <p className="text-sm text-textPrimary leading-relaxed whitespace-pre-line font-medium">
          {selectedArticle.content}
        </p>
        <div className="mt-5 border-t border-gray-100 pt-3.5 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setActiveModal(null)}>
            Done
          </Button>
        </div>
      </Modal>

      {/* PMAY Calculator Modal */}
      <Modal
        isOpen={activeModal === 'pmay_calc'}
        onClose={() => setActiveModal(null)}
        title="PMAY Eligibility Calculator"
      >
        <form onSubmit={handlePmayCalcSubmit} className="space-y-4">
          <p className="text-xs text-textMuted font-semibold leading-relaxed">
            Enter your total annual household income (including income from all members/sources) to calculate your subsidy eligibility category.
          </p>
          <div>
            <label htmlFor="res-calc-income" className="sr-only">Annual Household Income</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-textMuted select-none">
                ₹
              </span>
              <input
                id="res-calc-income"
                type="number"
                required
                min="0"
                placeholder="e.g. 350000"
                value={householdIncome}
                onChange={(e) => {
                  setHouseholdIncome(e.target.value);
                  setPmayEligibility(null);
                }}
                className="w-full h-11 border border-gray-250 rounded-xl pl-9 pr-4 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" fullWidth size="md">
            Calculate Eligibility
          </Button>

          {pmayEligibility && (
            <div className="border border-blue-150 bg-blue-50/60 rounded-xl p-3.5 mt-3 animate-fade-in">
              <p className="text-xs font-bold text-primary mb-1">Calculation Results:</p>
              <p className="text-xs text-textPrimary font-semibold leading-relaxed">{pmayEligibility}</p>
            </div>
          )}
        </form>
      </Modal>

      {/* Referrals Search Results Modal */}
      <Modal
        isOpen={activeModal === 'referrals'}
        onClose={() => setActiveModal(null)}
        title="Legal Aid Referrals"
      >
        {isLoadingReferrals ? (
          <div className="flex justify-center py-6">
            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <div className="space-y-3.5">
            {referralList.length === 0 ? (
              <p className="text-xs text-textMuted italic">No centers found for your active location.</p>
            ) : (
              <div className="divide-y divide-gray-150 max-h-60 overflow-y-auto">
                {referralList.map((ref, idx) => (
                  <div key={idx} className="py-2.5 space-y-1">
                    <p className="text-xs font-bold text-textPrimary">{ref.name}</p>
                    <p className="text-[11px] text-textMuted">{ref.address}</p>
                    <p className="text-[11px] text-primary font-bold">Phone: {ref.phone}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-3.5 border-t border-gray-100">
              <Button variant="primary" size="sm" onClick={() => setActiveModal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResourcesPage;
