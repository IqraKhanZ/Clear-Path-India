function matchPlan(answers) {
  const { problemType, city, hasRentalAgreement, urgencyLevel, customProblem } = answers;

  let interpretation = { en: '', hi: '' };
  let steps = [];
  let relevantLaw = { name: { en: '', hi: '' }, sourceUrl: '' };
  let options = [];

  // Urgency modifier prepends to step 1
  const isUrgent = urgencyLevel === 'today';
  const urgencyTextEn = isUrgent ? 'URGENT: Do not leave your home today without speaking to a legal advisor first. ' : '';
  const urgencyTextHi = isUrgent ? 'अत्यावश्यक: कानूनी सलाहकार से बात किए बिना आज अपना घर न छोड़ें। ' : '';

  // Options templates
  const dlsaOption = {
    title: { en: 'Get Free Legal Aid', hi: 'निःशुल्क कानूनी सहायता प्राप्त करें' },
    description: {
      en: 'Connect with your local District Legal Services Authority (DLSA) for free representation or counseling.',
      hi: 'निःशुल्क प्रतिनिधित्व या परामर्श के लिए अपने स्थानीय जिला विधिक सेवा प्राधिकरण (DLSA) से संपर्क करें।'
    },
    ctaLabel: { en: 'Find Near Me', hi: 'मेरे पास खोजें' },
    ctaUrl: '/help'
  };

  const pmayOption = {
    title: { en: 'Apply for PMAY-U 2.0', hi: 'पीएमएवाई-यू 2.0 के लिए आवेदन करें' },
    description: {
      en: 'Submit an online application for government housing schemes under the Pradhan Mantri Awas Yojana.',
      hi: 'प्रधानमंत्री आवास योजना के तहत सरकारी आवास योजनाओं के लिए ऑनलाइन आवेदन जमा करें।'
    },
    ctaLabel: { en: 'Apply Online', hi: 'ऑनलाइन आवेदन करें' },
    ctaUrl: 'https://pmay-urban.gov.in'
  };

  const mtaOption = {
    title: { en: 'Read Tenancy Act Guide', hi: 'किराया अधिनियम गाइड पढ़ें' },
    description: {
      en: 'Understand your rights under the Model Tenancy Act and how it applies to your state.',
      hi: 'आदर्श किराया अधिनियम के तहत अपने अधिकारों को समझें और यह आपके राज्य में कैसे लागू होता है।'
    },
    ctaLabel: { en: 'View Guide', hi: 'गाइड देखें' },
    ctaUrl: '/resources'
  };

  // Branch 1: Eviction Notice
  if (problemType === 'eviction_notice') {
    if (city === 'Delhi') {
      relevantLaw = {
        name: { en: 'Delhi Rent Control Act 1958', hi: 'दिल्ली किराया नियंत्रण अधिनियम 1958' },
        sourceUrl: 'https://indiacode.nic.in'
      };

      if (hasRentalAgreement === 'yes') {
        interpretation = {
          en: 'You are a renter in Delhi who has received an eviction notice and has a written rental agreement. Under the Delhi Rent Control Act 1958, a landlord cannot evict you without a valid legal reason and a court order from the Rent Controller. A notice alone does not mean you must leave.',
          hi: 'आप दिल्ली में एक किरायेदार हैं जिन्हें बेदखली का नोटिस मिला है और आपके पास एक लिखित किराया समझौता है। दिल्ली किराया नियंत्रण अधिनियम 1958 के तहत, मकान मालिक रेंट कंट्रोलर (किराया नियंत्रक) के वैध कानूनी कारण और अदालती आदेश के बिना आपको बेदखल नहीं कर सकता है। केवल नोटिस का मतलब यह नहीं है कि आपको घर छोड़ना होगा।'
        };
        steps = [
          {
            stepNumber: 1,
            text: {
              en: `${urgencyTextEn}Do not vacate the property immediately. A landlord cannot forcibly evict you without a court order.`,
              hi: `${urgencyTextHi}संपत्ति को तुरंत खाली न करें। मकान मालिक अदालत के आदेश के बिना आपको जबरन बेदखल नहीं कर सकता।`
            }
          },
          {
            stepNumber: 2,
            text: {
              en: 'Collect and photograph all written communication and notices from your landlord.',
              hi: 'अपने मकान मालिक से प्राप्त सभी लिखित संवादों और नोटिसों को संकलित करें और उनकी तस्वीरें लें।'
            }
          },
          {
            stepNumber: 3,
            text: {
              en: 'If the eviction is due to a rent dispute, you can deposit the disputed rent directly with the Rent Controller to protect yourself.',
              hi: 'यदि बेदखली किराए के विवाद के कारण है, तो अपनी सुरक्षा के लिए आप विवादित किराए को सीधे रेंट कंट्रोलर के पास जमा कर सकते हैं।'
            }
          },
          {
            stepNumber: 4,
            text: {
              en: 'Contact the Delhi District Legal Services Authority (DSLSA) on helpline 1516 for free legal counseling.',
              hi: 'मुफ्त कानूनी परामर्श के लिए दिल्ली जिला विधिक सेवा प्राधिकरण (DSLSA) से हेल्पलाइन 1516 पर संपर्क करें।'
            }
          }
        ];
      } else {
        interpretation = {
          en: 'You are a renter in Delhi who has received an eviction notice but does not have a written rental agreement. Without a written agreement, your legal protection is limited but not zero. Courts can still consider verbal arrangements in some cases. You need immediate legal advice.',
          hi: 'आप दिल्ली में एक किरायेदार हैं जिन्हें बेदखली का नोटिस मिला है लेकिन आपके पास कोई लिखित किराया समझौता नहीं है। लिखित समझौते के बिना, आपकी कानूनी सुरक्षा सीमित है लेकिन शून्य नहीं है। अदालतें कुछ मामलों में मौखिक व्यवस्थाओं पर विचार कर सकती हैं। आपको तत्काल कानूनी सलाह की आवश्यकता है।'
        };
        steps = [
          {
            stepNumber: 1,
            text: {
              en: `${urgencyTextEn}Contact DSLSA immediately on helpline 1516 for free legal advice before responding.`,
              hi: `${urgencyTextHi}प्रतिक्रिया देने से पहले मुफ्त कानूनी सलाह के लिए तुरंत DSLSA से हेल्पलाइन 1516 पर संपर्क करें।`
            }
          },
          {
            stepNumber: 2,
            text: {
              en: 'Do not vacate the property or pack your belongings without speaking to a legal advisor first.',
              hi: 'कानूनी सलाहकार से बात किए बिना संपत्ति खाली न करें या अपना सामान पैक न करें।'
            }
          },
          {
            stepNumber: 3,
            text: {
              en: 'Gather any proof of rent payments, such as bank transfer records, cash receipts, or text messages.',
              hi: 'किराया भुगतान का कोई भी प्रमाण एकत्र करें, जैसे कि बैंक ट्रांसफर रिकॉर्ड, नकद रसीदें, या टेक्स्ट संदेश।'
            }
          },
          {
            stepNumber: 4,
            text: {
              en: 'Document all physical visits, phone calls, or messages from the landlord.',
              hi: 'मकान मालिक से होने वाली सभी व्यक्तिगत मुलाकातों, फोन कॉल्स या संदेशों का दस्तावेजीकरण करें।'
            }
          }
        ];
      }
    } else if (city === 'Mumbai' || city === 'Pune') {
      relevantLaw = {
        name: { en: 'Maharashtra Rent Control Act 1999', hi: 'महाराष्ट्र किराया नियंत्रण अधिनियम 1999' },
        sourceUrl: 'https://indiacode.nic.in'
      };
      interpretation = {
        en: 'You are a renter in Maharashtra facing eviction. Under the Maharashtra Rent Control Act 1999, your landlord must follow proper legal procedures. They cannot forcibly evict you without an order from the Rent Control Court.',
        hi: 'आप महाराष्ट्र में बेदखली का सामना कर रहे एक किरायेदार हैं। महाराष्ट्र किराया नियंत्रण अधिनियम 1999 के तहत, आपके मकान मालिक को उचित कानूनी प्रक्रियाओं का पालन करना होगा। वे रेंट कंट्रोल कोर्ट के आदेश के बिना आपको जबरन बेदखल नहीं कर सकते हैं।'
      };
      steps = [
        {
          stepNumber: 1,
          text: {
            en: `${urgencyTextEn}Do not vacate the premises under pressure. Landlords cannot lock you out without a court decree.`,
            hi: `${urgencyTextHi}दबाव में आकर परिसर खाली न करें। मकान मालिक अदालत की डिक्री के बिना आपको बाहर नहीं निकाल सकते।`
          }
        },
        {
          stepNumber: 2,
          text: {
            en: 'Ensure you have receipts for all past rent payments and check your lease expiration date.',
            hi: 'सुनिश्चित करें कि आपके पास पिछले सभी किराया भुगतानों की रसीदें हैं और अपने लीज की समाप्ति तिथि की जांच करें।'
          }
        },
        {
          stepNumber: 3,
          text: {
            en: 'File a reply to the eviction notice stating your defense in the Rent Control Court.',
            hi: 'रेंट कंट्रोल कोर्ट में अपना बचाव करते हुए बेदखली के नोटिस का जवाब दाखिल करें।'
          }
        },
        {
          stepNumber: 4,
          text: {
            en: 'Seek free assistance from the Maharashtra State Legal Services Authority (MASLSA) or local DLSAs.',
            hi: 'महाराष्ट्र राज्य विधिक सेवा प्राधिकरण (MASLSA) या स्थानीय DLSA से मुफ्त सहायता लें।'
          }
        }
      ];
    } else if (city === 'Bengaluru') {
      relevantLaw = {
        name: { en: 'Karnataka Rent Control Act 2001', hi: 'कर्नाटक किराया नियंत्रण अधिनियम 2001' },
        sourceUrl: 'https://indiacode.nic.in'
      };
      interpretation = {
        en: 'You are a renter in Bengaluru facing eviction. Under the Karnataka Rent Control Act 2001, eviction is permitted only on specific grounds and must be processed through the Rent Control Court.',
        hi: 'आप बेंगलुरु में बेदखली का सामना कर रहे एक किरायेदार हैं। कर्नाटक किराया नियंत्रण अधिनियम 2001 के तहत, बेदखली की अनुमति केवल विशिष्ट आधारों पर है और इसे रेंट कंट्रोल कोर्ट के माध्यम से संसाधित किया जाना चाहिए।'
      };
      steps = [
        {
          stepNumber: 1,
          text: {
            en: `${urgencyTextEn}Do not leave the property without a Rent Control Court order. Verbal eviction is invalid.`,
            hi: `${urgencyTextHi}रेंट कंट्रोल कोर्ट के आदेश के बिना संपत्ति न छोड़ें। मौखिक बेदखली अमान्य है।`
          }
        },
        {
          stepNumber: 2,
          text: {
            en: 'Pay or tender rent within 2 months of receiving a demand notice to prevent eviction on grounds of non-payment.',
            hi: 'गैर-भुगतान के आधार पर बेदखली को रोकने के लिए मांग नोटिस प्राप्त करने के 2 महीने के भीतर किराए का भुगतान या निविदा करें।'
          }
        },
        {
          stepNumber: 3,
          text: {
            en: 'Document any physical harassment, water disconnection, or lockouts by the landlord.',
            hi: 'मकान मालिक द्वारा पानी काटने, ताला लगाने या किसी भी शारीरिक उत्पीड़न का दस्तावेजीकरण करें।'
          }
        },
        {
          stepNumber: 4,
          text: {
            en: 'Contact the Karnataka State Legal Services Authority (KSLSA) for free legal aid.',
            hi: 'मुफ्त कानूनी सहायता के लिए कर्नाटक राज्य विधिक सेवा प्राधिकरण (KSLSA) से संपर्क करें।'
          }
        }
      ];
    } else {
      relevantLaw = {
        name: { en: 'Model Tenancy Act 2021', hi: 'आदर्श किराया अधिनियम 2021' },
        sourceUrl: 'https://mohua.gov.in'
      };
      interpretation = {
        en: `You are a renter facing an eviction notice in ${city}. Under the Model Tenancy Act framework (where adopted), landlords must give proper notice and go through the Rent Authority.`,
        hi: `आप ${city} में बेदखली के नोटिस का सामना कर रहे एक किरायेदार हैं। आदर्श किराया अधिनियम के ढांचे के तहत (जहां अपनाया गया है), मकान मालिक को उचित नोटिस देना होगा और किराया प्राधिकरण के माध्यम से जाना होगा।`
      };
      steps = [
        {
          stepNumber: 1,
          text: {
            en: `${urgencyTextEn}Do not vacate immediately. Review your local state rent control acts for specific amendments.`,
            hi: `${urgencyTextHi}तुरंत खाली न करें। विशिष्ट संशोधनों के लिए अपने स्थानीय राज्य किराया नियंत्रण अधिनियमों की समीक्षा करें।`
          }
        },
        {
          stepNumber: 2,
          text: {
            en: 'Verify if the eviction notice provides the minimum required period under your tenancy agreement.',
            hi: 'सत्यापित करें कि क्या बेदखली का नोटिस आपके किरायेदारी समझौते के तहत आवश्यक न्यूनतम अवधि प्रदान करता है।'
          }
        },
        {
          stepNumber: 3,
          text: {
            en: 'Collect all proof of rental status and agreement registration with the local Rent Authority.',
            hi: 'स्थानीय किराया प्राधिकरण के साथ किरायेदारी की स्थिति और समझौते के पंजीकरण के सभी प्रमाण एकत्र करें।'
          }
        },
        {
          stepNumber: 4,
          text: {
            en: 'Contact the local District Legal Services Authority (DLSA) for legal advice and free representation.',
            hi: 'कानूनी सलाह और मुफ्त प्रतिनिधित्व के लिए स्थानीय जिला विधिक सेवा प्राधिकरण (DLSA) से संपर्क करें।'
          }
        }
      ];
    }
    options = [dlsaOption, mtaOption];
  }
  // Branch 2: Deposit Issue
  else if (problemType === 'deposit_issue') {
    const isSpecialCity = ['Delhi', 'Mumbai', 'Pune', 'Bengaluru'].includes(city);
    relevantLaw = isSpecialCity
      ? { name: { en: 'State Rent Control Act', hi: 'राज्य किराया नियंत्रण अधिनियम' }, sourceUrl: 'https://indiacode.nic.in' }
      : { name: { en: 'Model Tenancy Act 2021', hi: 'आदर्श किराया अधिनियम 2021' }, sourceUrl: 'https://mohua.gov.in' };

    interpretation = {
      en: 'You are experiencing a security deposit dispute. By law, landlords must return the security deposit upon vacating, minus any legitimate deductions for damages or unpaid bills.',
      hi: 'आप सुरक्षा जमा (सिक्योरिटी डिपॉजिट) विवाद का सामना कर रहे हैं। कानूनन, मकान मालिक को खाली करने पर सुरक्षा जमा वापस करना होगा, जिसमें से केवल नुकसान या अवैतनिक बिलों के लिए वैध कटौती की जा सकती है।'
    };

    steps = [
      {
        stepNumber: 1,
        text: {
          en: `${urgencyTextEn}Send a formal written demand notice to your landlord requesting the return of the deposit.`,
          hi: `${urgencyTextHi}अपने मकान मालिक को जमा राशि की वापसी का अनुरोध करते हुए एक औपचारिक लिखित मांग नोटिस भेजें।`
        }
      },
      {
        stepNumber: 2,
        text: {
          en: 'Allow 30 days for the refund, which is the standard timeline under the Model Tenancy Act.',
          hi: 'धन वापसी (रिफंड) के लिए 30 दिनों का समय दें, जो आदर्श किराया अधिनियम के तहत मानक समय-सीमा है।'
        }
      },
      {
        stepNumber: 3,
        text: {
          en: 'Prepare your tenancy agreement, rent receipts, and photographs of the property condition as evidence.',
          hi: 'सबूत के तौर पर अपना किराया समझौता, किराए की रसीदें और संपत्ति की स्थिति की तस्वीरें तैयार करें।'
        }
      },
      {
        stepNumber: 4,
        text: {
          en: 'If the landlord refuses without cause, file a complaint with the Rent Controller, Rent Authority, or local DLSA.',
          hi: 'यदि मकान मालिक बिना किसी कारण के मना करता है, तो किराया नियंत्रक (रेंट कंट्रोलर), किराया प्राधिकरण या स्थानीय DLSA के पास शिकायत दर्ज करें।'
        }
      }
    ];
    options = [dlsaOption, mtaOption];
  }
  // Branch 3: Rent Hike
  else if (problemType === 'rent_hike') {
    relevantLaw = {
      name: { en: 'Model Tenancy Act 2021', hi: 'आदर्श किराया अधिनियम 2021' },
      sourceUrl: 'https://mohua.gov.in'
    };
    interpretation = {
      en: 'You are facing a rent increase. Under standard tenancy frameworks, landlords must give adequate written notice before increasing rent, and hikes must match the terms agreed upon in the rental agreement.',
      hi: 'आप किराए में वृद्धि का सामना कर रहे हैं। मानक किरायेदारी ढांचे के तहत, मकान मालिक को किराया बढ़ाने से पहले पर्याप्त लिखित नोटिस देना होगा, और वृद्धि किराया समझौते में सहमत शर्तों के अनुसार होनी चाहिए।'
    };
    steps = [
      {
        stepNumber: 1,
        text: {
          en: `${urgencyTextEn}Review your tenancy agreement to check if the proposed rent hike exceeds the agreed percentage limit.`,
          hi: `${urgencyTextHi}अपने किरायेदारी समझौते की समीक्षा करके जांचें कि क्या प्रस्तावित किराया वृद्धि सहमत प्रतिशत सीमा से अधिक है।`
        }
      },
      {
        stepNumber: 2,
        text: {
          en: 'Request the landlord to provide a formal 3-month written notice for rent increase (required by the Model Tenancy Act).',
          hi: 'मकान मालिक से किराया बढ़ाने के लिए औपचारिक 3 महीने का लिखित नोटिस प्रदान करने का अनुरोध करें (आदर्श किराया अधिनियम द्वारा आवश्यक)।'
        }
      },
      {
        stepNumber: 3,
        text: {
          en: 'Verify if the state or city has rent controller limits on standard rent hikes.',
          hi: 'सत्यापित करें कि क्या राज्य या शहर में मानक किराया वृद्धि पर किराया नियंत्रक (रेंट कंट्रोलर) की कोई सीमाएं लागू हैं।'
        }
      },
      {
        stepNumber: 4,
        text: {
          en: 'If the hike is arbitrary and violates the lease, contact the local Rent Authority or DLSA.',
          hi: 'यदि वृद्धि मनमानी है और लीज का उल्लंघन करती है, तो स्थानीय किराया प्राधिकरण या DLSA से संपर्क करें।'
        }
      }
    ];
    options = [dlsaOption, mtaOption];
  }
  // Branch 4: No Agreement
  else if (problemType === 'no_agreement') {
    relevantLaw = {
      name: { en: 'Transfer of Property Act 1882', hi: 'संपत्ति हस्तांतरण अधिनियम 1882' },
      sourceUrl: 'https://indiacode.nic.in'
    };
    interpretation = {
      en: 'You do not have a written rental agreement. While written agreements are legally required under the Model Tenancy Act, verbal tenancies still carry weight under older laws. You should document your stay immediately.',
      hi: 'आपके पास लिखित किराया समझौता नहीं है। यद्यपि आदर्श किराया अधिनियम के तहत लिखित समझौते कानूनी रूप से आवश्यक हैं, फिर भी पुराने कानूनों के तहत मौखिक किरायेदारी का महत्व है। आपको तुरंत अपने रहने के प्रमाणों को संकलित करना चाहिए।'
    };
    steps = [
      {
        stepNumber: 1,
        text: {
          en: `${urgencyTextEn}Do not sign any tenancy paperwork under threat or pressure without consulting a legal aid lawyer.`,
          hi: `${urgencyTextHi}कानूनी सहायता वकील से परामर्श किए बिना किसी भी किरायेदारी दस्तावेज पर धमकी या दबाव में हस्ताक्षर न करें।`
        }
      },
      {
        stepNumber: 2,
        text: {
          en: 'Create a written record of your tenancy by collecting past rent receipts, bank statements, or utility bills.',
          hi: 'पिछले किराए की रसीदों, बैंक स्टेटमेंट या बिजली/पानी के बिलों को एकत्र करके अपनी किरायेदारी का एक लिखित रिकॉर्ड बनाएं।'
        }
      },
      {
        stepNumber: 3,
        text: {
          en: 'Ask the landlord to execute a registered rental agreement going forward to protect both parties.',
          hi: 'दोनों पक्षों की सुरक्षा के लिए मकान मालिक से भविष्य के लिए एक पंजीकृत किराया समझौता करने का अनुरोध करें।'
        }
      },
      {
        stepNumber: 4,
        text: {
          en: 'Contact the local DLSA to request help in drafting a legal tenancy agreement or resolving disputes.',
          hi: 'कानूनी किराया समझौता तैयार करने या विवादों को हल करने में सहायता के लिए स्थानीय DLSA से संपर्क करें।'
        }
      }
    ];
    options = [dlsaOption, mtaOption];
  }
  // Branch 5: Govt Housing
  else if (problemType === 'govt_housing') {
    relevantLaw = {
      name: { en: 'Pradhan Mantri Awas Yojana Urban (PMAY-U)', hi: 'प्रधानमंत्री आवास योजना शहरी (PMAY-U)' },
      sourceUrl: 'https://pmaymis.gov.in'
    };
    interpretation = {
      en: 'You are looking for government housing support. Pradhan Mantri Awas Yojana Urban (PMAY-U) offers affordable housing assistance to eligible urban families.',
      hi: 'आप सरकारी आवास सहायता की तलाश कर रहे हैं। प्रधानमंत्री आवास योजना शहरी (PMAY-U) पात्र शहरी परिवारों को किफायती आवास सहायता प्रदान करती है।'
    };
    steps = [
      {
        stepNumber: 1,
        text: {
          en: `${urgencyTextEn}Verify that your household annual income falls within the eligible category (EWS up to 3L, LIG 3-6L, MIG 6-9L).`,
          hi: `${urgencyTextHi}सत्यापित करें कि आपके परिवार की वार्षिक आय पात्र श्रेणी (EWS 3 लाख तक, LIG 3-6 लाख, MIG 6-9 लाख) के अंतर्गत आती है।`
        }
      },
      {
        stepNumber: 2,
        text: {
          en: 'Ensure that no family member owns a permanent (pucca) house anywhere in India and prepare an affidavit.',
          hi: 'सुनिश्चित करें कि परिवार के किसी भी सदस्य के पास भारत में कहीं भी स्थायी (पक्का) घर न हो और एक हलफनामा तैयार करें।'
        }
      },
      {
        stepNumber: 3,
        text: {
          en: 'Visit the official government portal at https://pmay-urban.gov.in or apply offline through a Common Service Centre.',
          hi: 'आधिकारिक सरकारी पोर्टल https://pmay-urban.gov.in पर जाएं या सामान्य सेवा केंद्र (CSC) के माध्यम से ऑफलाइन आवेदन करें।'
        }
      },
      {
        stepNumber: 4,
        text: {
          en: 'Submit required documents: Aadhaar card, income proof, identity proof, address proof, and bank statement.',
          hi: 'आवश्यक दस्तावेज जमा करें: आधार कार्ड, आय प्रमाण, पहचान प्रमाण, पते का प्रमाण और बैंक स्टेटमेंट।'
        }
      }
    ];
    options = [pmayOption, mtaOption];
  }
  // Branch 6: Other
  else {
    relevantLaw = {
      name: { en: 'Model Tenancy Act 2021', hi: 'आदर्श किराया अधिनियम 2021' },
      sourceUrl: 'https://mohua.gov.in'
    };
    interpretation = {
      en: 'You have selected another housing issue. We will guide you on basic tenant rights and connect you to local legal aid authorities.',
      hi: 'आपने एक अन्य आवास समस्या का चयन किया है। हम आपको बुनियादी किरायेदार अधिकारों पर मार्गदर्शन करेंगे और आपको स्थानीय कानूनी सहायता अधिकारियों से जोड़ेंगे।'
    };
    steps = [
      {
        stepNumber: 1,
        text: {
          en: `${urgencyTextEn}Write down all key facts, dates, and communications regarding your specific housing issue.`,
          hi: `${urgencyTextHi}अपनी विशिष्ट आवास समस्या के संबंध में सभी महत्वपूर्ण तथ्यों, तारीखों और संवादों को लिख लें।`
        }
      },
      {
        stepNumber: 2,
        text: {
          en: 'Review your rental agreement to see if there are any clauses that address this issue.',
          hi: 'यह देखने के लिए अपने किराया समझौते की समीक्षा करें कि क्या कोई क्लॉज है जो इस समस्या का समाधान करता है।'
        }
      },
      {
        stepNumber: 3,
        text: {
          en: 'Avoid making hasty decisions or signing new papers without legal consultation.',
          hi: 'कानूनी परामर्श के बिना जल्दबाजी में निर्णय लेने या नए दस्तावेजों पर हस्ताक्षर करने से बचें।'
        }
      },
      {
        stepNumber: 4,
        text: {
          en: 'Reach out to the nearest District Legal Services Authority (DLSA) for free legal guidance and help.',
          hi: 'मुफ्त कानूनी मार्गदर्शन और सहायता के लिए निकटतम जिला विधिक सेवा प्राधिकरण (DLSA) से संपर्क करें।'
        }
      }
    ];
    options = [dlsaOption, mtaOption];
  }

  return {
    interpretation,
    steps,
    relevantLaw,
    options,
    additionalSources: [relevantLaw.sourceUrl]
  };
}

module.exports = { matchPlan };
