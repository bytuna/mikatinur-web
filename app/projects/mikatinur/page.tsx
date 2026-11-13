import { BookOpen, CheckCircle, Smartphone, Database } from 'lucide-react';

export default function MikatinurPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white mb-8 block transition-colors">← Geri Dön</a>
        
        <h1 className="text-5xl font-bold mb-6 tracking-tighter flex items-center gap-4 text-slate-900 dark:text-white">
          <BookOpen className="text-blue-600 dark:text-blue-500" size={40} />
          Mîkāt-ı Nur
        </h1>
        <p className="text-lg text-slate-600 dark:text-gray-400 mb-12 leading-relaxed">
          Zamanı anlamlı kılmak, sadece vaktin farkında olmakla değil, o vakti hakikatle doldurmakla mümkündür. Mîkāt-ı Nur, günlük hayatınızın karmaşasında ezan vakitlerini en hassas şekilde takip etmenizi sağlarken, aynı zamanda zihninizi ve ruhunuzu besleyecek bir manevi kütüphaneyi de parmaklarınızın ucuna getiriyor.
          Uygulamamızın içerisine entegre edilen Risale-i Nur külliyatı ile ister namaz beklerken, ister günün dingin saatlerinde iman hakikatlerini okuyabilir; vaktin bereketini tefekkürle birleştirebilirsiniz. Mîkāt-ı Nur, ezan ile vakti hatırlatır, Risale-i Nur ile o vakti maneviyatla parlatır.
          Mîkāt-ı Nur ile vaktinizi en doğru şekilde değerlendirin, hakikat yolculuğunuza kesintisiz devam edin.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="border border-slate-200 dark:border-gray-800 p-6 rounded-2xl bg-white dark:bg-[#111] shadow-sm dark:shadow-none flex items-center gap-4">
            <Smartphone className="text-slate-500 dark:text-gray-500" />
            <div>
              <h4 className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest">Platform</h4>
              <p className="font-bold text-lg text-slate-900 dark:text-white">Android (Kotlin)</p>
            </div>
          </div>
          <div className="border border-slate-200 dark:border-gray-800 p-6 rounded-2xl bg-white dark:bg-[#111] shadow-sm dark:shadow-none flex items-center gap-4">
            <CheckCircle className="text-green-600 dark:text-green-500" />
            <div>
              <h4 className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-widest">Durum</h4>
              <p className="font-bold text-lg text-green-600 dark:text-green-400">Yayında</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-none p-8 rounded-3xl">
          <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-slate-900 dark:text-white">
            <Database className="text-blue-600 dark:text-blue-500" /> Teknik Detaylar
          </h3>
          <ul className="text-slate-600 dark:text-gray-400 space-y-4">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full shrink-0"></span>
              Hassas Vakit Takibi: Konumunuza özel, doğru ezan vakitleri ve geri sayım.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full shrink-0"></span>
              Risale-i Nur Külliyatı: Zengin bir okuma tecrübesiyle, iman hakikatlerine her an her yerden ulaşım.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full shrink-0"></span>
              Tefekkür Modu: Okuma arayüzünde dikkatinizi dağıtmayan, gözü yormayan özel tasarım.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full shrink-0"></span>
              Düzenli Hatim ve Okuma: İbadet takviminizi manevi okumalarınızla bütünleştirin.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
