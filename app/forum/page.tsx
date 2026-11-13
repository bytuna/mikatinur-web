import type { Metadata } from "next";
import ContactFeedbackView from "@/components/ContactFeedbackView";

export const metadata: Metadata = {
  title: "İletişim & Geri Bildirim | Mîkāt-ı Nur",
  description:
    "Mîkāt-ı Nur Android uygulaması ve Web platformu hakkındaki görüş, öneri ve hata bildirimlerinizi bizimle paylaşın.",
  alternates: { canonical: "/forum/" },
};

export default function ForumPage() {
  return <ContactFeedbackView />;
}
