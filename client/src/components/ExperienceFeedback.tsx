import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Fallback consultants used only when no consultants are configured in the database
const FALLBACK_CONSULTANTS = [
  {
    id: -1,
    name: "Lucas",
    role: "American English Specialist",
    roleEs: "Especialista en Inglés Americano",
    avatarUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/influx-lucas-consultant-g9fd7RPJUHhgoPJyPDRJDS.webp",
    whatsappNumber: "5511947515284",
    active: true,
    sortOrder: 0,
  },
  {
    id: -2,
    name: "Vicky",
    role: "Language Consultant",
    roleEs: "Consultora de Idiomas",
    avatarUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663292442852/Evw5QZUwinvym6RWSTYRUE/influx-vicky-consultant-Ujbvg8zLJogtAb3Qg8QqFk.webp",
    whatsappNumber: "5511947515284",
    active: true,
    sortOrder: 1,
  },
];

interface ExperienceFeedbackProps {
  restaurantName: string;
  restaurantId: number;
  language: "en" | "es";
  onClose?: () => void;
}

type Step = "rating" | "interest_question" | "interest_yes" | "contact_form" | "thank_you" | "no_thanks";

const content = {
  en: {
    title: "How was your experience?",
    subtitle: "Your feedback helps us improve!",
    stars: ["Terrible", "Bad", "OK", "Good", "Amazing!"],
    question: "Did you enjoy practicing a second language like this?",
    questionSub: "Imagine doing this every day — in real situations, with real people!",
    yes: "Yes, it was awesome!",
    no: "Not really...",
    interestTitle: "Want to take this even further?",
    interestText: "At inFlux, we make learning a second language the most exciting thing in your life. Our method is unique — you'll be speaking confidently in real situations faster than you think.",
    meetTeam: "Meet our consultants — they'll show you how:",
    chatWith: "Chat with",
    formTitle: "Leave your contact and we'll reach out!",
    namePlaceholder: "Your name",
    phonePlaceholder: "Your WhatsApp number",
    submit: "Connect me now!",
    noThanks: "Maybe later",
    thankYouTitle: "You're all set!",
    thankYouText: "Our consultant will reach out to you on WhatsApp very soon. Get ready for an amazing journey!",
    close: "Close",
    noThanksTitle: "No problem!",
    noThanksText: "Whenever you're ready, we'll be here. Come back and play anytime!",
  },
  es: {
    title: "¿Cómo fue tu experiencia?",
    subtitle: "¡Tu opinión nos ayuda a mejorar!",
    stars: ["Terrible", "Malo", "Regular", "Bueno", "¡Increíble!"],
    question: "¿Te gustó practicar un segundo idioma así?",
    questionSub: "¡Imagina hacer esto todos los días — en situaciones reales, con personas reales!",
    yes: "¡Sí, fue genial!",
    no: "No mucho...",
    interestTitle: "¿Quieres ir aún más lejos?",
    interestText: "En inFlux, hacemos que aprender un segundo idioma sea lo más emocionante de tu vida. Nuestro método es único — hablarás con confianza en situaciones reales más rápido de lo que imaginas.",
    meetTeam: "Conoce a nuestros consultores — ellos te mostrarán cómo:",
    chatWith: "Hablar con",
    formTitle: "¡Deja tu contacto y te llamamos!",
    namePlaceholder: "Tu nombre",
    phonePlaceholder: "Tu número de WhatsApp",
    submit: "¡Conéctame ahora!",
    noThanks: "Quizás después",
    thankYouTitle: "¡Listo!",
    thankYouText: "Nuestro consultor te contactará por WhatsApp muy pronto. ¡Prepárate para un viaje increíble!",
    close: "Cerrar",
    noThanksTitle: "¡Sin problema!",
    noThanksText: "Cuando estés listo, aquí estaremos. ¡Vuelve a jugar cuando quieras!",
  },
};

// Accent colors for consultant cards (cycles through these)
const CARD_ACCENTS = [
  { border: "hover:border-blue-500/50", bg: "hover:bg-blue-600/20", badge: "bg-blue-600/30 text-blue-300", activeBorder: "border-blue-500/50" },
  { border: "hover:border-pink-500/50", bg: "hover:bg-pink-600/20", badge: "bg-pink-600/30 text-pink-300", activeBorder: "border-pink-500/50" },
  { border: "hover:border-purple-500/50", bg: "hover:bg-purple-600/20", badge: "bg-purple-600/30 text-purple-300", activeBorder: "border-purple-500/50" },
  { border: "hover:border-emerald-500/50", bg: "hover:bg-emerald-600/20", badge: "bg-emerald-600/30 text-emerald-300", activeBorder: "border-emerald-500/50" },
];

export function ExperienceFeedback({ restaurantName, restaurantId, language, onClose }: ExperienceFeedbackProps) {
  const [step, setStep] = useState<Step>("rating");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedConsultantIdx, setSelectedConsultantIdx] = useState<number | null>(null);

  const t = content[language];

  // Fetch consultants from database
  const consultantsQuery = trpc.consultants.byRestaurant.useQuery({ restaurantId });
  const rawConsultants = consultantsQuery.data ?? [];
  const consultants = rawConsultants.length > 0 ? rawConsultants : FALLBACK_CONSULTANTS;

  const saveLead = trpc.leads.save.useMutation();

  const handleRating = (r: number) => {
    setRating(r);
    setTimeout(() => setStep("interest_question"), 600);
  };

  const handleInterestYes = () => {
    setStep("interest_yes");
  };

  const handleInterestNo = () => {
    saveLead.mutate({
      restaurantId,
      language,
      rating,
      interested: false,
      name: null,
      phone: null,
      consultant: null,
    });
    setStep("no_thanks");
  };

  const handleConsultantSelect = (idx: number) => {
    setSelectedConsultantIdx(idx);
    setStep("contact_form");
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) return;

    const selectedConsultant = selectedConsultantIdx !== null ? consultants[selectedConsultantIdx] : null;

    await saveLead.mutateAsync({
      restaurantId,
      language,
      rating,
      interested: true,
      name,
      phone,
      // Map to legacy "lucas"/"vicky" or null for custom consultants
      consultant: selectedConsultant?.id === -1 ? "lucas" : selectedConsultant?.id === -2 ? "vicky" : null,
    });

    // Open WhatsApp with pre-filled message
    const consultantNumber = selectedConsultant?.whatsappNumber ?? "5511947515284";
    const consultantName = selectedConsultant?.name ?? "";
    const msg = language === "en"
      ? `Hi${consultantName ? ` ${consultantName}` : ""}! I just had an amazing experience at ${restaurantName} with the ImAInd app and I'd love to learn more about inFlux! My name is ${name}.`
      : `¡Hola${consultantName ? ` ${consultantName}` : ""}! Acabo de tener una experiencia increíble en ${restaurantName} con la app ImAInd y me gustaría saber más sobre inFlux. Mi nombre es ${name}.`;

    window.open(`https://wa.me/${consultantNumber}?text=${encodeURIComponent(msg)}`, "_blank");
    setStep("thank_you");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-white/10">

        {/* Header gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="p-6">

          {/* STEP: RATING */}
          {step === "rating" && (
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                <p className="text-slate-400 mt-1">{t.subtitle}</p>
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-5xl transition-all duration-150 hover:scale-125"
                  >
                    <span className={star <= (hoveredRating || rating) ? "text-yellow-400" : "text-slate-600"}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {(hoveredRating || rating) > 0 && (
                <p className="text-slate-300 text-sm animate-fade-in">
                  {t.stars[(hoveredRating || rating) - 1]}
                </p>
              )}
            </div>
          )}

          {/* STEP: INTEREST QUESTION */}
          {step === "interest_question" && (
            <div className="text-center space-y-6">
              <div className="text-5xl">🌍</div>
              <div>
                <h2 className="text-xl font-bold text-white leading-snug">{t.question}</h2>
                <p className="text-slate-400 mt-2 text-sm">{t.questionSub}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleInterestYes}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl text-lg"
                >
                  {t.yes}
                </Button>
                <Button
                  onClick={handleInterestNo}
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white"
                >
                  {t.no}
                </Button>
              </div>
            </div>
          )}

          {/* STEP: INTEREST YES - Show consultants */}
          {step === "interest_yes" && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="text-4xl mb-2">✨</div>
                <h2 className="text-xl font-bold text-white">{t.interestTitle}</h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">{t.interestText}</p>
              </div>
              <p className="text-center text-slate-300 text-sm font-medium">{t.meetTeam}</p>

              {/* Dynamic consultants grid */}
              {consultantsQuery.isLoading ? (
                <div className="text-center py-4 text-slate-400 text-sm">Carregando consultores...</div>
              ) : (
                <div className={`grid gap-4 ${consultants.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {consultants.map((c, idx) => {
                    const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
                    const roleLabel = language === "es" ? (c.roleEs || c.role) : c.role;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleConsultantSelect(idx)}
                        className={`group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 ${accent.bg} border border-white/10 ${accent.border} transition-all duration-200`}
                      >
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/40 transition-all flex items-center justify-center bg-white/10">
                          {c.avatarUrl ? (
                            <img
                              src={c.avatarUrl}
                              alt={c.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">👤</span>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-sm">{c.name}</p>
                          {roleLabel && <p className="text-slate-400 text-xs">{roleLabel}</p>}
                        </div>
                        <span className={`text-xs ${accent.badge} px-3 py-1 rounded-full font-medium`}>
                          {t.chatWith} {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <Button
                onClick={handleInterestNo}
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-300 text-sm"
              >
                {t.noThanks}
              </Button>
            </div>
          )}

          {/* STEP: CONTACT FORM */}
          {step === "contact_form" && (
            <div className="space-y-5">
              <div className="text-center">
                {selectedConsultantIdx !== null && consultants[selectedConsultantIdx]?.avatarUrl ? (
                  <img
                    src={consultants[selectedConsultantIdx].avatarUrl!}
                    alt={consultants[selectedConsultantIdx].name}
                    className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-purple-500 mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-purple-500 mx-auto mb-3 flex items-center justify-center text-2xl">
                    👤
                  </div>
                )}
                <h2 className="text-lg font-bold text-white">{t.formTitle}</h2>
              </div>
              <div className="space-y-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 rounded-xl h-12"
                />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  type="tel"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 rounded-xl h-12"
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!name.trim() || !phone.trim() || saveLead.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 rounded-2xl text-lg"
              >
                {saveLead.isPending ? "..." : `💬 ${t.submit}`}
              </Button>
              <Button
                onClick={() => setStep("interest_yes")}
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-300 text-sm"
              >
                ← Back
              </Button>
            </div>
          )}

          {/* STEP: THANK YOU */}
          {step === "thank_you" && (
            <div className="text-center space-y-5 py-4">
              <div className="text-6xl animate-bounce">🎉</div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t.thankYouTitle}</h2>
                <p className="text-slate-300 mt-2 leading-relaxed">{t.thankYouText}</p>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-2xl"
              >
                {t.close}
              </Button>
            </div>
          )}

          {/* STEP: NO THANKS */}
          {step === "no_thanks" && (
            <div className="text-center space-y-5 py-4">
              <div className="text-6xl">😊</div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t.noThanksTitle}</h2>
                <p className="text-slate-300 mt-2 leading-relaxed">{t.noThanksText}</p>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl"
              >
                {t.close}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
