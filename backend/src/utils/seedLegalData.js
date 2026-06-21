const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const connectDatabase = require('../config/db');
const Resource = require('../models/Resource');
const ReferralCentre = require('../models/ReferralCentre');

const resources = [
  // 1A - Eviction Grounds (Delhi)
  {
    category: 'rights',
    tags: ['eviction', 'delhi', 'grounds', 'drca'],
    sourceUrl: 'https://indiacode.nic.in',
    title: {
      en: 'Valid Grounds for Eviction — Delhi Rent Control Act 1958',
      hi: 'दिल्ली किराया नियंत्रण अधिनियम 1958 — बेदखली के वैध कारण'
    },
    description: {
      en: `Under Section 14 of the Delhi Rent Control Act 1958, a landlord can only evict a tenant for the following specific reasons:
1. Non-payment of rent — Tenant fails to pay rent for more than 2 months after receiving a written demand notice.
2. Unauthorized subletting — Tenant rents out the property to someone else without the landlord's written consent.
3. Wrong use of property — Tenant uses a residential property for commercial purposes without consent.
4. Landlord's personal need — Landlord genuinely requires the property for their own use or for a dependent family member and has no other suitable residence.
5. Unsafe property — Property has become unsafe or unfit and repairs require it to be vacated.
6. Reconstruction needed — Landlord needs to rebuild or make major alterations requiring vacancy.
7. Employment ended — Tenant was renting because of employment with landlord and that employment has ended.
8. Tenant has another home — Tenant has acquired or been allotted another residence.
9. Nuisance or damage — Tenant causes nuisance to neighbours or damages property.
10. Denies landlord's title — Tenant falsely claims permanent tenancy rights.
IMPORTANT: A landlord cannot evict a tenant for any reason not listed above. Eviction must go through the Rent Controller — landlord cannot forcibly remove a tenant without a court order.`,
      hi: `दिल्ली किराया नियंत्रण अधिनियम 1958 की धारा 14 के तहत, एक मकान मालिक केवल निम्नलिखित विशिष्ट कारणों से ही किरायेदार को बेदखल कर सकता है:
1. किराए का भुगतान न करना — लिखित मांग नोटिस प्राप्त करने के बाद किरायेदार 2 महीने से अधिक समय तक किराया देने में विफल रहता है।
2. अनधिकृत उप-किरायेदारी (सबलेटिंग) — किरायेदार मकान मालिक की लिखित सहमति के बिना संपत्ति को किसी अन्य व्यक्ति को किराए पर दे देता है।
3. संपत्ति का गलत उपयोग — किरायेदार मकान मालिक की सहमति के बिना व्यावसायिक उद्देश्यों के लिए आवासीय संपत्ति का उपयोग करता है।
4. मकान मालिक की व्यक्तिगत आवश्यकता — मकान मालिक को वास्तव में अपने स्वयं के उपयोग या आश्रित परिवार के सदस्य के लिए संपत्ति की आवश्यकता होती है और उसके पास कोई अन्य उपयुक्त निवास नहीं है।
5. असुरक्षित संपत्ति — संपत्ति असुरक्षित या अनुपयुक्त हो गई है और मरम्मत के लिए इसे खाली करना आवश्यक है।
6. पुनर्निर्माण की आवश्यकता — मकान मालिक को पुनर्निर्माण या बड़े बदलाव करने की आवश्यकता है जिसके लिए संपत्ति का खाली होना आवश्यक है।
7. रोजगार समाप्त होना — किरायेदार मकान मालिक के साथ रोजगार के कारण किराए पर रह रहा था और वह रोजगार समाप्त हो गया है।
8. किरायेदार के पास दूसरा घर होना — किरायेदार ने कोई अन्य निवास स्थान प्राप्त कर लिया है या उसे आवंटित कर दिया गया है।
9. उपद्रव या क्षति — किरायेदार पड़ोसियों के लिए उपद्रव पैदा करता है या संपत्ति को नुकसान पहुंचाता है।
10. मकान मालिक के मालिकाना हक को नकारना — किरायेदार गलत तरीके से स्थायी किरायेदारी के अधिकारों का दावा करता है।
महत्वपूर्ण: एक मकान मालिक ऊपर सूचीबद्ध नहीं किए गए किसी भी कारण से किरायेदार को बेदखल नहीं कर सकता है। बेदखली रेंट कंट्रोलर (किराया नियंत्रक) के माध्यम से होनी चाहिए — मकान मालिक अदालत के आदेश के बिना किरायेदार को जबरन नहीं हटा सकता है।`
    },
    isActive: true
  },
  // 1B - Notice Period (Delhi)
  {
    category: 'rights',
    tags: ['notice', 'delhi', 'eviction', 'drca'],
    sourceUrl: 'https://indiacode.nic.in',
    title: {
      en: 'Eviction Notice Period — Delhi',
      hi: 'बेदखली नोटिस अवधि — दिल्ली'
    },
    description: {
      en: `Under the Delhi Rent Control Act 1958:
- For non-payment of rent: No advance notice is required, but landlord must first send a written demand notice. Tenant has a chance to pay before eviction proceedings begin.
- For all other grounds: Courts typically require a minimum of 1 month written notice before eviction proceedings can begin.
- A verbal eviction notice has no legal standing.
- If you receive a notice giving you less than 15 days to vacate, this is likely not legally valid and you should contact a legal aid centre immediately.`,
      hi: `दिल्ली किराया नियंत्रण अधिनियम 1958 के तहत:
- किराए का भुगतान न करने पर: किसी अग्रिम नोटिस की आवश्यकता नहीं है, लेकिन मकान मालिक को पहले एक लिखित मांग नोटिस भेजना होगा। किरायेदार को बेदखली की कार्यवाही शुरू होने से पहले भुगतान करने का अवसर मिलता है।
- अन्य सभी आधारों के लिए: अदालतें आमतौर पर बेदखली की कार्यवाही शुरू होने से पहले न्यूनतम 1 महीने के लिखित नोटिस की आवश्यकता रखती हैं।
- मौखिक बेदखली नोटिस का कोई कानूनी महत्व नहीं है।
- यदि आपको कोई ऐसा नोटिस प्राप्त होता है जिसमें आपको खाली करने के लिए 15 दिन से कम का समय दिया गया है, तो यह कानूनी रूप से मान्य नहीं होने की संभावना है और आपको तुरंत कानूनी सहायता केंद्र से संपर्क करना चाहिए।`
    },
    isActive: true
  },
  // 1C - Security Deposit (Delhi)
  {
    category: 'rights',
    tags: ['deposit', 'delhi', 'security', 'drca'],
    sourceUrl: 'https://indiacode.nic.in',
    title: {
      en: 'Security Deposit Rules — Delhi',
      hi: 'सुरक्षा जमा नियम — दिल्ली'
    },
    description: {
      en: `Security deposit rules under Delhi Rent Control Act 1958 and Model Tenancy Act 2021 (where adopted):
- The Delhi Rent Control Act 1958 does not specify a strict cap on security deposit. In practice, 2-3 months rent is common.
- The Model Tenancy Act 2021 recommends a maximum of 2 months rent for residential properties.
- The landlord MUST return the security deposit when you vacate, minus any legitimate deductions for damages or unpaid bills.
- The return timeline should be as specified in your rental agreement. If the agreement says 30 days, the landlord must comply within 30 days.
- If a landlord refuses to return the deposit without valid reason, you can file a complaint with the Rent Controller or District Legal Services Authority (DLSA).`,
      hi: `दिल्ली किराया नियंत्रण अधिनियम 1958 और आदर्श किराया अधिनियम 2021 (जहां अपनाया गया है) के तहत सुरक्षा जमा (सिक्योरिटी डिपॉजिट) के नियम:
- दिल्ली किराया नियंत्रण अधिनियम 1958 सुरक्षा जमा पर कोई सख्त सीमा निर्दिष्ट नहीं करता है। व्यवहार में, 2-3 महीने का किराया सामान्य है।
- आदर्श किराया अधिनियम 2021 आवासीय संपत्तियों के लिए अधिकतम 2 महीने के किराए की सिफारिश करता है।
- जब आप घर खाली करते हैं, तो मकान मालिक को सुरक्षा जमा वापस करना होगा, जिसमें से नुकसान या बकाया बिलों के लिए केवल वैध कटौती की जा सकती है।
- वापसी की समय-सीमा आपके किराया समझौते में निर्दिष्ट अनुसार होनी चाहिए। यदि समझौते में 30 दिन लिखा है, तो मकान मालिक को 30 दिनों के भीतर इसका पालन करना होगा।
- यदि कोई मकान मालिक बिना किसी वैध कारण के जमा राशि वापस करने से मना करता है, तो आप रेंट कंट्रोलर या जिला विधिक सेवा प्राधिकरण (DLSA) के पास शिकायत दर्ज करा सकते हैं।`
    },
    isActive: true
  },
  // 1D - Tenant Remedies (Delhi)
  {
    category: 'rights',
    tags: ['remedies', 'delhi', 'eviction', 'tenant', 'drca'],
    sourceUrl: 'https://indiacode.nic.in',
    title: {
      en: 'Tenant Remedies Against Illegal Eviction — Delhi',
      hi: 'अवैध बेदखली के विरुद्ध किरायेदार के उपाय — दिल्ली'
    },
    description: {
      en: `If you are facing an illegal eviction attempt in Delhi:
1. A landlord CANNOT physically remove you from the property without a court order from the Rent Controller. This is illegal.
2. You can apply to the Rent Controller for protection of possession.
3. If there is a dispute about the rent amount, you can deposit the rent directly with the Rent Controller — this protects you from eviction on grounds of non-payment while the dispute is resolved.
4. The Controller must fix an interim rent within 15 days if there is a dispute about the amount.
5. A verbal agreement has NO legal standing under Delhi Rent Control Act. Without a written agreement, you may have limited protection.
6. Contact Delhi District Legal Services Authority (DLSA) for free legal help. Helpline: 1516.`,
      hi: `यदि आप दिल्ली में अवैध बेदखली के प्रयास का सामना कर रहे हैं:
1. मकान मालिक रेंट控制र के अदालती आदेश के बिना आपको शारीरिक रूप से संपत्ति से बाहर नहीं निकाल सकता है। यह गैरकानूनी है।
2. आप कब्जे की सुरक्षा के लिए रेंट कंट्रोलर के पास आवेदन कर सकते हैं।
3. यदि किराए की राशि को लेकर कोई विवाद है, तो आप किराया सीधे रेंट कंट्रोलर के पास जमा कर सकते हैं — यह विवाद के समाधान के दौरान गैर-भुगतान के आधार पर होने वाली बेदखली से आपकी रक्षा करता है।
4. यदि राशि को लेकर कोई विवाद है, तो कंट्रोलर को 15 दिनों के भीतर एक अंतरिम किराया तय करना होगा।
5. दिल्ली किराया नियंत्रण अधिनियम के तहत मौखिक समझौते का कोई कानूनी महत्व नहीं है। लिखित समझौते के बिना, आपको सीमित सुरक्षा मिल सकती है।
6. मुफ्त कानूनी सहायता के लिए दिल्ली जिला विधिक सेवा प्राधिकरण (DLSA) से संपर्क करें। हेल्पलाइन: 1516।`
    },
    isActive: true
  },
  // 2A - Eviction Grounds (Maharashtra)
  {
    category: 'rights',
    tags: ['eviction', 'maharashtra', 'mumbai', 'pune', 'mrca'],
    sourceUrl: 'https://indiacode.nic.in',
    title: {
      en: 'Valid Grounds for Eviction — Maharashtra Rent Control Act 1999',
      hi: 'महाराष्ट्र किराया नियंत्रण अधिनियम 1999 — बेदखली के वैध कारण'
    },
    description: {
      en: `Under the Maharashtra Rent Control Act 1999, a landlord can only evict a tenant for these specific reasons:
1. Non-payment of rent — Not paying rent within the stipulated time after receiving a due notice.
2. Unauthorized subletting — Renting out the property or part of it without the landlord's written permission.
3. Wrong use of property — Using the property for a purpose other than what it was rented for.
4. Not occupying — Tenant does not continuously occupy the property for several months without a reasonable cause.
5. Denying landlord's title — Tenant falsely claims permanent tenancy rights.
6. Landlord's personal need — Landlord bona fide requires the property for their own occupation.
7. Employment ended — Tenant occupied property as part of an employment contract and employment has ceased.
8. Tenant vacated after notice but did not return possession formally.
9. Tenant has acquired another house — Tenant has bought or built another residence.
10. Limited tenancy expired — The agreed tenancy period has ended as per the rental agreement.
11. Illegal activities — Tenant uses property for illegal purposes.
12. Unauthorized permanent alterations — Tenant makes permanent structural changes without landlord's written consent.
IMPORTANT: Landlord can seek possession ONLY through proper legal process. Cannot evict without a court order.`,
      hi: `महाराष्ट्र किराया नियंत्रण अधिनियम 1999 के तहत, एक मकान मालिक केवल इन विशिष्ट कारणों से ही किरायेदार को बेदखल कर सकता है:
1. किराए का भुगतान न करना — देय नोटिस प्राप्त करने के बाद निर्धारित समय के भीतर किराए का भुगतान न करना।
2. अनधिकृत उप-किरायेदारी (सबलेटिंग) — मकान मालिक की लिखित अनुमति के बिना संपत्ति या उसके किसी हिस्से को किराए पर देना।
3. संपत्ति का गलत उपयोग — संपत्ति का उपयोग उस उद्देश्य के अलावा किसी अन्य उद्देश्य के लिए करना जिसके लिए उसे किराए पर लिया गया था।
4. कब्जा न रखना — किरायेदार बिना किसी उचित कारण के कई महीनों तक लगातार संपत्ति में नहीं रहता है।
5. मकान मालिक के मालिकाना हक को नकारना — किरायेदार गलत तरीके से स्थायी किरायेदारी के अधिकारों का दावा करता है।
6. मकान मालिक की व्यक्तिगत आवश्यकता — मकान मालिक को अपने स्वयं के रहने के लिए सद्भावपूर्वक संपत्ति की आवश्यकता होती है।
7. रोजगार समाप्त होना — किरायेदार रोजगार अनुबंध के हिस्से के रूप में संपत्ति में रह रहा था और रोजगार समाप्त हो गया है।
8. किरायेदार ने नोटिस के बाद घर तो खाली कर दिया लेकिन औपचारिक रूप से कब्जा वापस नहीं सौंपा।
9. किरायेदार के पास दूसरा घर होना — किरायेदार ने कोई दूसरा निवास खरीद लिया है या बना लिया है।
10. सीमित किरायेदारी का समाप्त होना — किराया समझौते के अनुसार सहमत किरायेदारी की अवधि समाप्त हो गई है।
11. अवैध गतिविधियां — किरायेदार अवैध उद्देश्यों के लिए संपत्ति का उपयोग करता है।
12. अनधिकृत स्थायी बदलाव — किरायेदार मकान मालिक की लिखित सहमति के बिना स्थायी संरचनात्मक बदलाव करता है।
महत्वपूर्ण: मकान मालिक केवल उचित कानूनी प्रक्रिया के माध्यम से ही कब्जा वापस मांग सकता है। अदालत के आदेश के बिना बेदखल नहीं कर सकता।`
    },
    isActive: true
  },
  // 2B - Notice, Deposit, Remedies (Maharashtra)
  {
    category: 'rights',
    tags: ['notice', 'deposit', 'remedies', 'maharashtra', 'mumbai', 'pune'],
    sourceUrl: 'https://indiacode.nic.in',
    title: {
      en: 'Notice Period, Deposit Rules and Tenant Remedies — Maharashtra',
      hi: 'नोटिस अवधि, जमा नियम और किरायेदार उपाय — महाराष्ट्र'
    },
    description: {
      en: `Notice Period:
- For non-payment of rent: Landlord must send a due notice first. Tenant has a chance to pay before eviction proceedings.
- For all other grounds: Minimum 1 month written notice is standard under the Transfer of Property Act Section 106.

Security Deposit:
- Maharashtra Rent Control Act 1999 does not specify a strict deposit cap.
- Model Tenancy Act 2021 (adopted in Maharashtra) recommends maximum 2 months rent for residential properties.
- Deposit must be returned on vacating, minus legitimate deductions.
- Refund must happen within 30 days of vacating under Model Tenancy Act.

Tenant Remedies:
- Landlord cannot evict you without a court order — even if you have no written agreement.
- You can contest eviction in the Rent Control Court.
- For free legal help: contact Maharashtra State Legal Services Authority (MASLSA) or your District Legal Services Authority.`,
      hi: `नोटिस अवधि:
- किराए का भुगतान न करने पर: मकान मालिक को पहले एक देय नोटिस भेजना होगा। किरायेदार को बेदखली की कार्यवाही से पहले भुगतान करने का अवसर मिलता है।
- अन्य सभी आधारों के लिए: संपत्ति हस्तांतरण अधिनियम की धारा 106 के तहत न्यूनतम 1 महीने का लिखित नोटिस मानक है।

सुरक्षा जमा (सिक्योरिटी डिपॉजिट):
- महाराष्ट्र किराया नियंत्रण अधिनियम 1999 एक सख्त जमा सीमा निर्दिष्ट नहीं करता है।
- आदर्श किराया अधिनियम 2021 (महाराष्ट्र में अपनाया गया) आवासीय संपत्तियों के लिए अधिकतम 2 महीने के किराए की सिफारिश करता है।
- खाली करने पर सुरक्षा जमा वापस किया जाना चाहिए, जिसमें से वैध कटौती की जा सकती है।
- आदर्श किराया अधिनियम के तहत खाली करने के 30 दिनों के भीतर रिफंड होना चाहिए।

किरायेदार के कानूनी उपाय:
- मकान मालिक आपको अदालत के आदेश के बिना बेदखल नहीं कर सकता — भले ही आपके पास कोई लिखित समझौता न हो।
- आप रेंट कंट्रोल कोर्ट (किराया नियंत्रण न्यायालय) में बेदखली का विरोध कर सकते हैं।
- मुफ्त कानूनी सहायता के लिए: महाराष्ट्र राज्य विधिक सेवा प्राधिकरण (MASLSA) या अपने जिला विधिक सेवा प्राधिकरण से संपर्क करें।`
    },
    isActive: true
  },
  // 3A - All Provisions (Karnataka)
  {
    category: 'rights',
    tags: ['eviction', 'deposit', 'remedies', 'karnataka', 'bengaluru', 'krca'],
    sourceUrl: 'https://indiacode.nic.in',
    title: {
      en: 'Tenant Rights — Karnataka Rent Control Act 2001',
      hi: 'किरायेदार अधिकार — कर्नाटक किराया नियंत्रण अधिनियम 2001'
    },
    description: {
      en: `Valid Eviction Grounds under Karnataka Rent Control Act 2001:
1. Non-payment of rent — Not paying within 2 months after receiving a demand notice.
2. Wrong use — Using property for a purpose other than rented use without written consent.
3. Repairs needed — Landlord needs to carry out repairs that cannot be done while the property is occupied.
4. Subletting without consent — Allowing others to occupy without permission.
5. Landlord's personal need — For personal use or redevelopment.
6. Property damage — Tenant causing damage to the structure.
7. Nuisance — Tenant causing nuisance to neighbours.

Notice Period:
- 2 months from date of demand notice for non-payment of rent.
- 1 month standard notice for other grounds under Transfer of Property Act.

Security Deposit:
- Karnataka Rent Control Act 2001 does not specify a cap.
- Model Tenancy Act 2021 cap applies: maximum 2 months rent for residential.
- Must be returned within 30 days of vacating.

Tenant Remedies:
- Eviction only permitted through the Rent Control Court on specific grounds.
- Tenant can contest eviction in court.
- Cannot be evicted without a court order.
- For free legal help: contact Karnataka State Legal Services Authority (KSLSA) at https://kslsa.kar.nic.in`,
      hi: `कर्नाटक किराया नियंत्रण अधिनियम 2001 के तहत वैध बेदखली के आधार:
1. किराए का भुगतान न करना — मांग नोटिस प्राप्त करने के बाद 2 महीने के भीतर भुगतान न करना।
2. गलत उपयोग — लिखित सहमति के बिना किराए के उपयोग के अलावा किसी अन्य उद्देश्य के लिए संपत्ति का उपयोग करना।
3. मरम्मत की आवश्यकता — मकान मालिक को ऐसी मरम्मत करनी है जो संपत्ति के खाली हुए बिना नहीं की जा सकती।
4. सहमति के बिना उप-किरायेदारी (सबलेटिंग) — बिना अनुमति के दूसरों को रहने की अनुमति देना।
5. मकान मालिक की व्यक्तिगत आवश्यकता — व्यक्तिगत उपयोग या पुनर्विकास के लिए।
6. संपत्ति की क्षति — किरायेदार द्वारा संरचना को नुकसान पहुंचाना।
7. उपद्रव — किरायेदार पड़ोसियों के लिए उपद्रव पैदा करता है।

नोटिस अवधि:
- किराए का भुगतान न करने पर मांग नोटिस की तारीख से 2 महीने का समय।
- संपत्ति हस्तांतरण अधिनियम के तहत अन्य आधारों के लिए 1 महीने का मानक नोटिस।

सुरक्षा जमा:
- कर्नाटक किराया नियंत्रण अधिनियम 2001 कोई सीमा निर्दिष्ट नहीं करता है।
- आदर्श किराया अधिनियम 2021 की सीमा लागू होती है: आवासीय के लिए अधिकतम 2 महीने का किराया।
- खाली करने के 30 दिनों के भीतर वापस किया जाना चाहिए।

किरायेदार के उपाय:
- विशिष्ट आधारों पर केवल रेंट कंट्रोल कोर्ट के माध्यम से ही बेदखली की अनुमति है।
- किरायेदार अदालत में बेदखली का विरोध कर सकता है।
- अदालत के आदेश के बिना बेदखल नहीं किया जा सकता।
- मुफ्त कानूनी सहायता के लिए: कर्नाटक राज्य विधिक सेवा प्राधिकरण (KSLSA) से https://kslsa.kar.nic.in पर संपर्क करें।`
    },
    isActive: true
  },
  // 4A - Model Tenancy Act 2021
  {
    category: 'rights',
    tags: ['model', 'tenancy', 'national', 'deposit', 'rent_authority', 'mta'],
    sourceUrl: 'https://mohua.gov.in',
    title: {
      en: 'Model Tenancy Act 2021 — Key Provisions',
      hi: 'आदर्श किराया अधिनियम 2021 — मुख्य प्रावधान'
    },
    description: {
      en: `The Model Tenancy Act 2021 is a central government framework for regulating rental housing across India.

States that have adopted it (as of 2025):
Uttarakhand, Punjab, Telangana, Andhra Pradesh, Bihar, Haryana, Tamil Nadu, Kerala, Rajasthan, Assam, Uttar Pradesh, Chandigarh, Jharkhand.
NOTE: Delhi, Maharashtra, and West Bengal have NOT yet adopted this act and continue under their own Rent Control Acts.

Key Provisions:
1. Security Deposit Cap:
   - Residential properties: maximum 2 months rent.
   - Commercial properties: maximum 6 months rent.
   - Must be returned within 30 days of tenant vacating, minus deductions.

2. Rent Increase:
   - Landlord must give 3 months written notice before increasing rent.

3. Landlord Entry:
   - Landlord must give minimum 24 hours written notice before entering the property.

4. Rent Authority:
   - A quasi-judicial body headed by the District Collector.
   - All rent agreements must be registered with the Rent Authority.
   - Handles first-level disputes between landlord and tenant.

5. Three-Tier Dispute Resolution:
   - Level 1: Rent Authority (District Collector) — must resolve within 60 days.
   - Level 2: Rent Court (Additional Collector/DM) — appeal within 30 days of Level 1 order, resolved within 60 days.
   - Level 3: Rent Tribunal (District Judge) — final appeal within 30 days of Level 2 order, resolved within 60 days.`,
      hi: `आदर्श किराया अधिनियम 2021 पूरे भारत में किराये के आवास को विनियमित करने के लिए एक केंद्र सरकार का ढांचा है।

राज्य जिन्होंने इसे अपनाया है (2025 तक):
उत्तराखंड, पंजाब, तेलंगाना, आंध्र प्रदेश, बिहार, हरियाणा, तमिलनाडु, केरल, राजस्थान, असम, उत्तर प्रदेश, चंडीगढ़, झारखंड।
नोट: दिल्ली, महाराष्ट्र और पश्चिम बंगाल ने अभी तक इस अधिनियम को नहीं अपनाया है और वे अपने स्वयं के किराया नियंत्रण अधिनियमों के तहत काम कर रहे हैं।

मुख्य प्रावधान:
1. सुरक्षा जमा सीमा:
   - आवासीय संपत्तियां: अधिकतम 2 महीने का किराया।
   - वाणिज्यिक संपत्तियां: अधिकतम 6 महीने का किराया।
   - किरायेदार के खाली करने के 30 दिनों के भीतर वापस किया जाना चाहिए, वैध कटौतियों को छोड़कर।

2. किराए में वृद्धि:
   - मकान मालिक को किराया बढ़ाने से पहले 3 महीने का लिखित नोटिस देना होगा।

3. मकान मालिक का प्रवेश:
   - मकान मालिक को संपत्ति में प्रवेश करने से पहले न्यूनतम 24 घंटे का लिखित नोटिस देना होगा।

4. किराया प्राधिकरण (रेंट अथॉरिटी):
   - जिला कलेक्टर की अध्यक्षता वाला एक अर्ध-न्यायिक निकाय।
   - सभी किराया समझौतों को किराया प्राधिकरण के पास पंजीकृत होना चाहिए।
   - मकान मालिक और किरायेदार के बीच पहले स्तर के विवादों को संभालता है।

5. तीन-स्तरीय विवाद समाधान:
   - स्तर 1: किराया प्राधिकरण (जिला कलेक्टर) — 60 दिनों के भीतर हल करना होगा।
   - स्तर 2: किराया न्यायालय (अतिरिक्त कलेक्टर/डीएम) — स्तर 1 के आदेश के 30 दिनों के भीतर अपील, 60 दिनों के भीतर हल।
   - स्तर 3: किराया न्यायाधिकरण (जिला न्यायाधीश) — स्तर 2 के आदेश के 30 दिनों के भीतर अंतिम अपील, 60 दिनों के भीतर हल।`
    },
    isActive: true
  },
  // 5A - PM Awas Yojana Urban
  {
    category: 'scheme',
    tags: ['pmay', 'housing', 'government', 'scheme', 'eligibility', 'urban'],
    sourceUrl: 'https://pmaymis.gov.in',
    title: {
      en: 'PM Awas Yojana Urban (PMAY-U) — Eligibility and Application',
      hi: 'प्रधानमंत्री आवास योजना शहरी — पात्रता और आवेदन'
    },
    description: {
      en: `PM Awas Yojana Urban (PMAY-U) provides housing assistance to urban households. Here is who can apply and how:

Income Categories and Annual Limits:
- EWS (Economically Weaker Section): Annual household income up to ₹3 lakh
- LIG (Low Income Group): ₹3 lakh to ₹6 lakh
- MIG (Middle Income Group): ₹6 lakh to ₹9 lakh (under PMAY-U 2.0)

Who is Eligible:
- The applicant and their family (spouse + minor children under 18) must NOT own a pucca (permanent) house anywhere in India.
- Must declare non-ownership via affidavit/self-certificate.
- Women applicants or co-applicants are given priority.

How to Apply Online:
1. Visit https://pmay-urban.gov.in
2. Click 'Apply for PMAY-U 2.0' or 'Citizen Assessment'
3. Enter your Aadhaar number
4. Fill in personal, income, bank, and contact details
5. Upload required documents
6. Submit and take printout of acknowledgement

How to Apply Offline:
1. Visit nearest Common Service Centre (CSC)
2. Purchase application form (₹25 + GST)
3. Fill details and attach document copies
4. Submit signed form at CSC

Documents Required:
- Aadhaar card (all family members)
- Income proof (salary slip, ITR, bank statement, self-certificate)
- Identity proof (PAN, voter ID, passport, driving licence)
- Address proof (utility bill, rent agreement)
- Bank passbook or statement (Aadhaar-linked)
- Affidavit declaring no pucca house ownership`,
      hi: `प्रधानमंत्री आवास योजना शहरी (PMAY-U) शहरी परिवारों को आवास सहायता प्रदान करती है। यहाँ जानें कि कौन आवेदन कर सकता है और कैसे:

आय श्रेणियां और वार्षिक सीमाएं:
- EWS (आर्थिक रूप से कमजोर वर्ग): वार्षिक पारिवारिक आय ₹3 लाख तक।
- LIG (निम्न आय वर्ग): ₹3 लाख से ₹6 लाख।
- MIG (मध्यम आय वर्ग): ₹6 लाख से ₹9 लाख (PMAY-U 2.0 के तहत)।

कौन पात्र है:
- आवेदक और उनके परिवार (पति/पत्नी + 18 वर्ष से कम उम्र के नाबालिग बच्चे) के पास भारत में कहीं भी पक्का (स्थायी) घर नहीं होना चाहिए।
- हलफनामे/स्व-प्रमाण पत्र के माध्यम से घर न होने की घोषणा करनी होगी।
- महिला आवेदकों या सह-आवेदकों को प्राथमिकता दी जाती है।

ऑनलाइन आवेदन कैसे करें:
1. https://pmay-urban.gov.in पर जाएं।
2. 'PMAY-U 2.0 के लिए आवेदन करें' या 'नागरिक मूल्यांकन' पर क्लिक करें।
3. अपना आधार नंबर दर्ज करें।
4. व्यक्तिगत, आय, बैंक और संपर्क विवरण भरें।
5. आवश्यक दस्तावेज अपलोड करें।
6. सबमिट करें और पावती (एक्नॉलेजमेंट) का प्रिंटआउट लें।

ऑफलाइन आवेदन कैसे करें:
1. निकटतम सामान्य सेवा केंद्र (CSC) पर जाएं।
2. आवेदन पत्र खरीदें (₹25 + GST)।
3. विवरण भरें और दस्तावेजों की प्रतियां संलग्न करें।
4. CSC पर हस्ताक्षरित फॉर्म जमा करें।

आवश्यक दस्तावेज:
- आधार कार्ड (परिवार के सभी सदस्यों का)।
- आय का प्रमाण (सैलरी स्लिप, ITR, बैंक स्टेटमेंट, स्व-प्रमाण पत्र)।
- पहचान प्रमाण (पैन, मतदाता पहचान पत्र, पासपोर्ट, ड्राइविंग लाइसेंस)।
- पते का प्रमाण (बिजली/पानी का बिल, किराया समझौता)।
- बैंक पासबुक या स्टेटमेंट (आधार से लिंक)।
- पक्का मकान न होने की घोषणा करने वाला हलफनामा।`
    },
    isActive: true
  },
  // 6A - NALSA Free Legal Aid
  {
    category: 'rights',
    tags: ['nalsa', 'legal_aid', 'free', 'dlsa', 'national'],
    sourceUrl: 'https://nalsa.gov.in',
    title: {
      en: 'Free Legal Aid in India — NALSA (National Legal Services Authority)',
      hi: 'भारत में निःशुल्क कानूनी सहायता — NALSA'
    },
    description: {
      en: `You have the right to FREE legal aid in India under Section 12 of the Legal Services Authorities Act.

Who is eligible for free legal aid:
- Women and children (all cases, no income limit)
- Persons with disability (40% or more)
- Persons facing domestic violence
- Persons in custody
- Victims of trafficking
- Persons with annual income below ₹1,00,000 (for cases other than Supreme Court) or ₹1,50,000 (for Supreme Court cases)
- Victims of mass disasters, caste discrimination

Are tenants facing eviction eligible?
YES — If you meet the income or other eligibility criteria above, eviction cases qualify for free legal aid as civil matters.

How to apply:
1. Visit your nearest District Legal Services Authority (DLSA) office
2. Carry income proof, Aadhaar card, and details of your case
3. DLSA will review your eligibility
4. If approved, a lawyer will be assigned to you free of charge
5. You can apply at any stage of your case — even if proceedings have already started

What DLSA does:
- Assigns free lawyers for court representation
- Provides free legal counselling
- Handles both civil (eviction, deposit) and criminal matters
- Delhi DLSA Helpline: 1516
- National NALSA Helpline: 15100`,
      hi: `आपको कानूनी सेवा प्राधिकरण अधिनियम की धारा 12 के तहत भारत में मुफ्त कानूनी सहायता का अधिकार है।

मुफ्त कानूनी सहायता के लिए कौन पात्र है:
- महिलाएं और बच्चे (सभी मामलों में, कोई आय सीमा नहीं)।
- विकलांग व्यक्ति (40% या अधिक)।
- घरेलू हिंसा का सामना करने वाले व्यक्ति।
- हिरासत में लिए गए व्यक्ति।
- तस्करी के शिकार लोग।
- ₹1,00,000 से कम वार्षिक आय वाले व्यक्ति (सुप्रीम कोर्ट के अलावा अन्य मामलों के लिए) या ₹1,50,000 से कम (सुप्रीम कोर्ट के मामलों के लिए)।
- बड़े हादसों या जातिगत भेदभाव के शिकार लोग।

क्या बेदखली का सामना कर रहे किरायेदार पात्र हैं?
हाँ — यदि आप ऊपर दी गई आय या अन्य पात्रता मानदंडों को पूरा करते हैं, तो बेदखली के मामले सिविल मामलों के रूप में मुफ्त कानूनी सहायता के लिए योग्य हैं।

आवेदन कैसे करें:
1. अपने निकटतम जिला विधिक सेवा प्राधिकरण (DLSA) कार्यालय में जाएं।
2. आय प्रमाण, आधार कार्ड और अपने मामले का विवरण साथ ले जाएं।
3. DLSA आपकी पात्रता की समीक्षा करेगा।
4. स्वीकृत होने पर, आपको निःशुल्क वकील आवंटित किया जाएगा।
5. आप अपने मामले के किसी भी चरण में आवेदन कर सकते हैं — भले ही अदालती कार्यवाही पहले ही शुरू हो चुकी हो।

DLSA क्या करता है:
- अदालत में प्रतिनिधित्व के लिए मुफ्त वकील प्रदान करता है।
- मुफ्त कानूनी परामर्श देता है।
- दीवानी (बेदखली, सुरक्षा जमा) और आपराधिक दोनों मामलों को संभालता है।
- दिल्ली DLSA हेल्पलाइन: 1516
- राष्ट्रीय NALSA हेल्पलाइन: 15100`
    },
    isActive: true
  }
];

const referralCentres = [
  // Delhi
  {
    type: 'legal_aid',
    isVerified: true,
    name: {
      en: 'Delhi District Legal Services Authority (DSLSA)',
      hi: 'दिल्ली जिला विधिक सेवा प्राधिकरण'
    },
    city: 'Delhi',
    state: 'Delhi',
    phone: '1516',
    website: 'https://dslsa.org',
    address: {
      en: 'Patiala House Courts Complex, New Delhi - 110001',
      hi: 'पटियाला हाउस कोर्ट्स कॉम्प्लेक्स, नई दिल्ली - 110001'
    }
  },
  // Mumbai
  {
    type: 'legal_aid',
    isVerified: true,
    name: {
      en: 'Maharashtra State Legal Services Authority (MASLSA)',
      hi: 'महाराष्ट्र राज्य विधिक सेवा प्राधिकरण'
    },
    city: 'Mumbai',
    state: 'Maharashtra',
    website: 'https://maslsa.nic.in',
    address: {
      en: 'High Court, Fort, Mumbai - 400032',
      hi: 'हाई कोर्ट, फोर्ट, मुंबई - 400032'
    }
  },
  // Pune
  {
    type: 'legal_aid',
    isVerified: true,
    name: {
      en: 'Pune District Legal Services Authority',
      hi: 'पुणे जिला विधिक सेवा प्राधिकरण'
    },
    city: 'Pune',
    state: 'Maharashtra',
    website: 'https://maslsa.nic.in',
    address: {
      en: 'District Court Complex, Pune - 411001',
      hi: 'जिला न्यायालय परिसर, पुणे - 411001'
    }
  },
  // Bengaluru
  {
    type: 'legal_aid',
    isVerified: true,
    name: {
      en: 'Karnataka State Legal Services Authority (KSLSA)',
      hi: 'कर्नाटक राज्य विधिक सेवा प्राधिकरण'
    },
    city: 'Bengaluru',
    state: 'Karnataka',
    website: 'https://kslsa.kar.nic.in',
    address: {
      en: 'High Court of Karnataka, Bengaluru - 560001',
      hi: 'कर्नाटक उच्च न्यायालय, बेंगलुरु - 560001'
    }
  },
  // Hyderabad
  {
    type: 'legal_aid',
    isVerified: true,
    name: {
      en: 'Telangana State Legal Services Authority (TSLSA)',
      hi: 'तेलंगाना राज्य विधिक सेवा प्राधिकरण'
    },
    city: 'Hyderabad',
    state: 'Telangana',
    website: 'https://tslsa.telangana.gov.in',
    address: {
      en: 'High Court of Telangana, Hyderabad - 500001',
      hi: 'तेलंगाना उच्च न्यायालय, हैदराबाद - 500001'
    }
  },
  // Chennai
  {
    type: 'legal_aid',
    isVerified: true,
    name: {
      en: 'Tamil Nadu State Legal Services Authority (TNSLSA)',
      hi: 'तमिलनाडु राज्य विधिक सेवा प्राधिकरण'
    },
    city: 'Chennai',
    state: 'Tamil Nadu',
    website: 'https://tnslsa.tn.gov.in',
    address: {
      en: 'High Court of Madras, Chennai - 600104',
      hi: 'मद्रास उच्च न्यायालय, चेन्नई - 600104'
    }
  },
  // Kolkata
  {
    type: 'legal_aid',
    isVerified: true,
    name: {
      en: 'West Bengal State Legal Services Authority (WBSLSA)',
      hi: 'पश्चिम बंगाल राज्य विधिक सेवा प्राधिकरण'
    },
    city: 'Kolkata',
    state: 'West Bengal',
    website: 'https://wbslsa.org',
    address: {
      en: 'Calcutta High Court, Kolkata - 700001',
      hi: 'कलकत्ता उच्च न्यायालय, कोलकाता - 700001'
    }
  },
  // Ahmedabad
  {
    type: 'legal_aid',
    isVerified: true,
    name: {
      en: 'Gujarat State Legal Services Authority (GSLSA)',
      hi: 'गुजरात राज्य विधिक सेवा प्राधिकरण'
    },
    city: 'Ahmedabad',
    state: 'Gujarat',
    website: 'https://gujaratslsa.gujarat.gov.in',
    address: {
      en: 'Gujarat High Court, Sola, Ahmedabad - 380060',
      hi: 'गुजरात उच्च न्यायालय, सोला, Ahmedabad - 380060'
    }
  },
  // Lucknow
  {
    type: 'legal_aid',
    isVerified: true,
    name: {
      en: 'Uttar Pradesh State Legal Services Authority (UPSLSA)',
      hi: 'उत्तर प्रदेश राज्य विधिक सेवा प्राधिकरण'
    },
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    website: 'http://upslsa.up.nic.in',
    phone: '0522-2623863',
    address: {
      en: 'Lucknow Bench, Allahabad High Court, Lucknow - 226001',
      hi: 'इलाहाबाद उच्च न्यायालय, लखनऊ पीठ, लखनऊ - 226001'
    }
  },
  // NGO Shelter Associates
  {
    type: 'ngo',
    isVerified: true,
    name: {
      en: 'Shelter Associates',
      hi: 'शेल्टर एसोसिएट्स'
    },
    city: 'Pune',
    state: 'Maharashtra',
    website: 'https://shelter-associates.org',
    phone: '020-24440363',
    sourceUrl: 'https://shelter-associates.danamojo.org/contact-us',
    address: {
      en: 'Lane No-18, Mahatma Society, Kothrud, Pune - 411038',
      hi: 'लेन नं-18, महात्मा सोसायटी, कोथरूड, पुणे - 411038'
    }
  },
  // NGO YUVA
  {
    type: 'ngo',
    isVerified: true,
    name: {
      en: 'YUVA — Youth for Unity and Voluntary Action',
      hi: 'युवा — यूथ फॉर यूनिटी एंड वॉलंटरी एक्शन'
    },
    city: 'Mumbai',
    state: 'Maharashtra',
    website: 'https://yuvaindia.org',
    phone: '+91-2227740750',
    additionalPhone: '+91-9833900200 (Anti-Eviction Support Cell)',
    sourceUrl: 'https://yuvaindia.org/contact-us/',
    address: {
      en: '58/D, First Floor, Off S.G. Barve Marg, Kamgar Nagar, Kurla East, Mumbai - 400024',
      hi: '58/D, पहली मंजिल, कामगार नगर, कुर्ला पूर्व, मुंबई - 400024'
    }
  },
  // NGO Jan Sahas
  {
    type: 'ngo',
    isVerified: true,
    name: {
      en: 'Jan Sahas Social Development Society',
      hi: 'जन साहस सामाजिक विकास संस्था'
    },
    city: 'Dewas',
    state: 'Madhya Pradesh',
    website: 'https://jansahas.org',
    sourceUrl: 'https://jansahas.org',
    address: {
      en: 'Jan Sahas, Dewas, Madhya Pradesh',
      hi: 'जन साहस, देवास, मध्य प्रदेश'
    }
  },
  // NGO Saathi
  {
    type: 'ngo',
    isVerified: true,
    name: {
      en: 'Saathi — Centre for Residential Resources and Care',
      hi: 'साथी — आवासीय संसाधन और देखभाल केंद्र'
    },
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    website: 'https://saathi.org.in',
    address: {
      en: 'Lucknow, Uttar Pradesh',
      hi: 'लखनऊ, उत्तर प्रदेश'
    },
    note: {
      en: 'Covers housing and welfare rights in North India including UP',
      hi: 'उत्तर भारत में आवास और कल्याण अधिकारों पर कार्य करती है'
    }
  }
];

async function seedLegalData() {
  try {
    await connectDatabase();
    console.log('Database connected for seeding...');

    let resourceInserted = 0;
    let resourceSkipped = 0;

    for (const resDoc of resources) {
      const exists = await Resource.findOne({
        sourceUrl: resDoc.sourceUrl,
        tags: resDoc.tags[0]
      });

      if (!exists) {
        await Resource.create(resDoc);
        resourceInserted++;
      } else {
        resourceSkipped++;
      }
    }

    console.log(`Resources: ${resourceInserted} inserted, ${resourceSkipped} already seeded/skipped.`);

    let referralInserted = 0;
    let referralSkipped = 0;

    for (const refDoc of referralCentres) {
      const exists = await ReferralCentre.findOne({
        'name.en': refDoc.name.en,
        city: refDoc.city
      });

      if (!exists) {
        await ReferralCentre.create(refDoc);
        referralInserted++;
      } else {
        referralSkipped++;
      }
    }

    console.log(`Referral Centres: ${referralInserted} inserted, ${referralSkipped} already seeded/skipped.`);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

if (require.main === module) {
  seedLegalData();
}

module.exports = seedLegalData;
