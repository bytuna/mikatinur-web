import { BookOpen, CheckCircle, Smartphone, Database, Search } from 'lucide-react';

export default function MikatinurPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-gray-500 hover:text-white mb-8 block transition-colors">← Geri Dön</a>
        
        <h1 className="text-5xl font-bold mb-6 tracking-tighter flex items-center gap-4">
          <BookOpen className="text-blue-500" size={40} />
          Mîkāt-ı Nur
        </h1>
        <p className="text-lg text-gray-400 mb-12 leading-relaxed">
          Zamanı anlamlı kılmak, sadece vaktin farkında olmakla değil, o vakti hakikatle doldurmakla mümkündür. Mîkāt-ı Nur, günlük hayatınızın karmaşasında ezan vakitlerini en hassas şekilde takip etmenizi sağlarken, aynı zamanda zihninizi ve ruhunuzu besleyecek bir manevi kütüphaneyi de parmaklarınızın ucuna getiriyor.
          Uygulamamızın içerisine entegre edilen Risale-i Nur külliyatı ile ister namaz beklerken, ister günün dingin saatlerinde iman hakikatlerini okuyabilir; vaktin bereketini tefekkürle birleştirebilirsiniz. Mîkāt-ı Nur, ezan ile vakti hatırlatır, Risale-i Nur ile o vakti maneviyatla parlatır.
          Mîkāt-ı Nur ile vaktinizi en doğru şekilde değerlendirin, hakikat yolculuğunuza kesintisiz devam edin.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="border border-gray-800 p-6 rounded-2xl bg-[#111] flex items-center gap-4">
            <Smartphone className="text-gray-500" />
            <div>
              <h4 className="text-gray-400 text-xs uppercase tracking-widest">Platform</h4>
              <p className="font-bold text-lg">Android (Kotlin)</p>
            </div>
          </div>
          <div className="border border-gray-800 p-6 rounded-2xl bg-[#111] flex items-center gap-4">
            <CheckCircle className="text-green-500" />
            <div>
              <h4 className="text-gray-400 text-xs uppercase tracking-widest">Durum</h4>
              <p className="font-bold text-lg text-green-400">Yayında</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 p-8 rounded-3xl">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
            <Database className="text-blue-500" /> Teknik Detaylar
          </h3>
          <ul className="text-gray-400 space-y-4">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Hassas Vakit Takibi: Konumunuza özel, doğru ezan vakitleri ve geri sayım.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Risale-i Nur Külliyatı: Zengin bir okuma tecrübesiyle, iman hakikatlerine her an her yerden ulaşım.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Tefekkür Modu: Okuma arayüzünde dikkatinizi dağıtmayan, gözü yormayan özel tasarım.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Düzenli Hatim ve Okuma: İbadet takviminizi manevi okumalarınızla bütünleştirin.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}