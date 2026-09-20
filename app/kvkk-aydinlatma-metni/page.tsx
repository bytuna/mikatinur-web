import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "6698 sayılı KVKK uyarınca Mîkāt-ı Nur kullanıcıları için aydınlatma metni.",
  alternates: {
    canonical: "/kvkk-aydinlatma-metni",
  },
};

export default function KvkkAydinlatmaMetniPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-5 py-12 text-gray-300 sm:px-8 sm:py-20">
      <article className="mx-auto max-w-3xl leading-7">
        <Link href="/" className="mb-10 inline-block text-sm text-gray-500 transition-colors hover:text-white">
          ← Ana Sayfaya Dön
        </Link>

        <header className="mb-12 border-b border-gray-800 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            6698 Sayılı KVKK Uyarınca Aydınlatma Metni
          </h1>
          <div className="mt-6 space-y-2 text-sm text-gray-400">
            <p><strong className="text-gray-200">Veri Sorumlusu:</strong> İlker Tuna (Mîkāt-ı Nur)</p>
            <p><strong className="text-gray-200">Web Sitesi:</strong>{" "}
              <a href="https://www.mikatinur.com.tr" className="text-blue-300 hover:text-blue-200">
                www.mikatinur.com.tr
              </a>
            </p>
            <p><strong className="text-gray-200">İletişim / KEP veya E-Posta:</strong>{" "}
              <a href="mailto:ilker.tuna@mikatinur.com.tr" className="text-blue-300 hover:text-blue-200">
                ilker.tuna@mikatinur.com.tr
              </a>
            </p>
            <p><strong className="text-gray-200">Tarih:</strong> 19 Eylül 2026</p>
          </div>
        </header>

        <div className="space-y-10 text-[15px] sm:text-base">
          <p>
            İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (&quot;KVKK&quot;) 10. maddesi ile <em>Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ</em> kapsamında, veri sorumlusu sıfatıyla <strong className="text-gray-100">İlker Tuna</strong> tarafından <strong className="text-gray-100">Mîkāt-ı Nur</strong> mobil uygulaması ve web sitesi kullanıcılarının kişisel verilerinin işlenmesine ilişkin olarak hazırlanmıştır.
          </p>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">1. İşlenen Kişisel Veri Kategorileri ve Türleri</h2>
            <ul className="list-disc space-y-3 pl-5">
              <li><strong className="text-gray-100">Lokasyon / Konum Bilgisi:</strong> Cihazın yaklaşık veya hassas coğrafi konum koordinatları (GPS ve ağ tabanlı veriler).</li>
              <li><strong className="text-gray-100">Kimlik ve İletişim Bilgileri (İsteğe Bağlı):</strong> Kullanıcı hesabı oluşturulması halinde ad, soyad ve e-posta adresi.</li>
              <li><strong className="text-gray-100">İşlem ve Kullanım Güvenliği Bilgileri:</strong> IP adresi, cihaz işletim sistemi sürümü, cihaz modeli, çökme logları ve uygulama hata kayıtları.</li>
              <li><strong className="text-gray-100">Kullanıcı İşlem Verileri:</strong> Okuma geçmişi, sayfa ayraçları, favoriler ve notlar (bu veriler öncelikli olarak kullanıcının cihazında yerel veri tabanında saklanmaktadır).</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">2. Kişisel Verilerin İşlenme Amaçları</h2>
            <p className="mb-3">Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ol className="list-decimal space-y-3 pl-5">
              <li>Bulunduğunuz konuma göre namaz ve ezan vakitlerinin hassas şekilde hesaplanması ve vakit bildirimlerinin sunulması,</li>
              <li>Uygulama içi oturum açma, profil yönetimi ve kullanıcı tercihlerinin senkronizasyonu (isteğe bağlı hesap açılması durumunda),</li>
              <li>Uygulamanın teknik kararlılığının ve performansının izlenmesi, çökme ve hata analizlerinin yapılması,</li>
              <li>5651 sayılı Kanun kapsamındaki yasal log tutma yükümlülüklerinin yerine getirilmesi,</li>
              <li>Bilgi güvenliği süreçlerinin yürütülmesi ve yetkisiz erişimlerin önlenmesi.</li>
            </ol>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">3. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
            <p>
              Kişisel verileriniz, Mîkāt-ı Nur mobil uygulamasının yüklenmesi, cihaz izinlerinin (konum, bildirim vb.) verilmesi, uygulama içi formların doldurulması ve uygulamanın arka plan/ön plan servislerinin çalışması sırasında <strong className="text-gray-100">tamamen veya kısmen otomatik yöntemlerle</strong> elektronik ortamda toplanmaktadır.
            </p>
            <p className="mt-4">Söz konusu kişisel veriler, KVKK’nın 5. maddesinde belirtilen aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
            <ul className="mt-3 list-disc space-y-3 pl-5">
              <li><strong className="text-gray-100">Açık Rıza (Madde 5/1):</strong> Cihaz izinleri üzerinden konum verilerinin işlenmesi ve isteğe bağlı hesap açılması süreçlerinde,</li>
              <li><strong className="text-gray-100">Bir Sözleşmenin Kurulması veya İfası (Madde 5/2-c):</strong> Kullanıcının talep ettiği dijital kütüphane ve vakit hesaplama hizmetlerinin doğrudan sunulabilmesi için,</li>
              <li><strong className="text-gray-100">Veri Sorumlusunun Hukuki Yükümlülüğü (Madde 5/2-ç):</strong> 5651 sayılı Kanun ve ilgili mevzuat uyarınca sistem erişim ve işlem loglarının tutulması,</li>
              <li><strong className="text-gray-100">Meşru Menfaat (Madde 5/2-f):</strong> Temel hak ve özgürlüklerinize zarar vermemek kaydıyla, uygulamanın performansının artırılması, hataların tespiti ve güvenliğin temini için.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">4. Kişisel Verilerin Aktarılması</h2>
            <p>Toplanan kişisel verileriniz, üçüncü taraf reklam ağları veya veri simsarlarıyla <strong className="text-gray-100">asla paylaşılmaz veya satılmaz</strong>. Verileriniz yalnızca:</p>
            <ul className="mt-3 list-disc space-y-3 pl-5">
              <li>Sunucu barındırma, altyapı ve analitik hizmetlerinin yürütülmesi amacıyla gerekli teknik entegrasyonlar kapsamında altyapı sağlayıcılarına (Google Play Hizmetleri, Google Analytics for Firebase ve Crashlytics),</li>
              <li>Yasal bir zorunluluk veya adli/idari talep halinde kanunen yetkili kamu kurum ve kuruluşları ile adli mercilere,</li>
            </ul>
            <p className="mt-3">KVKK’nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak aktarılabilir.</p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">5. Kişisel Verilerin Saklanma Süresi ve İmhası</h2>
            <p>Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca veya ilgili mevzuatta öngörülen yasal saklama süreleri (örn. 5651 sayılı Kanun gereği log kayıtları için öngörülen süreler) boyunca muhafaza edilir. Sürenin sona ermesi veya veri sahibinin geçerli talebi halinde veriler silinir, yok edilir veya anonim hale getirilir.</p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">6. İlgili Kişinin Hakları (KVKK Madde 11)</h2>
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
            <h2 className="mb-4 text-xl font-semibold text-white">7. Başvuru Yöntemi</h2>
            <p>Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tevsik edici belgeler ile birlikte talebinizi:</p>
            <ul className="mt-3 list-disc pl-5">
              <li>Kayıtlı e-posta adresinizden <strong className="text-gray-100">ilker.tuna@mikatinur.com.tr</strong> adresine güvenli elektronik imzalı, mobil imzalı veya sistemimizde kayıtlı bulunan e-posta adresinizi kullanarak gönderebilirsiniz.</li>
            </ul>
            <p className="mt-4">Başvurularınız, talebin niteliğine göre en kısa sürede ve en geç <strong className="text-gray-100">30 (otuz) gün içinde</strong> ücretsiz olarak sonuçlandırılacaktır. Talebin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
