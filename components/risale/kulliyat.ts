import { RisaleBook, DictionaryTerm } from './types';

export const DICTIONARY: { [key: string]: DictionaryTerm } = {
  bismillah: { word: 'Bismillah', definition: 'Allah\'ın adıyla. Her hayrın başıdır. Biz dahi başta ona başlarız.', origin: 'Arapça' },
  acz: { word: 'Acz', definition: 'Güçsüzlük, acizlik, beceriksizlik; kulun yaratıcısı karşısındaki acziyeti.', origin: 'Arapça' },
  fakr: { word: 'Fakr', definition: 'Muhtaçlık, yoksulluk; insanın her an Allah\'ın rahmetine ve yaratmasına muhtaç olması.', origin: 'Arapça' },
  badiye: { word: 'Badiye', definition: 'Kır, çöl, sahra; medeniyetten uzak geniş düzlük.', origin: 'Arapça' },
  hadsiz: { word: 'Hadsiz', definition: 'Sınırsız, hesapsız, hudutsuz; pek çok.', origin: 'Türkçe' },
  kâinat: { word: 'Kâinat', definition: 'Evren, yaratılan bütün varlıklar âlemi.', origin: 'Arapça' },
  ibadet: { word: 'İbadet', definition: 'Allah\'ın rızasını kazanmak amacıyla yapılan kulluk görevleri ve saygı davranışları.', origin: 'Arapça' },
  mütefikkir: { word: 'Mütefikkir', definition: 'Tefekkür eden, derin düşünen kimse.', origin: 'Arapça' },
  "mu'cize": { word: 'Mu\'cize', definition: 'Akılları hayrette bırakan, beşer kuvvetinin yapmasından âciz kaldığı, Allah\'ın peygamberlerine tasdik ettirmek için yarattığı harika hadise.', origin: 'Arapça' },
  nimet: { word: 'Nimet', definition: 'İhsan, lütuf, rızık; yaşamak için gerekli ve faydalı olan her güzel şey.', origin: 'Arapça' },
  rezzak: { word: 'Rezzak', definition: 'Bütün canlıların rızkını veren, maddî ve manevî her türlü ihtiyacı karşılayan Allah.', origin: 'Arapça' },
  şükür: { word: 'Şükür', definition: 'Kendisine yapılan bir iyiliğe karşı dil, kalp ve bedenle teşekkürünü gösterme hali.', origin: 'Arapça' },
  zikir: { word: 'Zikir', definition: 'Allah\'ı anmak, hatırlamak, O\'nun isim ve sıfatlarını dilden ve kalpten eksik etmemek.', origin: 'Arapça' },
  fikir: { word: 'Fikir', definition: 'Düşünme, zihinsel faaliyet; kâinattaki harika sanatları tefekkür etme.', origin: 'Arapça' },
  haşiye: { word: 'Haşiye', definition: 'Dipnot, açıklama; ana metnin kenarına veya altına yazılan şerh ve izahat.', origin: 'Arapça' },
  fihrist: { word: 'Fihrist', definition: 'İçindekiler listesi, katalog; kitabın bölümlerini gösteren cetvel.', origin: 'Arapça' },
  külliyat: { word: 'Külliyat', definition: 'Bir yazarın bütün eserlerini bir araya getiren kitaplar serisi.', origin: 'Arapça' },
  muvazzaf: { word: 'Muvazzaf', definition: 'Vazifeli, görevli; bir işle memur edilmiş olan.', origin: 'Arapça' },
  şefkat: { word: 'Şefkat', definition: 'Karşılıksız sevgi ve acıma duygusu, merhamet.', origin: 'Arapça' },
  "ahsen-i takvim": { word: 'Ahsen-i Takvim', definition: 'En güzel kıvam, en mükemmel suret; insanın en yüksek kabiliyetlerle donatılmış yaratılışı.', origin: 'Arapça' },
  "esma-i hüsna": { word: 'Esma-i Hüsna', definition: 'Allah\'ın en güzel isimleri.', origin: 'Arapça' },
  marifetullah: { word: 'Marifetullah', definition: 'Allah\'ı bilmek ve tanımak; O\'nun sıfat ve esmasını idrak etmek.', origin: 'Arapça' },
  muhabbetullah: { word: 'Muhabbetullah', definition: 'Allah sevgisi, kalbin Allah\'a bağlanması.', origin: 'Arapça' },
  "nûr-u-iman": { word: 'Nûr-u İman', definition: 'İman nuru, inanmanın kalbe ve akla verdiği aydınlık, selamet.', origin: 'Arapça' },
  ubudiyet: { word: 'Ubudiyet', definition: 'Kulluk yapmak, Allah\'ın emirlerine boyun eğip ibadet etmek.', origin: 'Arapça' },
  tasdik: { word: 'Tasdik', definition: 'Doğrulamak, onaylamak, kalben inanıp kabul etmek.', origin: 'Arapça' },
  "asâyı-mûsa": { word: 'Asâ-yı Mûsa', definition: 'Hz. Musa\'nın taştan su çıkaran veya mucizeler gösteren meşhur asası; karanlıkları dağıtan nurani hüccet.', origin: 'Arapça' }
};

export const KULLIYAT: RisaleBook[] = [
  {
    id: 'sozler',
    title: 'Sözler',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 789,
    coverImage: '/covers/sozler.png',
    sections: [
      { id: 'birinci-soz', title: 'Birinci Söz', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'mektubat',
    title: 'Mektubat',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 521,
    coverImage: '/covers/mektubat.png',
    sections: [
      { id: 'birinci-mektup', title: 'Birinci Mektup', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'lemalar',
    title: 'Lemalar',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 447,
    coverImage: '/covers/lemalar.png',
    sections: [
      { id: 'birinci-lema', title: 'Birinci Lema', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'sualar',
    title: 'Şualar',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 761,
    coverImage: '/covers/sualar.png',
    sections: [
      { id: 'ayet-ul-kobra', title: 'Âyet-ül Kübra', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'mesnevi',
    title: 'Mesnevi-i Nuriye',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 266,
    coverImage: '/covers/mesnevi.png',
    sections: [
      { id: 'habbe', title: 'Habbe Bölümü', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'isarat-ul-icaz',
    title: 'İşarat-ül İ\'caz',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 228,
    coverImage: '/covers/isarat.png',
    sections: [
      { id: 'fatiha-tefsiri', title: 'Fatiha Suresi Tefsiri', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'barla-lahikasi',
    title: 'Barla Lâhikası',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 381,
    coverImage: '/covers/barla.png',
    sections: [
      { id: 'mukaddime-barla', title: 'Barla Hayatı ve Mukaddime', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'kastamonu-lahikasi',
    title: 'Kastamonu Lâhikası',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 265,
    coverImage: '/covers/kastamonu.png',
    sections: [
      { id: 'mukaddime-kastamonu', title: 'Kastamonu Hayatı ve Hizmet Düsturları', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'emirdag-lahikasi-1',
    title: 'Emirdağ Lâhikası 1',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 285,
    coverImage: '/covers/emirdag1.png',
    sections: [
      { id: 'emirdag-1-giris', title: 'Emirdağ Birinci Dönem Giriş', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'emirdag-lahikasi-2',
    title: 'Emirdağ Lâhikası 2',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 244,
    coverImage: '/covers/emirdag2.png',
    sections: [
      { id: 'emirdag-2-giris', title: 'Emirdağ İkinci Dönem Giriş', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'sikke-i-tasdik-i-gaybi',
    title: 'Sikke-i Tasdik-i Gaybî',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 268,
    coverImage: '/covers/sikke.png',
    sections: [
      { id: 'sikke-mukaddime', title: 'Sikke-i Tasdik-i Gaybî Mukaddime', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'tarihce-i-hayat',
    title: 'Tarihçe-i Hayat',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 738,
    coverImage: '/covers/tarihce.png',
    sections: [
      { id: 'ilk-hayat', title: 'İlk Hayatı ve Tahsili', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'asa-yi-musa',
    title: 'Asâ-yı Mûsa',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 3,
    totalPages: 268,
    coverImage: '/covers/asa.png',
    sections: [
      { id: 'asa-giris', title: 'Asâ-yı Mûsa Mukaddimesi', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'iman-ve-kufur-muvazeneleri',
    title: 'İman ve Küfür Müvazeneleri',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 265,
    coverImage: '/covers/iman_kufur.png',
    sections: [
      { id: 'iman-kufur-mukayese', title: 'İman ile Küfrün Mukayesesi', startPage: 5 }
    ],
    pages: {}
  },
  {
    id: 'muhakemat',
    title: 'Muhâkemat',
    author: 'Bediüzzaman Said Nursi',
    startingPage: 4,
    totalPages: 169,
    coverImage: '/covers/muhakemat.png',
    sections: [
      { id: 'unsur-ul-belagat', title: 'Unsur-ul Belâgat ve İfade', startPage: 5 }
    ],
    pages: {}
  }
];
