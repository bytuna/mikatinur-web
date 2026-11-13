import type { Metadata } from "next";
import ContactFeedbackView from "@/components/ContactFeedbackView";

export const metadata: Metadata = {
  title: "Bize Ulaşın | Mîkāt-ı Nur",
  description:
    "Mîkāt-ı Nur iletişim ve geri bildirim formu.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return <ContactFeedbackView />;
}
