"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Bug,
  CheckCircle2,
  Clock,
  Compass,
  HelpCircle,
  Lightbulb,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
} from "lucide-react";

const CATEGORIES = [
  {
    id: "Öneri & Görüş",
    label: "Genel Görüş & Öneri",
    icon: Lightbulb,
  },
  {
    id: "Android Uygulaması",
    label: "Android Uygulaması (APK)",
    icon: Smartphone,
  },
  {
    id: "Namaz Vakitleri & Takvim",
    label: "Vakitler & İmsakiye",
    icon: Clock,
  },
  {
    id: "Risale-i Nur & Lügat",
    label: "Risale-i Nur & Lügat",
    icon: BookOpen,
  },
  {
    id: "Teknik Hata Bildirimi",
    label: "Hata Bildirimi",
    icon: Bug,
  },
];

const TOPIC_CARDS = [
  {
    title: "Öneri & Yeni Özellik Talebi",
    desc: "Mîkāt-ı Nur Android uygulaması (v1.1.7) veya Web platformumuzda görmek istediğiniz yeni araçları ve fikirlerinizi paylaşın.",
    icon: Lightbulb,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    title: "Hata & İçerik Düzeltmesi",
    desc: "Ezan vakitleri, Kıble pusulası, Risale-i Nur metinleri veya Osmanlıca-Türkçe lügatta fark ettiğiniz düzeltmeleri bize bildirin.",
    icon: Bug,
    color: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
  },
  {
    title: "Kurulum & Kullanım Desteği",
    desc: "Android APK kurulumu, bildirim ayarları, okuma temaları veya yapay zeka tefekkür asistanı hakkında destek alın.",
    icon: HelpCircle,
    color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  },
];

export default function ContactFeedbackView() {
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0].id);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("https://formspree.io/f/xkolwoep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          name,
          email,
          message,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setErrorMsg("Mesaj gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.");
      }
    } catch {
      setErrorMsg("Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-gray-100 transition-colors duration-300 pb-20">
      {/* Arka Plan Işık Dokusu */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-36 left-1/2 h-[440px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-500/10 via-blue-500/8 to-purple-500/10 blur-3xl" />
      </div>

      {/* Üst Bar */}
      <div className="relative z-10 border-b border-slate-200/80 dark:border-white/[0.07] bg-white/80 dark:bg-[#0b0d13]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3 pr-24 sm:pr-28">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ana Sayfaya Dön
            </Link>

            <Link
              href="/projects/mikatinur"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <Compass className="h-3.5 w-3.5 text-emerald-500" />
              Mîkāt-ı Nur Hakkında
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>İletişim &amp; Geri Bildirim Merkezi</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12">
        {/* ÜST BAŞLIK BÖLÜMÜ */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 sm:p-10 shadow-sm mb-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl"
          />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Birlikte Geliştiriyoruz</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Geri Bildirim &amp; İletişim
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed">
              Mîkāt-ı Nur Android uygulaması ve Web platformu hakkındaki görüşlerinizi, özellik önerilerinizi veya
              karşılaştığınız teknik durumları bizimle paylaşın. Gönderdiğiniz her mesaj doğrudan geliştirici ekibimize ulaşır.
            </p>
          </div>
        </section>

        {/* İKİ SÜTUNLU ANA İÇERİK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SOL SÜTUN: BİLGİLENDİRME VE KONU KARTLARI (5 Sütun) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-4">
                Hangi Konularda Yazabilirsiniz?
              </h2>

              <div className="space-y-3.5">
                {TOPIC_CARDS.map(({ title, desc, icon: Icon, color }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-slate-50/70 dark:bg-white/[0.02] p-4"
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gizlilik & KVKK Kutusu */}
            <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.07] via-teal-500/[0.03] to-transparent bg-white dark:bg-[#0d111a] p-6 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Gizlilik ve KVKK Güvencesi
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                    Paylaştığınız ad ve e-posta bilgileri yalnızca mesajınıza geri dönüş yapılabilmesi amacıyla kullanılır,
                    üçüncü kişilerle kesinlikle paylaşılmaz.
                  </p>
                  <Link
                    href="/kvkk-aydinlatma-metni"
                    className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    KVKK Aydınlatma Metnini İncele →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ SÜTUN: ETKİLEŞİMLİ İLETİŞİM FORMU (7 Sütun) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 sm:p-8 shadow-lg dark:shadow-2xl">
              {isSuccess ? (
                <div className="py-12 px-4 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Mesajınız Başarıyla İletildi!
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    Değerli görüş ve katkınız için teşekkür ederiz. Mesajınız sistem yöneticimize ulaştı; en kısa sürede
                    incelenecektir.
                  </p>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsSuccess(false)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 text-sm transition-all cursor-pointer"
                    >
                      Yeni Mesaj Gönder
                    </button>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] text-slate-700 dark:text-gray-200 font-semibold px-5 py-2.5 text-sm transition-all"
                    >
                      Ana Sayfaya Dön
                    </Link>
                  </div>
                </div>
              ) : (
                <form
                  action="https://formspree.io/f/xkolwoep"
                  method="POST"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <input type="hidden" name="_next" value="https://mikatinur.com.tr/" />
                  <input type="hidden" name="category" value={selectedCategory} />

                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      Bize Mesaj Gönderin
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                      Aşağıdaki formu doldurarak doğrudan bize ulaşabilirsiniz
                    </p>
                  </div>

                  {/* Konu / Kategori Seçici */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2">
                      İletişim Konusu
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(({ id, label, icon: Icon }) => {
                        const active = selectedCategory === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedCategory(id)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                              active
                                ? "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 shadow-xs"
                                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ad Soyad & E-posta Yan Yana */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2"
                      >
                        Adınız Soyadınız
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                        <input
                          id="contact-name"
                          type="text"
                          name="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Örn: Ahmet Yılmaz"
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-black/40 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/60 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2"
                      >
                        E-posta Adresiniz
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ornek@eposta.com"
                          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-black/40 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/60 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mesaj Alanı */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2"
                    >
                      Mesajınız ({selectedCategory})
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Görüşünüzü, önerinizi veya karşılaştığınız durumu detaylıca yazabilirsiniz..."
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-black/40 p-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-black/60 outline-none transition-all resize-y"
                    />
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3.5 px-6 text-sm sm:text-base transition-all shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Gönderiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Mesajı Gönder</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-500 dark:text-gray-500">
                    * Mesajlarınız doğrudan sistem yöneticisine e-posta olarak iletilecektir.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
