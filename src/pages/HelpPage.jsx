import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Scale, Heart, Building, Phone, Globe, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const HelpPage = () => {
  const { t } = useTranslation();
  const { savedSituation } = useAuth();

  const [activeModal, setActiveModal] = useState(null); // 'legal_aid' | 'ngo' | 'rent_authority' | null
  const [referralType, setReferralType] = useState('');
  const [referralsList, setReferralsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [showCityInput, setShowCityInput] = useState(false);

  const handleFetchReferrals = async (type) => {
    const contextCity = savedSituation?.location === 'other' ? savedSituation.otherLocation : savedSituation?.location;
    
    // Check if city parameter is required and missing
    if (type !== 'ngo' && !contextCity && !cityInput) {
      setReferralType(type);
      setReferralsList([]);
      setShowCityInput(true);
      setActiveModal(type);
      return;
    }

    try {
      setIsLoading(true);
      setReferralType(type);
      setActiveModal(type);
      
      const targetCity = contextCity || cityInput;
      let path = `/api/resources/referrals?type=${type}`;
      if (type !== 'ngo') {
        path += `&city=${encodeURIComponent(targetCity)}`;
      }

      const data = await api.get(path);
      setReferralsList(data || []);
      setShowCityInput(false);
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message || 'Failed to fetch referrals.', type: 'error' }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setActiveModal(null);
    setShowCityInput(false);
    setCityInput('');
    setReferralsList([]);
  };

  const getModalTitle = () => {
    if (referralType === 'legal_aid') return t('help.card1Title');
    if (referralType === 'ngo') return t('help.card2Title');
    return t('help.card3Title');
  };

  return (
    <div className="min-h-screen bg-background pb-12 select-none">
      {/* Top Banner Alert */}
      <div className="bg-amber-50 border-b border-amber-200 py-3.5 px-4 flex items-start gap-3 select-none">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5 animate-bounce" />
        <p className="text-xs sm:text-sm font-semibold text-amber-800 leading-snug">
          {t('help.banner')}
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 mt-5 space-y-4">
        {/* Card 1: NALSA Legal Aid */}
        <Card padding="p-4" className="border-l-4 border-l-primary border-y-gray-200 border-r-gray-200 bg-white">
          <div className="flex gap-3">
            <div className="p-2.5 bg-blue-50 text-primary rounded-xl h-fit shrink-0">
              <Scale size={20} />
            </div>
            <div className="space-y-1">
              <h2 className="text-[15px] font-extrabold text-textPrimary leading-snug">
                {t('help.card1Title')}
              </h2>
              <p className="text-xs leading-relaxed text-textMuted font-semibold">
                {t('help.card1Desc')}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => handleFetchReferrals('legal_aid')}
              className="text-xs h-9 font-semibold"
            >
              {t('help.card1Cta')}
            </Button>
          </div>
        </Card>

        {/* Card 2: NGOs */}
        <Card padding="p-4" className="border-l-4 border-l-success border-y-gray-200 border-r-gray-200 bg-white">
          <div className="flex gap-3">
            <div className="p-2.5 bg-green-50 text-success rounded-xl h-fit shrink-0">
              <Heart size={20} />
            </div>
            <div className="space-y-1">
              <h2 className="text-[15px] font-extrabold text-textPrimary leading-snug">
                {t('help.card2Title')}
              </h2>
              <p className="text-xs leading-relaxed text-textMuted font-semibold">
                {t('help.card2Desc')}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => handleFetchReferrals('ngo')}
              className="text-xs h-9 font-semibold"
            >
              {t('help.card2Cta')}
            </Button>
          </div>
        </Card>

        {/* Card 3: Rent Authority */}
        <Card padding="p-4" className="border-l-4 border-l-accent border-y-gray-200 border-r-gray-200 bg-white">
          <div className="flex gap-3">
            <div className="p-2.5 bg-orange-50 text-accent rounded-xl h-fit shrink-0">
              <Building size={20} />
            </div>
            <div className="space-y-1">
              <h2 className="text-[15px] font-extrabold text-textPrimary leading-snug">
                {t('help.card3Title')}
              </h2>
              <p className="text-xs leading-relaxed text-textMuted font-semibold">
                {t('help.card3Desc')}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outlined"
              size="sm"
              onClick={() => handleFetchReferrals('rent_authority')}
              className="text-xs h-9 font-semibold"
            >
              {t('help.card3Cta')}
            </Button>
          </div>
        </Card>

        {/* Disclaimer box */}
        <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 text-xs font-semibold text-gray-700 leading-relaxed">
          {t('help.disclaimer')}
        </div>
      </div>

      {/* Structured Referrals Modal */}
      <Modal
        isOpen={activeModal !== null}
        onClose={handleModalClose}
        title={getModalTitle()}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : showCityInput ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchReferrals(referralType);
            }}
            className="space-y-4 animate-scale-in"
          >
            <p className="text-xs text-textMuted font-semibold leading-relaxed">
              We need your city to locate the nearest reference centers:
            </p>
            <div>
              <label htmlFor="help-city-input" className="sr-only">City Name</label>
              <input
                id="help-city-input"
                type="text"
                required
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full h-11 border border-gray-250 rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button type="submit" variant="primary" fullWidth size="md">
              Search Centres
            </Button>
          </form>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* NGO List Layout */}
            {referralType === 'ngo' && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {referralsList.length === 0 ? (
                  <p className="text-xs text-textMuted italic">No verified housing NGOs found.</p>
                ) : (
                  referralsList.map((ngo, idx) => (
                    <div key={idx} className="border border-gray-150 rounded-xl p-3 bg-gray-50/50 space-y-1">
                      <p className="font-bold text-textPrimary text-xs sm:text-sm">{ngo.name}</p>
                      <p className="text-xs text-textMuted leading-relaxed">{ngo.description || ngo.desc}</p>
                      {ngo.website && (
                        <a
                          href={ngo.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary font-bold hover:underline mt-1"
                        >
                          <span>Visit Website</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Legal Aid List Layout */}
            {referralType === 'legal_aid' && (
              <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                {referralsList.length === 0 ? (
                  <p className="text-xs text-textMuted italic">No Legal Aid clinics found for your city.</p>
                ) : (
                  <div className="divide-y divide-gray-150">
                    {referralsList.map((ref, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                        <p className="text-xs font-bold text-textPrimary">{ref.name}</p>
                        <p className="text-[11px] text-textMuted leading-relaxed">{ref.address}</p>
                        <div className="flex gap-4 mt-1.5 text-[11px] font-bold">
                          {ref.phone && (
                            <span className="text-primary flex items-center gap-1">
                              <Phone size={10} />
                              <span>{ref.phone}</span>
                            </span>
                          )}
                          {ref.website && (
                            <a
                              href={ref.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary flex items-center gap-0.5 hover:underline"
                            >
                              <Globe size={10} />
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rent Authority List Layout + Static Step list */}
            {referralType === 'rent_authority' && (
              <div className="space-y-4 max-h-68 overflow-y-auto pr-1">
                {referralsList.length === 0 ? (
                  <div className="border border-gray-150 rounded-xl p-3 bg-gray-50/50">
                    <p className="text-xs text-textMuted italic">No local Rent Authority offices found in database.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <p className="text-xs font-bold text-textPrimary">Your Local Authority Contact:</p>
                    {referralsList.map((ref, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-xl p-3 bg-gray-50/50 space-y-1">
                        <p className="font-bold text-textPrimary text-xs">{ref.name}</p>
                        <p className="text-[11px] text-textMuted leading-relaxed">{ref.address}</p>
                        {ref.phone && <p className="text-[11px] text-primary font-semibold">Phone: {ref.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-150 pt-3">
                  <p className="font-bold text-textPrimary text-xs sm:text-sm mb-2">Steps to file a formal complaint:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-textMuted font-semibold pl-1 leading-relaxed">
                    <li>Draft a formal notice summarizing the dispute and lease dates.</li>
                    <li>Attach evidence (e.g. notices, transaction logs, whatsapp receipts).</li>
                    <li>Submit the package to the local Rent Authority registry clerk.</li>
                    <li>Both parties will receive formal summons for a conciliation hearing.</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button variant="primary" size="sm" onClick={handleModalClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HelpPage;
