export interface DictionQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DictionExampleWord {
  written: string;
  pronounced: string;
  note: string;
}

export interface DictionLevelModule {
  id: string;
  order: number;
  unitNumber: 1 | 2;
  unitTitle: string;
  symbol: string;
  title: string;
  subtitle: string;
  phoneticClassification: string;
  mouthPosture: string;
  keyRule: string;
  commonMistakes: string[];
  examples: DictionExampleWord[];
  quiz: DictionQuizQuestion[];
  voiceEvaluation: {
    instruction: string;
    targetSentence: string;
    minAccuracy: number;
  };
}

export const DICTION_CURRICULUM: DictionLevelModule[] = [
  // ==================== ÜNİTE 1: ÜNLÜ HARFLER (A - Ü) ====================
  {
    id: 'unlu-a',
    order: 1,
    unitNumber: 1,
    unitTitle: 'Ünite 1 · Ünlü Harfler (Sesliler)',
    symbol: 'A',
    title: 'Seviye 1: A Ünlüsü',
    subtitle: 'Kalın A, İnce A ve Çene Açıklığı',
    phoneticClassification: 'Kalın · Düz · Geniş Ünlü',
    mouthPosture:
      'Alt çene rahatça aşağı iner, dil tabanda ve hafif geride düz durur, dudaklar gerginleşmeden doğal biçimde açılır. Ses boğazda sıkışmadan doğrudan ağız boşluğundan çıkmalıdır.',
    keyRule:
      'Türkçede A ünlüsü çoğunlukla kalın ve kısa söylenir; ancak dilimize yerleşmiş bazı sözcüklerde ince ve/veya uzun A (örn. kâr, hâlâ, lâle, hayâl) bulunur. Kalın ve ince A ayrımı anlamı doğrudan değiştirir.',
    commonMistakes: [
      'A sesini çeneyi yeterince açmadan "ı" veya "o" sesine kaydırarak boğuk çıkarmak.',
      'İnce A gerektiren "kâr" (kazanç) ile kalın A içeren "kar" (yağış) kelimelerini aynı okumak.',
      'Kısa okunması gereken Türkçe köklerde A sesini gereksiz yere uzatmak.',
    ],
    examples: [
      { written: 'Kar / Kâr', pronounced: 'Kar (kalın) / Kyar (ince A)', note: 'Anlam farkı yaratan kalın-ince A çifti' },
      { written: 'Hala / Hâlâ', pronounced: 'Hala (kısa) / Hâlâ (uzun-ince)', note: 'Babanın kız kardeşi vs. henüz' },
      { written: 'Ankara', pronounced: 'An-ka-ra', note: 'Üç A sesi de dengeli ve net çıkarılır' },
      { written: 'Sabah', pronounced: 'Sa-bah', note: 'İki hecede de çene açıklığı korunur' },
    ],
    quiz: [
      {
        id: 'q-a-1',
        question: 'Standart Türkçede "A" ünlüsünü doğru boğumlamak için ağız ve dil konumu nasıl olmalıdır?',
        options: [
          'Dudaklar öne büzülmeli, çene kapalı tutulmalıdır.',
          'Alt çene rahatça açılmalı, dil tabanda düz ve gevşek durmalıdır.',
          'Dil ucu üst dişlere bastırılmalı, dudaklar yanlara gerilmelidir.',
        ],
        correctIndex: 1,
        explanation: 'A düz ve geniş bir ünlüdür; alt çenenin rahat açılması ve dilin gevşek durması sesin berrak çıkmasını sağlar.',
      },
      {
        id: 'q-a-2',
        question: 'Aşağıdaki kelime çiftlerinden hangisinde ince A ve kalın A telaffuz farkı anlamı değiştirir?',
        options: ['Masa – Kasa', 'Kar – Kâr', 'Cam – Çam'],
        correctIndex: 1,
        explanation: '"Kar" kalın A ile yağışı, "kâr" ise ince A ile kazancı ifade eder.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Alt çenenizi rahatça açarak tüm A ünlülerini berrak ve boğuklaşmadan okuyun:',
      targetSentence: 'Ankara sabahında parkta rahatça kitap okuduk.',
      minAccuracy: 60,
    },
  },
  {
    id: 'unlu-e',
    order: 2,
    unitNumber: 1,
    unitTitle: 'Ünite 1 · Ünlü Harfler (Sesliler)',
    symbol: 'E',
    title: 'Seviye 2: E Ünlüsü',
    subtitle: 'Açık E ve Kapalı E Ayrımı',
    phoneticClassification: 'İnce · Düz · Geniş Ünlü',
    mouthPosture:
      'Dudaklar hafifçe gülümser gibi yanlara açılır, dilin ön kısmı hafifçe ön damağa yaklaşır. Çene A harfine göre daha az açılır.',
    keyRule:
      'İstanbul Türkçesinde E ünlüsünün iki tonu vardır: "Açık E" (el, gel, ses) ve özellikle ilk hecede "i"ye hafif yaklaşan "Kapalı E" (gece, kendi, pencere, mendil, yedi). Kapalı E’yi aşırı açık "a" gibi söylemek diksiyonu sertleştirir.',
    commonMistakes: [
      '"Kendi, pencere, mendil" gibi kelimelerde kapalı E yerine aşırı geniş ve sert açık E kullanmak.',
      'Kelime sonundaki E harfini yutarak veya kısarak belirsizleştirmek.',
    ],
    examples: [
      { written: 'El / Gel', pronounced: 'Açık E', note: 'Geniş ve berrak ön ünlü çıkışı' },
      { written: 'Kendi', pronounced: 'Kêndi (kapalı E)', note: 'İlk hecede hafif kapalı E tınısı' },
      { written: 'Pencere', pronounced: 'Pêncere', note: 'İlk E kapalı, sonraki E’ler açık' },
      { written: 'Gece', pronounced: 'Gêce', note: 'Zarif İstanbul Türkçesi tonlaması' },
    ],
    quiz: [
      {
        id: 'q-e-1',
        question: 'Aşağıdaki sözcüklerden hangisinin ilk hecesinde diksiyonda "Kapalı E" kullanılır?',
        options: ['Kendi', 'Elma', 'Eski'],
        correctIndex: 0,
        explanation: '"Kendi, pencere, mendil, gece, yedi" gibi sözcüklerin ilk hecesinde kapalı E telaffuzu esastır.',
      },
      {
        id: 'q-e-2',
        question: 'E ünlüsü fonetik özellik bakımından aşağıdakilerden hangisidir?',
        options: ['Kalın, yuvarlak, dar', 'İnce, düz, geniş', 'Kalın, düz, dar'],
        correctIndex: 1,
        explanation: 'E harfi dilin ön kısmında oluşan ince, düz ve geniş bir ünlüdür.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Kapalı E (pencere, gece, kendi) ve açık E dengesine dikkat ederek seslendirin:',
      targetSentence: 'Gece pencereden esen serin rüzgarı kendi evimizde hissettik.',
      minAccuracy: 60,
    },
  },
  {
    id: 'unlu-i-noktasiz',
    order: 3,
    unitNumber: 1,
    unitTitle: 'Ünite 1 · Ünlü Harfler (Sesliler)',
    symbol: 'I',
    title: 'Seviye 3: I Ünlüsü (Noktasız I)',
    subtitle: 'Art Damak Boğumlanması ve Düz Dudak Duruşu',
    phoneticClassification: 'Kalın · Düz · Dar Ünlü',
    mouthPosture:
      'Dil arkaya doğru çekilir ve yumuşak damağa yaklaşır. Dudaklar kesinlikle öne büzülmez, düz ve aralık kalır; dişler birbirine yakındır.',
    keyRule:
      'Noktasız I Türkçeye özgü en karakteristik seslerden biridir. Dudaklar büzülürse "u"ya, dil öne kayarsa "i"ye dönüşür. Temiz bir "I" için dudaklar düz, dil geride olmalıdır.',
    commonMistakes: [
      'Noktasız "ı" harfini "i" gibi ince söylemek (ör. "ılık" yerine "ilik" demek).',
      'Dudakları yuvarlayarak "ı" sesini "u"ya benzetmek.',
    ],
    examples: [
      { written: 'Ilık', pronounced: 'I-lık', note: 'Her iki ünlü de kalın ve düz' },
      { written: 'Irmak', pronounced: 'Ir-mak', note: 'Başlangıçtaki I boğazdan tok çıkar' },
      { written: 'Kış', pronounced: 'Kış', note: 'Dudaklar büzülmeden kısa ve net' },
      { written: 'Işık', pronounced: 'I-şık', note: 'Ş ünsüzü öncesi ve sonrası dengeli I' },
    ],
    quiz: [
      {
        id: 'q-i1-1',
        question: 'Noktasız "I" sesini çıkarırken dudakların ve dilin konumu nasıl olmalıdır?',
        options: [
          'Dudaklar öne yuvarlanmalı, dil önde olmalıdır.',
          'Dudaklar düz ve gerginsiz tutulmalı, dil geriye çekilmelidir.',
          'Ağız tamamen açılmalı, dil öne uzatılmalıdır.',
        ],
        correctIndex: 1,
        explanation: 'I ünlüsü kalın, düz ve dardır; dudaklar düz kalır, dil arkaya çekilir.',
      },
      {
        id: 'q-i1-2',
        question: '"Ilık" sözcüğündeki I harfleri yanlışlıkla İ gibi okunursa hangi farklı sözcük ortaya çıkar?',
        options: ['İlik', 'Islık', 'Işık'],
        correctIndex: 0,
        explanation: '"Ilık" (ne sıcak ne soğuk) ile "ilik" (kemik iliği / düğme iliği) tamamen farklı anlamlara sahiptir.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Dudaklarınızı büzmeden, noktasız I seslerini kalın ve net telaffuz edin:',
      targetSentence: 'Ilık kış sabahında ırmak kıyısında parlak ışık gördük.',
      minAccuracy: 60,
    },
  },
  {
    id: 'unlu-i-noktali',
    order: 4,
    unitNumber: 1,
    unitTitle: 'Ünite 1 · Ünlü Harfler (Sesliler)',
    symbol: 'İ',
    title: 'Seviye 4: İ Ünlüsü (Noktalı İ)',
    subtitle: 'İnce-Dar Netlik ve I–İ Karşıtlığı',
    phoneticClassification: 'İnce · Düz · Dar Ünlü',
    mouthPosture:
      'Dudak köşeleri hafifçe yanlara çekilir, dilin ön sırtı sert damağa yükselir. Hava dar bir kanaldan berrak ve tiz bir tınıyla çıkar.',
    keyRule:
      'Noktalı İ, Türkçenin en ince ve parlak ünlüsüdür. Özellikle I ve İ seslerinin yan yana veya yakın hecelerde bulunduğu cümlelerde dilin ön-arka geçişi çevik olmalıdır.',
    commonMistakes: [
      'İ sesini tembel bir dil duruşuyla "ı" veya "e"ye yaklaştırmak.',
      'Kelime sonundaki "-iyor" şimdiki zaman ekinde gereksiz hece yutması yapmak.',
    ],
    examples: [
      { written: 'İlik / Ilık', pronounced: 'İ-lik / I-lık', note: 'Ön dil (İ) ve art dil (I) ayrımı' },
      { written: 'Kişi / Kış', pronounced: 'Ki-şi / Kış', note: 'Berrak ve ince İ çıkışı' },
      { written: 'Bilim', pronounced: 'Bi-lim', note: 'İnce L ile uyumlu parlak İ' },
      { written: 'İyi', pronounced: 'İ-yi', note: 'Yumuşak Y köprüsüyle akıcı İ' },
    ],
    quiz: [
      {
        id: 'q-i2-1',
        question: '"İ" ünlüsü ile "I" ünlüsü arasındaki temel boğumlanma farkı nedir?',
        options: [
          'İ ünlüsünde dil öne yükselir (ince), I ünlüsünde dil geriye çekilir (kalın).',
          'İ ünlüsünde dudaklar yuvarlanır, I ünlüsünde çene tamamen açılır.',
          'İki ses arasında fonetik bir fark yoktur.',
        ],
        correctIndex: 0,
        explanation: 'Her ikisi de düz ve dardır; temel fark dilin önde (İ - ince) ya da arkada (I - kalın) olmasıdır.',
      },
      {
        id: 'q-i2-2',
        question: 'Aşağıdaki sözcüklerden hangisinde tüm ünlüler noktalı İ sesinden oluşur?',
        options: ['Bilim', 'Işıltı', 'Kırmızı'],
        correctIndex: 0,
        explanation: '"Bilim" kelimesinin her iki hecesinde de ince, düz, dar İ ünlüsü bulunur.',
      },
    ],
    voiceEvaluation: {
      instruction: 'İ seslerini parlak, ince ve net; I seslerini ise kalın ayrımıyla okuyun:',
      targetSentence: 'İki bilinçli kişi bilim ve iletişim üzerine fikir birliğine vardı.',
      minAccuracy: 60,
    },
  },
  {
    id: 'unlu-o',
    order: 5,
    unitNumber: 1,
    unitTitle: 'Ünite 1 · Ünlü Harfler (Sesliler)',
    symbol: 'O',
    title: 'Seviye 5: O Ünlüsü',
    subtitle: 'Yuvarlak Dudak Şekli ve Tok Çıkış',
    phoneticClassification: 'Kalın · Yuvarlak · Geniş Ünlü',
    mouthPosture:
      'Dudaklar belirgin biçimde öne uzatılarak yuvarlak bir halka oluşturur, dil geriye çekilir ve ağız boşluğu genişler.',
    keyRule:
      'Türkçe kökenli sözcüklerde "O" ünlüsü (şimdiki zaman "-yor" eki hariç) yalnızca ilk hecede bulunur. Dudakların yuvarlaklığı tam verilmezse ses bozulup "a" veya "ö"ye yaklaşır.',
    commonMistakes: [
      'Dudakları öne yuvarlamadan tembelce konuşarak O sesini A’ya benzetmek.',
      'Alıntı kelimelerde (doktor, otomobil) ardışık O seslerinde dudak gerginliğini kaybetmek.',
    ],
    examples: [
      { written: 'Okul', pronounced: 'O-kul', note: 'İlk hecede dolgun, yuvarlak O' },
      { written: 'Orman', pronounced: 'Or-man', note: 'R öncesi tok ve açık O çıkışı' },
      { written: 'Sonbahar', pronounced: 'Son-ba-har', note: 'Yuvarlak O’dan düz A’ya temiz geçiş' },
      { written: 'Doğru', pronounced: 'Doo-ru', note: 'Ğ ile bir ses uzayan yumuşak O' },
    ],
    quiz: [
      {
        id: 'q-o-1',
        question: 'Türkçe kökenli sözcüklerde "O" ünlüsüyle ilgili temel kural nedir?',
        options: [
          '"-yor" eki dışında yalnızca ilk hecede bulunur.',
          'Yalnızca kelimenin son hecesinde yer alır.',
          'Dudaklar düz tutularak söylenir.',
        ],
        correctIndex: 0,
        explanation: 'Büyük ve küçük ünlü uyumu gereği Türkçe kelimelerde O ve Ö (-yor eki hariç) sadece ilk hecede bulunur.',
      },
      {
        id: 'q-o-2',
        question: 'O ünlüsünün doğru fonetik sınıflandırması hangisidir?',
        options: ['İnce · Yuvarlak · Dar', 'Kalın · Yuvarlak · Geniş', 'Kalın · Düz · Geniş'],
        correctIndex: 1,
        explanation: 'O harfi dilin geride, dudakların yuvarlak ve ağız açıklığının geniş olduğu bir ünlüdür.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Dudaklarınızı belirgin biçimde yuvarlayarak O seslerini dolgun okuyun:',
      targetSentence: 'Okul yolundaki ormanda sonbahar yaprakları topladık.',
      minAccuracy: 60,
    },
  },
  {
    id: 'unlu-o-noktali',
    order: 6,
    unitNumber: 1,
    unitTitle: 'Ünite 1 · Ünlü Harfler (Sesliler)',
    symbol: 'Ö',
    title: 'Seviye 6: Ö Ünlüsü',
    subtitle: 'Ön Yuvarlak Boğumlanma ve O–Ö Farkı',
    phoneticClassification: 'İnce · Yuvarlak · Geniş Ünlü',
    mouthPosture:
      'Dil "E" harfindeki gibi öndedir, dudaklar ise "O" harfindeki gibi öne doğru yuvarlanır. Yani dil önde, dudaklar yuvarlaktır.',
    keyRule:
      'Ö sesi, O sesinin ince karşılığıdır. Yabancı konuşmacılar veya acele konuşanlar Ö’yü O’ya ya da E’ye kaydırabilir. Dudak yuvarlaklığı ile dilin ön konumunu aynı anda korumak temel kuraldır.',
    commonMistakes: [
      'Dudakları gevşek bırakıp Ö yerine E veya O söylemek ("göz" yerine "goz" ya da "gez").',
      '"Öğrenci, öğretmen" kelimelerinde ğ harfini sert g gibi okuyarak Ö uzamasını bozmak.',
    ],
    examples: [
      { written: 'Göz / Koz', pronounced: 'Göz (ince) / Koz (kalın)', note: 'Ö ve O ayrımı' },
      { written: 'Söz', pronounced: 'Söz', note: 'Önde yuvarlak ve zarif çıkış' },
      { written: 'Öğrenci', pronounced: 'Öö-ren-ci', note: 'Ğ etkisiyle yumuşakça uzayan Ö' },
      { written: 'Gökyüzü', pronounced: 'Gök-yü-zü', note: 'Ö’den Ü’ye pürüzsüz yuvarlak geçiş' },
    ],
    quiz: [
      {
        id: 'q-o2-1',
        question: '"Ö" sesini doğru çıkarmak için hangi iki hareket birlikte yapılmalıdır?',
        options: [
          'Dil geride tutulmalı, dudaklar yanlara gerilmelidir.',
          'Dil önde (E konumunda) olmalı, dudaklar öne yuvarlanmalıdır.',
          'Çene tamamen açılmalı, dudaklar düz bırakılmalıdır.',
        ],
        correctIndex: 1,
        explanation: 'Ö ince ve yuvarlak bir ünlüdür; dil önde dururken dudaklar yuvarlaklaştırılır.',
      },
      {
        id: 'q-o2-2',
        question: '"Öğrenci" kelimesi diksiyon kurallarına göre nasıl seslendirilir?',
        options: ['Ogrenci', 'Öörenci (ö sesi yumuşakça uzatılır)', 'Ögrengi'],
        correctIndex: 1,
        explanation: 'Yumuşak g (ğ) okunmaz, kendisinden önceki Ö ünlüsünü hafifçe uzatır.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Dudaklarınızı yuvarlak ve dilinizi önde tutarak Ö ünlülerini net seslendirin:',
      targetSentence: 'Özgür öğrenci gökyüzündeki ördekleri hayranlıkla gözlemledi.',
      minAccuracy: 60,
    },
  },
  {
    id: 'unlu-u',
    order: 7,
    unitNumber: 1,
    unitTitle: 'Ünite 1 · Ünlü Harfler (Sesliler)',
    symbol: 'U',
    title: 'Seviye 7: U Ünlüsü',
    subtitle: 'Dar Yuvarlak Dudak Kanalı ve Derin Tını',
    phoneticClassification: 'Kalın · Yuvarlak · Dar Ünlü',
    mouthPosture:
      'Dudaklar O harfine göre daha çok büzülür ve öne uzatılır; dilin arka kısmı yumuşak damağa yükselir, çene aralığı dardır.',
    keyRule:
      'U ünlüsü derin, tok ve dar yuvarlak bir sestir. Dudaklar yeterince ileri uzatılmazsa ses sönükleşir ve "ı"ya kayar.',
    commonMistakes: [
      'Dudak kaslarını çalıştırmadan "bulut, umut" gibi kelimelerde U sesini yutmak.',
      'U ve Ü seslerinin bir arada olduğu cümlelerde kalın-ince geçişini karıştırmak.',
    ],
    examples: [
      { written: 'Umut', pronounced: 'U-mut', note: 'Her iki hecede güçlü dudak yuvarlaklığı' },
      { written: 'Bulut', pronounced: 'Bu-lut', note: 'B ve L ile dengeli kalın U' },
      { written: 'Uzun', pronounced: 'U-zun', note: 'Akıcı Z ile uyumlu tok U' },
      { written: 'Huzur', pronounced: 'Hu-zur', note: 'Son R yumuşak biter' },
    ],
    quiz: [
      {
        id: 'q-u1-1',
        question: '"U" ünlüsü ile "O" ünlüsü arasındaki en belirgin fark nedir?',
        options: [
          'U daha dardır ve dudaklar daha fazla öne büzülür.',
          'U ince bir ünlüdür, O kalın bir ünlüdür.',
          'U düz dudakla söylenir.',
        ],
        correctIndex: 0,
        explanation: 'Her ikisi de kalın ve yuvarlaktır; ancak O geniş, U ise dar bir ünlüdür.',
      },
      {
        id: 'q-u1-2',
        question: 'U ünlüsünün fonetik özellikleri hangisidir?',
        options: ['Kalın · Yuvarlak · Dar', 'İnce · Düz · Dar', 'Kalın · Düz · Geniş'],
        correctIndex: 0,
        explanation: 'U ünlüsü dilin arkada, dudakların yuvarlak ve çene açıklığının dar olduğu sestir.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Dudaklarınızı öne büzerek U seslerini tok ve berrak telaffuz edin:',
      targetSentence: 'Uzun yolculukta bulutların altında huzurlu bir umut bulduk.',
      minAccuracy: 60,
    },
  },
  {
    id: 'unlu-u-noktali',
    order: 8,
    unitNumber: 1,
    unitTitle: 'Ünite 1 · Ünlü Harfler (Sesliler)',
    symbol: 'Ü',
    title: 'Seviye 8: Ü Ünlüsü',
    subtitle: 'İnce Dar Yuvarlak Çıkış ve Ünlüler Finali',
    phoneticClassification: 'İnce · Yuvarlak · Dar Ünlü',
    mouthPosture:
      'Dil "İ" harfindeki gibi öne yükselir, dudaklar ise ıslık çalar gibi öne büzülür. En dar ve ince yuvarlak ünlüdür.',
    keyRule:
      'Ü harfi, U harfinin ince eşidir. Dudaklar büzülmezse "i"ye, dil geriye kayarsa "u"ya dönüşür. Bu seviyeyi tamamladığınızda Türkçenin 8 ünlüsünü eksiksiz bitirmiş olacaksınız!',
    commonMistakes: [
      'Dudak büzmeyi ihmal edip "gül" yerine "gil", "yüz" yerine "yiz" gibi telaffuz etmek.',
      'Dili geriye çekerek "güneş" yerine "guneş" demek.',
    ],
    examples: [
      { written: 'Gül / Kul', pronounced: 'Gül (ince) / Kul (kalın)', note: 'Ü ve U karşıtlığı' },
      { written: 'Güneş', pronounced: 'Gü-neş', note: 'İnce G ve parlak Ü uyumu' },
      { written: 'Kültür', pronounced: 'Kül-tür', note: 'İki hecede de büzük dudak korunur' },
      { written: 'Teşekkür', pronounced: 'Te-şek-kür', note: 'Son hecede vurgu ve net Ü' },
    ],
    quiz: [
      {
        id: 'q-u2-1',
        question: '"Ü" sesini doğru çıkarırken dudaklar ve dil nasıl konumlanır?',
        options: [
          'Dil geride, dudaklar düz olmalıdır.',
          'Dil önde (İ gibi), dudaklar ıslık çalar gibi öne büzülmelidir.',
          'Ağız tamamen açık ve dudaklar gevşek olmalıdır.',
        ],
        correctIndex: 1,
        explanation: 'Ü, ince, yuvarlak ve dar bir ünlüdür; dil önde, dudaklar büzüktür.',
      },
      {
        id: 'q-u2-2',
        question: 'Türkçedeki 8 ünlü harf içinde "ince, yuvarlak, dar" tek ünlü hangisidir?',
        options: ['Ö', 'Ü', 'İ'],
        correctIndex: 1,
        explanation: 'Ö geniş, İ düz ünlüdür; ince, yuvarlak ve dar olan tek ünlü Ü’dür.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Dudaklarınızı büzerek tüm Ü seslerini ince ve temiz biçimde okuyun:',
      targetSentence: 'Gülümseyen gençler güneşli günde kültür müzesini gezdi.',
      minAccuracy: 60,
    },
  },

  // ==================== ÜNİTE 2: ÜNSÜZLER VE AKICILIK KURALLARI ====================
  {
    id: 'unsuz-yumusak-g',
    order: 9,
    unitNumber: 2,
    unitTitle: 'Ünite 2 · Ünsüzler ve Akıcılık Kuralları',
    symbol: 'Ğ',
    title: 'Seviye 9: Yumuşak G (Ğ) Kuralı',
    subtitle: 'Ünlü Uzatma ve Yumuşak Geçiş Köprüsü',
    phoneticClassification: 'Sessiz Uzatıcı · Yumuşak Geçiş Ünsüzü',
    mouthPosture:
      'Gırtlakta sert bir sürtünme veya "g" patlaması yapılmaz. Kendisinden önceki ünlü yaklaşık bir ses birimi uzatılır; ince ünlüler arasında hafif "y"ye yakın bir geçiş oluşur.',
    keyRule:
      'Türkçede yumuşak g (ğ) kendi başına bağımsız bir ünsüz olarak seslendirilmez. "Dağ → Daa", "Yağmur → Yaamur", "Değil → Deyil/Deil" biçiminde akıcı okunur.',
    commonMistakes: [
      'Ğ harfini gırtlaktan hırıltılı veya sert "g" gibi okumak.',
      'İki ünlü arasındaki ğ harfinde gereksiz kesinti/duraksama yapmak.',
    ],
    examples: [
      { written: 'Dağ', pronounced: 'Daa', note: '"a" ünlüsü yumuşakça uzatılır' },
      { written: 'Yağmur', pronounced: 'Yaa-mur', note: 'Akıcı ünlü uzaması' },
      { written: 'Değil', pronounced: 'De-yil / De-il', note: 'Asla "degil" denmez' },
      { written: 'Ağaç', pronounced: 'A-aç', note: 'İki A arasında kesintisiz geçiş' },
    ],
    quiz: [
      {
        id: 'q-g-1',
        question: 'Standart Türkçe diksiyonunda "ğ" (yumuşak g) harfinin temel işlevi nedir?',
        options: [
          'Gırtlaktan sert bir G sesi çıkarmak',
          'Kendinden önceki ünlüyü uzatmak veya iki ünlü arasında yumuşak geçiş sağlamak',
          'Kelime başında vurgu yapmak',
        ],
        correctIndex: 1,
        explanation: 'Yumuşak g okunmaz; önceki ünlüyü uzatarak ya da ince ünlülerde hafif geçiş kurarak akıcılık sağlar.',
      },
      {
        id: 'q-g-2',
        question: '"Sağanak" kelimesi diksiyonda nasıl telaffuz edilir?',
        options: ['Sag-anak', 'Saa-nak', 'Sak-anak'],
        correctIndex: 1,
        explanation: 'İki A arasındaki ğ düşerek A sesini yumuşakça uzatır: "Saa-nak".',
      },
    ],
    voiceEvaluation: {
      instruction: 'Ğ harflerini sertleştirmeden, önceki ünlüleri yumuşakça uzatarak okuyun:',
      targetSentence: 'Sağanak yağmurda dağdaki bağ evine sığındık.',
      minAccuracy: 60,
    },
  },
  {
    id: 'unsuz-r',
    order: 10,
    unitNumber: 2,
    unitTitle: 'Ünite 2 · Ünsüzler ve Akıcılık Kuralları',
    symbol: 'R',
    title: 'Seviye 10: R Harfi ve Son Ses Yumuşatması',
    subtitle: 'Dil Ucu Titreşimi ve Kelime Sonu R Dengesi',
    phoneticClassification: 'Akıcı · Dil Ucu Titrek Ünsüz',
    mouthPosture:
      'Dil ucu üst diş etine tek bir nazik vuruşla dokunur. Kelime sonundaki R’de ise dil ucu sertçe titretilmez; hafif nefesli ve yumuşak biter.',
    keyRule:
      'Türkçede kelime ortasındaki R tek vuruşlu ve nettir; kelime sonundaki R ise (gelir, gider, teşekkürler) abartılı biçimde "rrrr" diye yuvarlanmadan zarifçe söndürülür.',
    commonMistakes: [
      'Kelime sonundaki R sesini tamamen yutmak ("gidi-yo" yerine net ama yumuşak R olmalıdır).',
      'R sesini aşırı sert ve uzun titretmek.',
    ],
    examples: [
      { written: 'Gelir', pronounced: 'Ge-li(r)', note: 'Son R yumuşak fısıltıyla biter' },
      { written: 'Berber', pronounced: 'Ber-be(r)', note: 'Orta R net, son R zarif' },
      { written: 'Teşekkürler', pronounced: 'Te-şek-kür-le(r)', note: 'Doğal son ses dengesi' },
    ],
    quiz: [
      {
        id: 'q-r-1',
        question: 'Türkçede kelime sonundaki "R" harfi (örn. gelir, teşekkürler) nasıl telaffuz edilmelidir?',
        options: [
          'Çok sert ve uzun süre titretilerek',
          'Hafif nefesli ve yumuşak bir dokunuşla',
          'L harfine dönüştürülerek',
        ],
        correctIndex: 1,
        explanation: 'Kelime sonundaki R sert yuvarlanmaz; hafif fısıltılı, nazik bir titreşimle tamamlanır.',
      },
      {
        id: 'q-r-2',
        question: 'R sesinin oluşumunda ağız içi hangi organ temel rol oynar?',
        options: ['Alt dudak', 'Dil ucu ve üst diş eti', 'Yumuşak damak'],
        correctIndex: 1,
        explanation: 'R sesi dil ucunun üst diş etine hafifçe dokunup titreşmesiyle oluşur.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Orta hecelerdeki R’leri net, kelime sonlarındaki R’leri yumuşak tamamlayın:',
      targetSentence: 'Bir berber bir berbere teşekkür eder.',
      minAccuracy: 60,
    },
  },
  {
    id: 'unsuz-s-c',
    order: 11,
    unitNumber: 2,
    unitTitle: 'Ünite 2 · Ünsüzler ve Akıcılık Kuralları',
    symbol: 'Ş · Ç',
    title: 'Seviye 11: Ş ve Ç Ünsüzleri',
    subtitle: 'Islıksız Net Boğumlanma ve Dudak Çevikliği',
    phoneticClassification: 'Sert · Ön Damak Sürtünmeli / Patlamalı',
    mouthPosture:
      'Ş harfinde dudaklar hafif öne gelir, hava dil sırtı ile ön damak arasından tok akar. Ç harfinde dil ucu önce diş etine basar, ardından kısa bir patlamayla açılır.',
    keyRule:
      'S–Ş ve C–Ç karışıklığı diksiyonda en sık görülen artikülasyon sorunudur. Dudakların öne hareketini belirginleştirmek Ş ve Ç seslerini S’den net biçimde ayırır.',
    commonMistakes: [
      'Ş sesini fazla ıslıklı (sivri) çıkarmak veya S ile karıştırmak.',
      'Hızlı konuşmada Ç sesini yumuşatıp C’ye dönüştürmek.',
    ],
    examples: [
      { written: 'Şişe', pronounced: 'Şi-şe', note: 'S ile karışmayan tok Ş' },
      { written: 'Çiçek', pronounced: 'Çi-çek', note: 'Kısa ve temiz Ç patlaması' },
      { written: 'Köşe', pronounced: 'Kö-şe', note: 'Ö yuvarlaklığından Ş’ye rahat geçiş' },
    ],
    quiz: [
      {
        id: 'q-sc-1',
        question: '"Ş" sesini "S" sesinden net biçimde ayırmak için dudaklar nasıl konumlanmalıdır?',
        options: [
          'Dudaklar hafifçe öne uzatılmalıdır.',
          'Dudaklar tamamen içeri çekilmelidir.',
          'Alt çene sonuna kadar açılmalıdır.',
        ],
        correctIndex: 0,
        explanation: 'Ş sesinde dudakların hafifçe öne uzatılması sesin tok ve ıslıksız çıkmasını sağlar.',
      },
      {
        id: 'q-sc-2',
        question: 'Aşağıdaki tekerleme parçası özellikle hangi seslerin çevikliğini geliştirir? "Şu köşe yaz köşesi, ortadaki su şişesi."',
        options: ['Ğ ve R', 'Ş ve S', 'M ve N'],
        correctIndex: 1,
        explanation: 'Bu klasik tekerleme S ve Ş arasındaki hızlı dil-dudak geçişini çalıştırır.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Ş, S ve Ç seslerini birbirine karıştırmadan berrak biçimde okuyun:',
      targetSentence: 'Şu köşe yaz köşesi, şu köşe kış köşesi, ortadaki su şişesi.',
      minAccuracy: 60,
    },
  },
  {
    id: 'kural-ulama',
    order: 12,
    unitNumber: 2,
    unitTitle: 'Ünite 2 · Ünsüzler ve Akıcılık Kuralları',
    symbol: 'Ulama',
    title: 'Seviye 12: Ulama ve Konuşma Ritmi',
    subtitle: 'Sözcükleri Birbirine Bağlayan Melodik Akış',
    phoneticClassification: 'Bürünsel Akıcılık Kuralı (Liaison)',
    mouthPosture:
      'Ünsüzle biten bir sözcükten hemen sonra ünlüyle başlayan bir sözcük geldiğinde (arada noktalama yoksa), ilk sözcüğün son ünsüzü sonraki ünlünün başına bağlanarak kesintisiz okunur.',
    keyRule:
      'Ulama, konuşmayı kesik kesik "robotik" okumaktan kurtarıp doğal İstanbul Türkçesi melodisine kavuşturur. Ancak arada virgül veya nokta varsa ulama yapılmaz!',
    commonMistakes: [
      'Her kelimeden sonra duraksayarak cümlenin melodisini kırmak.',
      'Araya virgül girdiği halde iki kelimeyi birbirine ulamak.',
    ],
    examples: [
      { written: 'Dün akşam', pronounced: 'Dü-nak-şam', note: 'N harfi A’ya bağlanır' },
      { written: 'Sonbahar akşamı', pronounced: 'Son-ba-ha-rak-şa-mı', note: 'R ve A pürüzsüz birleşir' },
      { written: 'Bir an', pronounced: 'Bi-ran', note: 'Kesintisiz doğal akış' },
    ],
    quiz: [
      {
        id: 'q-ul-1',
        question: 'Aşağıdaki ifadelerin hangisinde ulama yapılabilir?',
        options: ['Dün akşam', 'Kırmızı araba', 'Dün, akşam'],
        correctIndex: 0,
        explanation: '"Dün akşam" ifadesinde ilk kelime ünsüzle biter, ikinci kelime ünlüyle başlar ve arada noktalama yoktur.',
      },
      {
        id: 'q-ul-2',
        question: 'İki kelime arasında virgül (,) bulunuyorsa ulama kuralı nasıl uygulanır?',
        options: [
          'Ulama yapılmaz, kısa bir durak verilir.',
          'Kelimeler mutlaka birbirine bağlanır.',
          'İkinci kelime sessiz okunur.',
        ],
        correctIndex: 0,
        explanation: 'Noktalama işaretleri nefes ve anlam durağıdır; bu nedenle virgül varsa ulama yapılmaz.',
      },
    ],
    voiceEvaluation: {
      instruction: 'Ünsüz-ünlü geçişlerini (dün akşam, uzun bir) kesmeden melodik bir akışla okuyun:',
      targetSentence: 'Dün akşam İstanbul sokaklarında uzun bir yürüyüş yaptık.',
      minAccuracy: 60,
    },
  },
];
