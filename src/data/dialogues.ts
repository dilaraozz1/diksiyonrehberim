import { Dialogue, TongueTwister, WordAnalysis } from '../types';

export const DIALOGUES: Dialogue[] = [
  {
    id: 'a1-selamlasma',
    title: 'Tanışma ve Selamlaşma',
    level: 'A1',
    levelTitle: 'A1 - Başlangıç Seviyesi',
    description: 'İlk tanışmada kullanılan temel nezaket ifadeleri, hal hatır sorma ve veda cümleleri.',
    scenario: 'İstanbul Boğazı kıyısındaki bir kafede karşılaşan iki eski arkadaş ve yeni tanışan bir misafir arasındaki doğal sohbet.',
    culturalNote: 'Türk kültüründe "Nasılsınız?" sorusuna sadece "İyiyim" demek yerine "Teşekkür ederim, siz nasılsınız?" ile karşılık vermek çok zarif bir kuraldır.',
    speakers: [
      { id: 'sp1', name: 'Ahmet', role: 'Öğrenci', gender: 'male', color: '#1E3A8A' },
      { id: 'sp2', name: 'Elif', role: 'Mimar', gender: 'female', color: '#047857' }
    ],
    sentences: [
      {
        id: 's-1-1',
        speakerId: 'sp1',
        speakerName: 'Ahmet',
        turkishText: 'Merhaba Elif, nasılsın? Seni burada görmek çok güzel!',
        englishText: 'Hello Elif, how are you? It is wonderful to see you here!',
        phoneticSpelling: 'mer-ha-ba e-lif, na-sıl-sın? se-ni bu-ra-da gör-mek çok gü-zel!',
        grammarNote: '"Nasılsın" kelimesi samimi ortamda kullanılır; resmi ortamda "Nasılsınız?" tercih edilir.'
      },
      {
        id: 's-1-2',
        speakerId: 'sp2',
        speakerName: 'Elif',
        turkishText: 'İyiyim Ahmet, çok teşekkür ederim. Sen ne yapıyorsun?',
        englishText: 'I am doing well Ahmet, thank you very much. What are you doing?',
        phoneticSpelling: 'i-yi-yim ah-met, çok te-şek-kür e-de-rim. sen ne ya-pı-yor-sun?',
        grammarNote: '"İyiyim" sözcüğünde iki sesli harf arasına kaynaştırma ünsüzü "y" gelir.'
      },
      {
        id: 's-1-3',
        speakerId: 'sp1',
        speakerName: 'Ahmet',
        turkishText: 'Ben de kütüphaneye gidiyordum, biraz dinlenmek için çay içiyorum.',
        englishText: 'I was on my way to the library too, having tea to rest for a bit.',
        phoneticSpelling: 'ben de kü-tüp-ha-ne-ye gi-di-yor-dum, bi-raz din-len-mek i-çin çay i-çi-yo-rum.',
        grammarNote: '"kütüphaneye" kelimesinde yönelme durumu (-e) vardır.'
      },
      {
        id: 's-1-4',
        speakerId: 'sp2',
        speakerName: 'Elif',
        turkishText: 'Harika bir fikir! Ben de sana eşlik edebilir miyim?',
        englishText: 'Great idea! May I join you?',
        phoneticSpelling: 'ha-ri-ka bir fi-kir! ben de sa-na eş-lik e-de-bi-lir mi-yim?',
        grammarNote: '"eşlik edebilir miyim?" yeterlilik fiili (-ebilmek) ile kibar rica bildirir.'
      },
      {
        id: 's-1-5',
        speakerId: 'sp1',
        speakerName: 'Ahmet',
        turkishText: 'Elbette, lütfen otur! Garsonu çağıralım, sana da sıcak bir çay söyleyelim.',
        englishText: 'Of course, please sit down! Let us call the waiter and order hot tea for you too.',
        phoneticSpelling: 'el-bet-te, lüt-fen o-tur! gar-so-nu ça-ğı-ra-lım, sa-na da sı-cak bir çay söy-le-ye-lim.',
        grammarNote: '"çağıralım" ve "söyleyelim" 1. çoğul şahıs istek kipi ekleridir (-elim / -alım).'
      }
    ]
  },
  {
    id: 'a2-restoran',
    title: 'Restoranda Sipariş Verme',
    level: 'A2',
    levelTitle: 'A2 - Temel Seviye',
    description: 'Menü isteme, yerel lezzetler hakkında bilgi alma, sipariş verme ve hesabı isteme.',
    scenario: 'Geleneksel bir Türk lokantasında öğle yemeği için sipariş veren bir müşteri ile güler yüzlü garson arasındaki diyalog.',
    culturalNote: 'Türk lokantalarında çorbadan sonra genellikle "Afiyet olsun" denir ve yemek sonunda ikram çay veya Türk kahvesi servis edilebilir.',
    speakers: [
      { id: 'sp3', name: 'Garson', role: 'Restoran Çalışanı', gender: 'male', color: '#B45309' },
      { id: 'sp4', name: 'Müşteri', role: 'Yemeksever', gender: 'female', color: '#4338CA' }
    ],
    sentences: [
      {
        id: 's-2-1',
        speakerId: 'sp3',
        speakerName: 'Garson',
        turkishText: 'Hoş geldiniz efendim, iki kişilik bir masa mı arzu edersiniz?',
        englishText: 'Welcome, sir/madam, would you prefer a table for two?',
        phoneticSpelling: 'hoş gel-di-niz e-fen-dim, i-ki ki-şi-lik bir ma-sa mı ar-zu e-der-si-niz?',
        grammarNote: '"Hoş geldiniz" nezaket ifadesine Türkçede her zaman "Hoş bulduk" ile cevap verilir.'
      },
      {
        id: 's-2-2',
        speakerId: 'sp4',
        speakerName: 'Müşteri',
        turkishText: 'Hoş bulduk, pencere kenarında sakin bir masa rica ediyorum.',
        englishText: 'Glad to be here, I would like a quiet table by the window, please.',
        phoneticSpelling: 'hoş bul-duk, pen-ce-re ke-na-rın-da sa-kin bir ma-sa ri-ca e-di-yo-rum.',
        grammarNote: '"kenarında" kelimesinde bulunma durumu eki (-da) ve iyelik eki bulunmaktadır.'
      },
      {
        id: 's-2-3',
        speakerId: 'sp3',
        speakerName: 'Garson',
        turkishText: 'Tabii ki, buyrun lütfen. Bugünün özel çorbası süzme mercimek.',
        englishText: 'Of course, this way please. Today\'s special soup is strained lentil soup.',
        phoneticSpelling: 'ta-bi-i ki, buy-run lüt-fen. bü-gü-nün ö-zel çor-ba-sı süz-me mer-ci-mek.',
        grammarNote: '"buyrun" (buyurunuz) misafirperverlik ve yönlendirme ifadesidir.'
      },
      {
        id: 's-2-4',
        speakerId: 'sp4',
        speakerName: 'Müşteri',
        turkishText: 'Başlangıç olarak mercimek çorbası, ana yemek olarak da ızgara köfte alayım.',
        englishText: 'For starters I will take lentil soup, and for the main dish grilled meatballs.',
        phoneticSpelling: 'baş-lan-gıç o-la-rak mer-ci-mek çor-ba-sı, a-na ye-mek o-la-rak da ız-ga-ra köf-te a-la-yım.',
        grammarNote: '"alayım" fiili sipariş verirken kibar birinci tekil şahıs istek kipidir.'
      },
      {
        id: 's-2-5',
        speakerId: 'sp3',
        speakerName: 'Garson',
        turkishText: 'Yemeğinizin yanına taze mevsim salatası ve yayık ayranı getireyim mi?',
        englishText: 'Shall I bring fresh seasonal salad and churned ayran with your meal?',
        phoneticSpelling: 'ye-me-ği-ni-zin ya-nı-na ta-ze mev-sim sa-la-ta-sı ve ya-yık ay-ra-nı ge-ti-re-yim mi?',
        grammarNote: '"yemeğinizin" kelimesinde "k" harfi ünlüyle başlayan ek aldığında yumuşayarak "ğ" olur.'
      }
    ]
  },
  {
    id: 'b1-is-gorusmesi',
    title: 'İş Görüşmesi ve Kendini Tanıtma',
    level: 'B1',
    levelTitle: 'B1 - Orta Seviye',
    description: 'Profesyonel özgeçmiş anlatımı, güçlü yönler, çalışma deneyimi ve hedeflerden bahsetme.',
    scenario: 'Yazılım ve tasarım ajansının insan kaynakları yöneticisi ile tecrübeli adayın mülakat anı.',
    culturalNote: 'Türk iş dünyasında mülakatlarda hem samimi hem de saygılı bir üslup ("siz" dili) ve net diksiyon büyük avantaj sağlar.',
    speakers: [
      { id: 'sp5', name: 'Zeynep Hanım', role: 'İK Direktörü', gender: 'female', color: '#9D174D' },
      { id: 'sp6', name: 'Burak Bey', role: 'Yazılım Uzmanı', gender: 'male', color: '#065F46' }
    ],
    sentences: [
      {
        id: 's-3-1',
        speakerId: 'sp5',
        speakerName: 'Zeynep Hanım',
        turkishText: 'Burak Bey merhaba, şirketimize gösterdiğiniz ilgi için çok teşekkür ederiz.',
        englishText: 'Hello Mr. Burak, thank you very much for your interest in our company.',
        phoneticSpelling: 'bu-rak bey mer-ha-ba, şir-ke-ti-mi-ze gös-ter-di-ği-niz il-gi i-çin çok te-şek-kür e-de-riz.',
        grammarNote: '"şirketimize" kelimesinde yönelme durumu (-e) ve iyelik eki (-imiz) yer alır.'
      },
      {
        id: 's-3-2',
        speakerId: 'sp6',
        speakerName: 'Burak Bey',
        turkishText: 'Beni davet ettiğiniz için ben teşekkür ederim. Ekibinizle tanışmaktan büyük mutluluk duyuyorum.',
        englishText: 'Thank you for inviting me. I am very happy to meet your team.',
        phoneticSpelling: 'be-ni da-vet et-ti-ği-niz i-çin ben te-şek-kür e-de-rim. e-ki-bi-niz-le ta-nış-mak-tan bü-yük mut-lu-luk du-yu-yo-rum.',
        grammarNote: '"tanışmaktan" kelimesinde ayrılma durumu eki (-tan) benzeşmeye (sertleşmeye) uğramıştır.'
      },
      {
        id: 's-3-3',
        speakerId: 'sp5',
        speakerName: 'Zeynep Hanım',
        turkishText: 'Bize son üç yılda yönettiğiniz projelerden ve çalışma prensiplerinizden kısaca bahseder misiniz?',
        englishText: 'Could you briefly tell us about the projects you managed in the last three years and your working principles?',
        phoneticSpelling: 'bi-ze son üç yıl-da yö-net-ti-ği-niz pro-je-ler-den ve ça-lış-ma pren-sip-le-ri-niz-den kı-sa-ca bah-se-der mi-si-niz?',
        grammarNote: '"yönettiğiniz" kelimesinde dık/dik sıfat-fiil eki ve iyelik eki bulunmaktadır.'
      },
      {
        id: 's-3-4',
        speakerId: 'sp6',
        speakerName: 'Burak Bey',
        turkishText: 'Özellikle modern web teknolojileri ve kullanıcı deneyimi odaklı, yüksek tempolu takım çalışmalarında bulundum.',
        englishText: 'I particularly worked in fast-paced team environments focused on modern web technologies and user experience.',
        phoneticSpelling: 'ö-zel-lik-le mo-dern web tek-no-lo-ji-le-ri ve kul-la-nı-cı de-ne-yi-mi o-dak-lı, yük-sek tem-po-lu ta-kım ça-lış-ma-la-rın-da bu-lun-dum.',
        grammarNote: '"kullanıcı" türemiş kelimesinde yapım eki (-ıcı) işi yapan özneyi oluşturur.'
      },
      {
        id: 's-3-5',
        speakerId: 'sp5',
        speakerName: 'Zeynep Hanım',
        turkishText: 'Açıklamalarınız oldukça tatmin edici. En kısa sürede süreçle ilgili sonucu sizinle paylaşacağız.',
        englishText: 'Your explanations are very satisfactory. We will share the outcome regarding the process with you shortly.',
        phoneticSpelling: 'a-çık-la-ma-la-rı-nız ol-duk-ça tat-min e-di-ci. en kı-sa sü-re-de sü-reç-le il-gi-li so-nu-cu si-zin-le pay-la-şa-ca-ğız.',
        grammarNote: '"paylaşacağız" gelecek zaman 1. çoğul ekinde (-acağız) "k" ünsüzü iki ünlü arasında kalarak "ğ" olmuştur.'
      }
    ]
  },
  {
    id: 'b2-kultur-istanbul',
    title: 'Şehir, Kültür ve Sanat Sohbeti',
    level: 'B2',
    levelTitle: 'B2 - İleri Seviye',
    description: 'Tarihi mimari, sanatsal etkinlikler, edebi atmosfer ve soyut düşünceleri ifade etme.',
    scenario: 'Pera Müzesi çıkışında sergi izlenimlerini ve İstanbul\'un tarihi dokusunu değerlendiren iki sanatsever.',
    culturalNote: 'Türkçede mecazi anlatımlar, sıfat tamlamaları ve duyguyu yansıtan ses tonlaması (vurgu) B2 seviyesinde akıcılığın en kilit anahtarıdır.',
    speakers: [
      { id: 'sp7', name: 'Kerem', role: 'Yazar', gender: 'male', color: '#15803D' },
      { id: 'sp8', name: 'Deniz', role: 'Sanat Tarihçisi', gender: 'female', color: '#7E22CE' }
    ],
    sentences: [
      {
        id: 's-4-1',
        speakerId: 'sp7',
        speakerName: 'Kerem',
        turkishText: 'Sergideki tabloların ışık ve gölge dengesi gerçekten büyüleyiciydi, değil mi?',
        englishText: 'The light and shadow balance of the paintings in the exhibition was truly fascinating, wasn\'t it?',
        phoneticSpelling: 'ser-gi-de-ki tab-lo-la-rın ı-şık ve göl-ge den-ge-si ger-çek-ten bü-yü-le-yi-ciy-di, de-ğil mi?',
        grammarNote: '"değil" sözcüğündeki ğ okunmaz, "e" sesi hafifçe uzatılarak "deyil" veya "de-il" gibi söylenir.'
      },
      {
        id: 's-4-2',
        speakerId: 'sp8',
        speakerName: 'Deniz',
        turkishText: 'Kesinlikle katılıyorum. Doğu ile Batı sentezini bu denli incelikle işleyen eserler nadir bulunur.',
        englishText: 'I completely agree. Artworks that blend the Eastern and Western synthesis with such delicacy are rarely found.',
        phoneticSpelling: 'ke-sin-lik-le ka-tı-lı-yo-rum. do-ğu i-le ba-tı sen-te-zi-ni bu den-li in-ce-lik-le iş-le-yen e-ser-ler na-dir bu-lu-nur.',
        grammarNote: '"doğu" kelimesindeki yumuşak g (ğ) bir önceki "o" ve "u" sesini yumuşak bir geçişle birbirine bağlar.'
      },
      {
        id: 's-4-3',
        speakerId: 'sp7',
        speakerName: 'Kerem',
        turkishText: 'Galata Kulesi\'ne doğru yürüyüp gün batımında kahve içerek sohbetimize devam edelim mi?',
        englishText: 'Shall we walk towards Galata Tower and continue our conversation over coffee at sunset?',
        phoneticSpelling: 'ga-la-ta ku-le-si-ne doğ-ru yü-rü-yüp gün ba-tı-mın-da kah-ve i-çe-rek soh-be-ti-mi-ze de-vam e-de-lim mi?',
        grammarNote: '"yürüyüp" ve "içerek" zarf-fiil ekleri (-ip, -erek) hareketlerin art arda yapıldığını bildirir.'
      }
    ]
  }
];

// Comprehensive morphological dictionary for words in dialogues
export const WORD_DICTIONARY: Record<string, WordAnalysis> = {
  merhaba: {
    word: 'Merhaba',
    cleanWord: 'merhaba',
    root: 'merhaba',
    rootType: 'Ünlem',
    suffixes: [],
    englishMeaning: 'Hello / Greetings',
    turkishMeaning: 'Karşılaşıldığında söylenen en yaygın esenleşme sözü.',
    syllables: 'mer-ha-ba',
    phoneticTip: 'Orta hecedeki "ha" nefesli söylenir, son hece hafifçe açık bırakılır.',
    stressTip: 'Vurgu genellikle son hecededir (mer-ha-BA).',
    phonemeAlerts: []
  },
  nasılsın: {
    word: 'nasılsın',
    cleanWord: 'nasılsın',
    root: 'nasıl',
    rootType: 'Soru Sıfatı/Zarfı',
    suffixes: ['-sın (2. Tekil Kişi Eki)'],
    englishMeaning: 'How are you? (Informal)',
    turkishMeaning: 'Karşımızdakinin sağlık ve ruhsal durumunu öğrenmek için sorulan soru.',
    syllables: 'na-sıl-sın',
    phoneticTip: '"I" sesleri boğazdan yayvan telaffuz edilmelidir, "i" ile karıştırmayın.',
    stressTip: 'Vurgu ilk hecede daha belirgindir (NA-sıl-sın).',
    phonemeAlerts: ['ı']
  },
  burada: {
    word: 'burada',
    cleanWord: 'burada',
    root: 'bura',
    rootType: 'Zamir',
    suffixes: ['-da (Bulunma Hali Eki)'],
    englishMeaning: 'Here / In this place',
    turkishMeaning: 'Konuşulan yerin içinde olduğunu bildiren yer yön zamiri.',
    syllables: 'bu-ra-da',
    phoneticTip: 'Hızlı konuşmada bazen "burda" şeklinde kısaltılsa da diksiyonda "bu-ra-da" net söylenir.',
    stressTip: 'Vurgu genellikle ilk veya ikinci hecede duruma göre değişir (bu-RA-da).',
    phonemeAlerts: []
  },
  görmek: {
    word: 'görmek',
    cleanWord: 'görmek',
    root: 'gör-',
    rootType: 'Fiil',
    suffixes: ['-mek (Mastar / İsim-Fiil Eki)'],
    englishMeaning: 'To see / Seeing',
    turkishMeaning: 'Göz yardımıyla bir nesnenin veya kişinin farkına varmak.',
    syllables: 'gör-mek',
    phoneticTip: '"Ö" sesi dudaklar öne yuvarlanarak çıkarılır. "O" ile karıştırmayın.',
    stressTip: 'Vurgu son hecededir (gör-MEK).',
    phonemeAlerts: ['ö', 'r']
  },
  güzel: {
    word: 'güzel',
    cleanWord: 'güzel',
    root: 'güzel',
    rootType: 'Sıfat',
    suffixes: [],
    englishMeaning: 'Beautiful / Nice / Good',
    turkishMeaning: 'Göze ve kulağa hoş gelen, hayranlık uyandıran.',
    syllables: 'gü-zel',
    phoneticTip: '"Ü" harfinde dudaklar büzülür, "L" harfinde dil ucu üst ön dişlerin arkasına değer.',
    stressTip: 'Vurgu son hecededir (gü-ZEL).',
    phonemeAlerts: ['ü']
  },
  iyiyim: {
    word: 'İyiyim',
    cleanWord: 'iyiyim',
    root: 'iyi',
    rootType: 'İsim',
    suffixes: ['-y- (Kaynaştırma Ünsüzü)', '-im (1. Tekil Şahıs Eki)'],
    englishMeaning: 'I am good / I am fine',
    turkishMeaning: 'Sağlık ve esenlik durumunun olumlu olduğunu bildiren ifade.',
    syllables: 'i-yi-yim',
    phoneticTip: 'İki "i" arasındaki "y" yumuşak bir akışla söylenir.',
    stressTip: 'Vurgu ilk hecede başlar, son heceye kayar (i-yi-YİM).',
    phonemeAlerts: []
  },
  teşekkür: {
    word: 'teşekkür',
    cleanWord: 'teşekkür',
    root: 'teşekkür',
    rootType: 'İsim',
    suffixes: [],
    englishMeaning: 'Thanks / Gratitude',
    turkishMeaning: 'Yapılan iyilik veya nezakete karşılık minnettarlık bildirme.',
    syllables: 'te-şek-kür',
    phoneticTip: '"Ş" harfinde ıslık sesi yapmayın. "kk" çift ünsüzünde hafif bir duraklama (tutulma) olur.',
    stressTip: 'Vurgu son hecededir (te-şek-KÜR).',
    phonemeAlerts: ['ş', 'ü', 'r']
  },
  ederim: {
    word: 'ederim',
    cleanWord: 'ederim',
    root: 'et-',
    rootType: 'Fiil',
    suffixes: ['-er (Geniş Zaman Eki)', '-im (1. Tekil Şahıs Eki)'],
    englishMeaning: 'I do / I express',
    turkishMeaning: 'Etmek yardımcı eyleminin geniş zaman birinci tekil şahıs çekimi.',
    syllables: 'e-de-rim',
    phoneticTip: '"t" harfi yumuşayarak "d"ye dönüşmüştür. Sonundaki "r" harfi sert yuvarlanmaz.',
    stressTip: 'Vurgu son hecededir (e-de-RİM).',
    phonemeAlerts: ['r']
  },
  kütüphaneye: {
    word: 'kütüphaneye',
    cleanWord: 'kütüphaneye',
    root: 'kütüphane',
    rootType: 'İsim',
    suffixes: ['-y- (Kaynaştırma)', '-e (Yönelme Hal Eki)'],
    englishMeaning: 'To the library',
    turkishMeaning: 'Kitapların korunduğu ve okunduğu binaya doğru gitme yönelimi.',
    syllables: 'kü-tüp-ha-ne-ye',
    phoneticTip: '"ü" ünlülerinde dudak yuvarlaklığı korunmalı, "h" sesi kaybolmamalıdır.',
    stressTip: 'Vurgu sondan önceki hecede yoğunlaşır (kü-tüp-ha-NE-ye).',
    phonemeAlerts: ['ü']
  },
  dinlenmek: {
    word: 'dinlenmek',
    cleanWord: 'dinlenmek',
    root: 'dinle-',
    rootType: 'Fiil',
    suffixes: ['-n- (Dönüşlülük Eki)', '-mek (İsim-Fiil Eki)'],
    englishMeaning: 'To rest / To relax',
    turkishMeaning: 'Yorgunluğu gidermek, güç kazanmak için ara vermek.',
    syllables: 'din-len-mek',
    phoneticTip: '"n" ve "l" seslerinin peş peşe geçişi dil ucunun damağa seri dokunuşuyla yapılır.',
    stressTip: 'Vurgu son hecededir (din-len-MEK).',
    phonemeAlerts: []
  },
  çağıralım: {
    word: 'çağıralım',
    cleanWord: 'çağıralım',
    root: 'çağır-',
    rootType: 'Fiil',
    suffixes: ['-alım (1. Çoğul İstek Kipi Eki)'],
    englishMeaning: 'Let us call',
    turkishMeaning: 'Birini yanına gelmesi için seslenme veya davet etme arzusu.',
    syllables: 'ça-ğı-ra-lım',
    phoneticTip: 'DİKKAT: "ğ" (yumuşak g) okunmaz! "a" ve "ı" arasında yumuşak bir bağ kurularak adeta "ça-ı-ra-lım" veya uzatılmış bir a gibi söylenir.',
    stressTip: 'Vurgu istek kipi ekindedir (ça-ğı-ra-LIM).',
    phonemeAlerts: ['ğ', 'ç', 'ı']
  },
  söyleyelim: {
    word: 'söyleyelim',
    cleanWord: 'söyleyelim',
    root: 'söyle-',
    rootType: 'Fiil',
    suffixes: ['-y- (Kaynaştırma)', '-elim (1. Çoğul İstek Kipi Eki)'],
    englishMeaning: 'Let us tell / Let us order',
    turkishMeaning: 'Sipariş vermek veya bir düşünceyi dile getirmek üzere istekte bulunmak.',
    syllables: 'söy-le-ye-lim',
    phoneticTip: '"Ö" harfi açık ve yuvarlak, "y" harfleri akıcı söylenir.',
    stressTip: 'Vurgu istek ekindedir (söy-le-ye-LİM).',
    phonemeAlerts: ['ö']
  },
  hoş: {
    word: 'Hoş',
    cleanWord: 'hoş',
    root: 'hoş',
    rootType: 'Sıfat',
    suffixes: [],
    englishMeaning: 'Pleasant / Nice',
    turkishMeaning: 'Duyguları okşayan, zevk veren, sevimli gelen.',
    syllables: 'hoş',
    phoneticTip: '"Ş" harfi ağız içi hava patlamasıyla tok ve temiz çıkarılır.',
    stressTip: 'Tek heceli kelimede tam vurgu vardır.',
    phonemeAlerts: ['ş']
  },
  geldiniz: {
    word: 'geldiniz',
    cleanWord: 'geldiniz',
    root: 'gel-',
    rootType: 'Fiil',
    suffixes: ['-di (Görülen Geçmiş Zaman)', '-niz (2. Çoğul / Nezaket Şahıs Eki)'],
    englishMeaning: 'You came / Welcome (plural or polite)',
    turkishMeaning: 'Bir mekana ulaşmış olan kişiye söylenen kabul sözü.',
    syllables: 'gel-di-niz',
    phoneticTip: '"L" harfi ince söylenir (dil ucu üst diş arkasına dayanır).',
    stressTip: 'Vurgu şahıs ekinde değil, zaman ekindedir (gel-Dİ-niz).',
    phonemeAlerts: []
  },
  yemeğinizin: {
    word: 'Yemeğinizin',
    cleanWord: 'yemeğinizin',
    root: 'yemek',
    rootType: 'İsim',
    suffixes: ['-i- (İyelik)', '-n- (Kaynaştırma)', '-in (Tamlayan / İlgi Eki)'],
    englishMeaning: 'Of your meal',
    turkishMeaning: 'Tüketilecek gıdaya ait olanı bildiren tamlayan eki almış kelime.',
    syllables: 'ye-me-ği-ni-zin',
    phoneticTip: '"ğ" sesi çıkarılmaz! "e" sesi hafifçe uzatılarak yumuşak bir nefesle geçilir ("yeme-i-nizin").',
    stressTip: 'Vurgu orta hecelere yayılır (ye-me-Ğİ-ni-zin).',
    phonemeAlerts: ['ğ']
  },
  paylaşacağız: {
    word: 'paylaşacağız',
    cleanWord: 'paylaşacağız',
    root: 'paylaş-',
    rootType: 'Fiil',
    suffixes: ['-acak (Gelecek Zaman Eki)', '-ız (1. Çoğul Şahıs Eki)'],
    englishMeaning: 'We will share',
    turkishMeaning: 'Bir haberi veya kaynağı ortaklaşa iletme sözü.',
    syllables: 'pay-la-şa-ca-ğız',
    phoneticTip: 'DİKSİYON SIRRI: İstanbul Türkçesinde gelecek zaman "-acağız" eki günlük konuşmada "pay-la-şa-caaz" veya "pay-la-şı-caz" şeklinde yumuşar, fakat diksiyonda "pay-la-şa-ca-ğız" şeklinde net vurgu yapılır.',
    stressTip: 'Vurgu gelecek zaman ekindedir (pay-la-şa-CA-ğız).',
    phonemeAlerts: ['ğ', 'ş', 'ı']
  },
  doğu: {
    word: 'Doğu',
    cleanWord: 'doğu',
    root: 'doğ-',
    rootType: 'İsim',
    suffixes: ['-u (Fiilden İsim Yapım Eki)'],
    englishMeaning: 'East / Orient',
    turkishMeaning: 'Güneşin doğduğu ana yön ve onun kültürel coğrafyası.',
    syllables: 'do-ğu',
    phoneticTip: '"ğ" harfi okunmaz. "o" sesi uzatılarak "doo" veya "do-u" gibi yumuşak bir akışla söylenir.',
    stressTip: 'Vurgu son hecededir (do-ĞU).',
    phonemeAlerts: ['ğ']
  },
  değil: {
    word: 'değil',
    cleanWord: 'değil',
    root: 'değil',
    rootType: 'Edat',
    suffixes: [],
    englishMeaning: 'Not / Isn\'t it',
    turkishMeaning: 'Cümlelerde olumsuzluk kuran veya soru pekiştiren edat.',
    syllables: 'de-ğil',
    phoneticTip: 'Klasik diksiyon kuralı: "Değil" yazılır fakat "de-yil" veya "deil" seslendirilir. Yumuşak g asla gırtlaktan çıkarılmaz.',
    stressTip: 'Vurgu son hecededir (de-ĞİL).',
    phonemeAlerts: ['ğ']
  }
};

// Tongue Twisters (Tekerlemeler) for speech & diction practice
export const TONGUE_TWISTERS: TongueTwister[] = [
  {
    id: 'tw-1',
    title: 'Ş ve Ç Harfleri Antrenmanı',
    targetSound: 'Ş & Ç',
    soundLabel: 'Damak ve Diş-Dudak Akıcılığı',
    level: 'A2 - B1',
    difficulty: 'Kolay',
    text: 'Şu köşe yaz köşesi, şu köşe kış köşesi, ortadaki su şişesi.',
    dictionFocus: 'Ş ve S harflerinin birbirine karışmasını engeller, dudak kaslarını çevikleştirir.'
  },
  {
    id: 'tw-2',
    title: 'R ve B Harfleri Hız Alıştırması',
    targetSound: 'R & B',
    soundLabel: 'Dil Ucu Titreşimi ve Dudak Patlaması',
    level: 'B1 - B2',
    difficulty: 'Orta',
    text: 'Bir berber bir berbere bire berber beri gel beraber bir berber dükkânı açalım demiş.',
    dictionFocus: 'Türkçede kelime başı ve ortasındaki R sesinin net ve yuvarlanmadan çıkmasını sağlar.'
  },
  {
    id: 'tw-3',
    title: 'Ç ve T Harfleri Çeviklik Egzersizi',
    targetSound: 'Ç & T',
    soundLabel: 'Sert Ünsüz Patlamaları',
    level: 'B1',
    difficulty: 'Orta',
    text: 'Çatalca\'da topal çoban çatal yapıp çatal satar, nesi için çatal satar, kârı için çatal satar.',
    dictionFocus: 'Çatal, çoban ve çatal kelimelerindeki ç sesinin berrak çıkmasını sağlar.'
  },
  {
    id: 'tw-4',
    title: 'Yumuşak G (Ğ) ve Uzun Ünlüler',
    targetSound: 'Ğ & A/U',
    soundLabel: 'Akıcı Ünlü Uzatması ve Yumuşak Bağlantı',
    level: 'B2',
    difficulty: 'Zor',
    text: 'Ağır ağır çıkan dağcılar, sağanak yağmurda sığınacak bağ evi aradılar.',
    dictionFocus: 'Ğ harfinin kesinlikle gırtlaktan sert söylenmemesi, kendinden önceki ünlünün bir ses uzatılması kuralını pekiştirir.'
  },
  {
    id: 'tw-5',
    title: 'I ve İ Karşıtlığı Egzersizi',
    targetSound: 'I & İ',
    soundLabel: 'Düz-Geniş ve Düz-Dar Ünlü Dengesi',
    level: 'A1 - A2',
    difficulty: 'Kolay',
    text: 'Ilık ılık ırmaklar kıvrıla kıvrıla akarken, ıslak kargalar fısıldaştı.',
    dictionFocus: 'Yabancı öğrencilerin en çok zorlandığı noktasız "ı" harfinin doğru ağız açıklığıyla söylenmesi.'
  }
];

// Interactive Diction Guidance Cards
export const DICTION_RULES = [
  {
    id: 'yumusak-g',
    letter: 'Ğ',
    title: 'Yumuşak G (Ğ) Kuralı',
    summary: 'Türkçede "ğ" harfi kendi başına bağımsız bir ses çıkarmaz.',
    rule: 'Yumuşak g, kendisinden önce gelen ünlü harfi yaklaşık bir ses birimi kadar uzatır veya iki ünlü arasında kaygan bir geçiş köprüsü kurar.',
    examples: [
      { written: 'Dağ', pronounced: 'Daa', note: '"a" ünlüsü bir ses uzatılır' },
      { written: 'Öğrenci', pronounced: 'Öörenci', note: '"ö" ünlüsü uzatılır' },
      { written: 'Değil', pronounced: 'Deyil / Deil', note: 'Asla "degil" denmez' },
      { written: 'Ağaç', pronounced: 'Aaç', note: 'İki "a" arasında yumuşak geçiş' }
    ],
    exerciseText: 'Sağanak yağmurda dağdaki kulübeye sığındık.'
  },
  {
    id: 'harf-i-ve-i',
    letter: 'I / İ',
    title: 'Noktalı İ ve Noktasız I Farkı',
    summary: 'Türkçe fonetiğin en ayırt edici iki sesi.',
    rule: '"I" söylenirken dil geriye çekilir, dudaklar yayvan tutulur ve boğazdan tok çıkar. "İ" söylenirken dil öne gelir ve dişlere yaklaşır.',
    examples: [
      { written: 'Ilık / İlik', pronounced: 'I-lık (Warm) / İ-lik (Marrow)', note: 'Anlam tamamen değişir' },
      { written: 'Sık / Sik', pronounced: 'Sık (Frequent)', note: 'Telaffuz hatası anlam karmaşasına yol açar' },
      { written: 'Kış / Kişi', pronounced: 'Kış (Winter) / Ki-şi (Person)', note: 'I sesi derin ve yayvandır' }
    ],
    exerciseText: 'Ilık kış günlerinde kırda ışıltılı yıldızlar parıldar.'
  },
  {
    id: 'yuvarlak-unluler',
    letter: 'Ö / Ü',
    title: 'Ön Yuvarlak Ünlüler (Ö - Ü)',
    summary: 'Dudak kaslarının öne doğru büzülerek şekil alması gerekir.',
    rule: 'Dudaklar gevşek bırakılırsa "Ö" harfi "O"ya, "Ü" harfi ise "U"ya kayar. Dudaklarınızı bir pipet tutar gibi büzün.',
    examples: [
      { written: 'Göz / Koz', pronounced: 'Göz (Eye) / Koz (Trump card)', note: 'Ö sesi önde ve yuvarlak' },
      { written: 'Gül / Kul', pronounced: 'Gül (Rose/Smile) / Kul (Servant)', note: 'Ü sesi ince ve yuvarlak' }
    ],
    exerciseText: 'Gülümseyen öğrenci, gözlerini gökyüzüne çevirdi.'
  },
  {
    id: 'harf-r',
    letter: 'R',
    title: 'Son Sesteki "R" Harfi',
    summary: 'Kelime sonundaki "R" harfi sert yuvarlanmaz.',
    rule: 'Türkçede kelime sonundaki "r" sesi söylenirken dil ucu damağa sertçe defalarca vurmaz; hafif bir fısıltı ve gevşek nefesle tamamlanır.',
    examples: [
      { written: 'Gelir', pronounced: 'Geli(r)', note: 'Son r sesi yumuşak biter' },
      { written: 'Teşekkürler', pronounced: 'Teşekkürle(r)', note: 'Abartılı rrrrr yapılmaz' }
    ],
    exerciseText: 'Bir berber bir berbere teşekkür eder.'
  },
  {
    id: 'ulama',
    letter: 'Ulama',
    title: 'Ulama (Liaison / Akıcılık Bağı)',
    summary: 'Sözcüklerin birbirine pürüzsüz bağlanarak melodik akması.',
    rule: 'Ünsüzle (sessiz) biten bir sözcükten sonra ünlüyle (sesli) başlayan bir sözcük gelirse, ilk sözcüğün son harfi diğerine bağlanarak okunur (Araya noktalama işareti girmemelidir).',
    examples: [
      { written: 'Sonbahar akşamı', pronounced: 'Son-ba-ha-rak-şa-mı', note: 'Melodik tek bir kelime gibi akar' },
      { written: 'Dün akşam', pronounced: 'Dü-nak-şam', note: 'Konuşma doğallığı katar' },
      { written: 'Bir adam', pronounced: 'Bi-ra-dam', note: 'R ile A birleşir' }
    ],
    exerciseText: 'Dün akşam İstanbul sokaklarında uzun bir yürüyüş yaptık.'
  }
];
