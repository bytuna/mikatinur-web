import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni ve Yasal Künye",
  description: "6698 sayılı KVKK uyarınca Mîkāt-ı Nur aydınlatma metni, Hizmet Vakfı / Envâr Neşriyat asıl nüsha künyesi ve ticari olmayan hizmet beyanı.",
  alternates: {
    canonical: "/kvkk-aydinlatma-metni",
  },
};

export default function KvkkAydinlatmaMetniPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] px-5 py-12 text-slate-700 dark:text-gray-300 sm:px-8 sm:py-20 transition-colors duration-300">
      <article className="mx-auto max-w-3xl leading-7">
        <Link href="/" className="mb-10 inline-block text-sm text-slate-500 dark:text-gray-500 transition-colors hover:text-slate-900 dark:hover:text-white">
          ← Ana Sayfaya Dön
        </Link>

        <header className="mb-12 border-b border-slate-200 dark:border-gray-800 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            6698 Sayılı KVKK Uyarınca Aydınlatma Metni ve Yasal Künye
          </h1>
          <div className="mt-6 space-y-2 text-sm text-slate-600 dark:text-gray-400">
            <p><strong className="text-slate-900 dark:text-gray-200">Veri Sorumlusu ve Platform Yöneticisi:</strong> İlker Tuna (Mîkāt-ı Nur)</p>
            <p><strong className="text-slate-900 dark:text-gray-200">Web Sitesi:</strong>{" "}
              <a href="https://www.mikatinur.com.tr" className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200">
                www.mikatinur.com.tr
              </a>
            </p>
            <p><strong className="text-slate-900 dark:text-gray-200">İletişim / KEP veya E-Posta:</strong>{" "}
              <a href="mailto:ilker.tuna@mikatinur.com.tr" className="text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-200">
                ilker.tuna@mikatinur.com.tr
              </a>
            </p>
            <p><strong className="text-slate-900 dark:text-gray-200">Son Güncelleme:</strong> 15 Kasım 2026</p>
          </div>
        </header>

        <div className="space-y-10 text-[15px] sm:text-base">
          <p>
            İşbu Aydınlatma Metni ve Yasal Künye; 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (&quot;KVKK&quot;) 10. maddesi ile <em>Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ</em> kapsamında kişisel verilerin işlenmesine ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu (&quot;FSEK&quot;) uyarınca platformda sunulan eserlerin asıl nüsha künyesi ile ticari olmayan hizmet esaslarına ilişkin olarak veri sorumlusu sıfatıyla <strong className="text-slate-900 dark:text-gray-100">İlker Tuna</strong> tarafından hazırlanmıştır.
          </p>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">1. İşlenen Kişisel Veri Kategorileri ve Türleri</h2>
            <ul className="list-disc space-y-3 pl-5">
              <li><strong className="text-slate-900 dark:text-gray-100">Lokasyon / Konum Bilgisi:</strong> Cihazın yaklaşık veya hassas coğrafi konum koordinatları (GPS ve ağ tabanlı veriler).</li>
              <li><strong className="text-slate-900 dark:text-gray-100">Kimlik ve İletişim Bilgileri (İsteğe Bağlı):</strong> İletişim formu doldurulması veya kullanıcı hesabı oluşturulması halinde ad, soyad ve e-posta adresi.</li>
              <li><strong className="text-slate-900 dark:text-gray-100">İşlem ve Kullanım Güvenliği Bilgileri:</strong> IP adresi, cihaz işletim sistemi sürümü, cihaz modeli, çökme logları ve uygulama hata kayıtları.</li>
              <li><strong className="text-slate-900 dark:text-gray-100">Kullanıcı İşlem Verileri:</strong> Okuma geçmişi, sayfa ayraçları, favoriler ve tefekkür notları (bu veriler öncelikli olarak kullanıcının cihazında yerel depolama alanında saklanmaktadır).</li>
              <li><strong className="text-slate-900 dark:text-gray-100">Tashih ve Hata Bildirimi Verileri (İsteğe Bağlı):</strong> Risale-i Nur okuyucu modülünde metin sıhhatini korumak amacıyla kullanıcının kendi isteğiyle gönderdiği okuma alanı ekran görüntüsü işaretlemeleri ve açıklama notları.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">2. Kişisel Verilerin İşlenme Amaçları</h2>
            <p className="mb-3">Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ol className="list-decimal space-y-3 pl-5">
              <li>Bulunduğunuz konuma göre namaz ve ezan vakitlerinin hassas şekilde hesaplanması ve vakit bildirimlerinin sunulması,</li>
              <li>Uygulama içi oturum açma, profil yönetimi ve kullanıcı tercihlerinin senkronizasyonu (isteğe bağlı hesap açılması durumunda),</li>
              <li>Risale-i Nur Külliyatı metinlerinde olası dizgi/aktarım hatalarının kullanıcı geri bildirimleriyle tespit edilerek asıl nüsha sıhhatinin korunması,</li>
              <li>Uygulamanın teknik kararlılığının ve performansının izlenmesi, çökme ve hata analizlerinin yapılması,</li>
              <li>5651 sayılı Kanun kapsamındaki yasal log tutma yükümlülüklerinin yerine getirilmesi,</li>
              <li>Bilgi güvenliği süreçlerinin yürütülmesi ve yetkisiz erişimlerin önlenmesi.</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">3. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
            <p>
              Kişisel verileriniz, Mîkāt-ı Nur mobil uygulamasının yüklenmesi, cihaz izinlerinin (konum, bildirim vb.) verilmesi, uygulama içi formların doldurulması ve uygulamanın arka plan/ön plan servislerinin çalışması sırasında <strong className="text-slate-900 dark:text-gray-100">tamamen veya kısmen otomatik yöntemlerle</strong> elektronik ortamda toplanmaktadır.
            </p>
            <p className="mt-4">Söz konusu kişisel veriler, KVKK’nın 5. maddesinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
            <ul className="mt-3 list-disc space-y-3 pl-5">
              <li><strong className="text-slate-900 dark:text-gray-100">Açık Rıza (Madde 5/1):</strong> Cihaz izinleri üzerinden konum verilerinin işlenmesi ve isteğe bağlı hesap açılması süreçlerinde,</li>
              <li><strong className="text-slate-900 dark:text-gray-100">Bir Sözleşmenin Kurulması veya İfası (Madde 5/2-c):</strong> Kullanıcının talep ettiği dijital kütüphane ve vakit hesaplama hizmetlerinin doğrudan sunulabilmesi için,</li>
              <li><strong className="text-slate-900 dark:text-gray-100">Veri Sorumlusunun Hukuki Yükümlülüğü (Madde 5/2-ç):</strong> 5651 sayılı Kanun ve ilgili mevzuat uyarınca sistem erişim ve işlem loglarının tutulması,</li>
              <li><strong className="text-slate-900 dark:text-gray-100">Meşru Menfaat (Madde 5/2-f):</strong> Temel hak ve özgürlüklerinize zarar vermemek kaydıyla, uygulamanın performansının artırılması, hataların tespiti ve güvenliğin temini için.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">4. Kişisel Verilerin Aktarılması</h2>
            <p>Toplanan kişisel verileriniz, üçüncü taraf reklam ağları veya veri simsarlarıyla <strong className="text-slate-900 dark:text-gray-100">asla paylaşılmaz veya satılmaz</strong>. Verileriniz yalnızca:</p>
            <ul className="mt-3 list-disc space-y-3 pl-5">
              <li>Sunucu barındırma, altyapı ve analitik hizmetlerinin yürütülmesi amacıyla gerekli teknik entegrasyonlar kapsamında altyapı sağlayıcılarına (Google Play Hizmetleri, Google Analytics for Firebase ve Crashlytics),</li>
              <li>Yasal bir zorunluluk veya adli/idari talep halinde kanunen yetkili kamu kurum ve kuruluşları ile adli mercilere,</li>
            </ul>
            <p className="mt-3">KVKK’nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak aktarılabilir.</p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">5. Kişisel Verilerin Saklanma Süresi ve İmhası</h2>
            <p>Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca veya ilgili mevzuatta öngörülen yasal saklama süreleri (örn. 5651 sayılı Kanun gereği log kayıtları için öngörülen süreler) boyunca muhafaza edilir. Sürenin sona ermesi veya veri sahibinin geçerli talebi halinde veriler silinir, yok edilir veya anonim hale getirilir.</p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">6. İlgili Kişinin Hakları (KVKK Madde 11)</h2>
            <p>Kişisel veri sahibi olarak KVKK’nın 11. maddesi uyarınca şu haklara sahipsiniz:</p>
            <ol className="mt-3 list-decimal space-y-3 pl-5">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
              <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
              <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
              <li>KVKK 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
              <li>Düzeltme, silme ve yok edilme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme,</li>
              <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme.</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">7. Başvuru Yöntemi</h2>
            <p>Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tevsik edici belgeler ile birlikte talebinizi:</p>
            <ul className="mt-3 list-disc pl-5">
              <li>Kayıtlı e-posta adresinizden <strong className="text-slate-900 dark:text-gray-100">ilker.tuna@mikatinur.com.tr</strong> adresine güvenli elektronik imzalı, mobil imzalı veya sistemimizde kayıtlı bulunan e-posta adresinizi kullanarak gönderebilirsiniz.</li>
            </ul>
            <p className="mt-4">Başvurularınız, talebin niteliğine göre en kısa sürede ve en geç <strong className="text-slate-900 dark:text-gray-100">30 (otuz) gün içinde</strong> ücretsiz olarak sonuçlandırılacaktır. Talebin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.</p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
              8. Fikri Mülkiyet, Asıl Nüsha Kaynağı ve Ticari Olmayan Hizmet Beyanı (5846 Sayılı FSEK)
            </h2>
            <ul className="list-disc space-y-3 pl-5">
              <li>
                <strong className="text-slate-900 dark:text-gray-100">Asıl Nüsha Kaynağı ve Metin Sıhhati:</strong> Mîkāt-ı Nur web platformunda ve mobil uygulamasında yer alan 15 ciltlik <em>Risale-i Nur Külliyatı</em> metinleri; Bediüzzaman Said Nursî Hazretlerinin varisleri tarafından muhafaza edilen <strong className="text-slate-900 dark:text-gray-100">Hizmet Vakfı / Envâr Neşriyat</strong> baskıları (<em>Asıl Nüsha</em>) esas alınarak, metinlerin aslî imlâsına, sayfa düzenine ve haşiyelerine %100 sadık kalınarak, hiçbir sadeleştirme veya tahrifat yapılmaksızın dijital okuma ve tefekkür amacıyla sunulmaktadır.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-gray-100">İstiğna Düsturu ve %100 Ücretsiz / Ticari Amaçsız Hizmet Taahhüdü:</strong> Risale-i Nur’un temel esası olan <em>«İn ecrîye illâ alâllâh» (Benim ecrim ancak Allah’a aittir — Mektubat, İkinci Mektub, s. 13)</em> ve <em>Emirdağ Lâhikası I (s. 49)</em> düsturları gereğince; Mîkāt-ı Nur web sitesi ve mobil uygulaması <strong className="text-slate-900 dark:text-gray-100">tamamen ücretsiz ve reklamsız</strong> bir iman ve Kur’an hizmeti projesidir. Kullanıcılardan hiçbir ad altında abonelik, ücret, bağış veya uygulama içi satın alma talep edilmez ve eserler üzerinden hiçbir ticari kazanç güdülmez.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-gray-100">Hak Sahiplerine Saygı ve İletişim (Uyar-Kaldır İlkesi):</strong> 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında ilgili vakıf, yayınevi ve hak sahiplerinin tüm manevi ve mali haklarına tam riayet edilmektedir. Eser künyesi, metin tashihi veya yayım esaslarına ilişkin ilgili vakıf ve hak sahiplerinden gelecek her türlü resmi bildirim ve talep, <a href="mailto:ilker.tuna@mikatinur.com.tr" className="text-blue-600 dark:text-blue-300 hover:underline font-medium">ilker.tuna@mikatinur.com.tr</a> adresi üzerinden derhal ve öncelikle yerine getirilir.
              </li>
            </ul>
          </section>
        </div>
      </article>
    </main>
  );
}
