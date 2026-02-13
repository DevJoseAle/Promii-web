"use client";

import { useState } from "react";
import { COLORS } from "@/config/colors";
import { ChevronDown, ShoppingBag, Users, Store, HelpCircle } from "lucide-react";

type FaqItem = {
  q: string;
  a: string;
};

type FaqSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  items: FaqItem[];
};

const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "general",
    title: "Preguntas Generales",
    icon: HelpCircle,
    color: COLORS.primary.main,
    bgColor: COLORS.primary.lighter,
    items: [
      {
        q: "¿Qué es Promii?",
        a: "Promii es una plataforma digital que conecta comercios locales con consumidores a través de promociones exclusivas. Los comercios publican ofertas (llamadas Promiis), los usuarios las compran y las canjean directamente en el establecimiento.",
      },
      {
        q: "¿Promii está disponible en toda Venezuela?",
        a: "Sí, Promii está disponible en todo el territorio de la República Bolivariana de Venezuela. Los comercios pueden publicar ofertas desde cualquier estado y ciudad del país.",
      },
      {
        q: "¿Promii procesa pagos?",
        a: "No. Promii actúa como intermediario tecnológico. Todos los pagos se realizan directamente entre el usuario y el comercio. Promii no interviene en transacciones financieras.",
      },
      {
        q: "¿Necesito ser mayor de edad para usar Promii?",
        a: "Sí, solo pueden registrarse personas mayores de 18 años. Al crear tu cuenta, declaras que cumples con este requisito.",
      },
      {
        q: "¿Qué pasa con mis datos personales?",
        a: "Promii recopila datos básicos como nombre, email, teléfono y ubicación para el funcionamiento de la plataforma. Implementamos medidas de seguridad razonables y puedes solicitar acceso, rectificación o eliminación de tus datos en cualquier momento.",
      },
    ],
  },
  {
    id: "users",
    title: "Para Usuarios",
    icon: ShoppingBag,
    color: COLORS.accent.main,
    bgColor: COLORS.accent.lighter,
    items: [
      {
        q: "¿Cómo compro un Promii?",
        a: "Explora las promociones disponibles, elige la que te interese y coordina el pago directamente con el comercio. Una vez confirmado, recibirás un código único de canje.",
      },
      {
        q: "¿Cómo canjeo mi Promii?",
        a: "Presenta tu código único en el establecimiento del comercio. El merchant validará tu código y podrás disfrutar de tu promoción al instante.",
      },
      {
        q: "¿Puedo comprar más de un Promii del mismo comercio?",
        a: "Depende de la configuración de cada promoción. Algunos Promiis permiten múltiples compras por usuario y otros están limitados a uno por persona. Esta información aparece en los detalles de cada oferta.",
      },
      {
        q: "¿Qué pasa si mi Promii vence?",
        a: "Cada Promii tiene una fecha de vencimiento establecida por el comercio. Una vez vencido, el código ya no podrá ser canjeado. Te recomendamos estar atento a las fechas y canjear tu Promii antes de que expire.",
      },
      {
        q: "¿Puedo pedir un reembolso?",
        a: "Los reembolsos se gestionan directamente con el comercio, ya que Promii no procesa pagos. Te recomendamos contactar al merchant para cualquier solicitud de devolución.",
      },
      {
        q: "¿Qué hago si tengo un problema con un comercio?",
        a: "Si tienes algún inconveniente con un producto o servicio, debes resolverlo directamente con el comercio. Promii actúa como intermediario tecnológico y no es responsable por la calidad de los productos o servicios ofrecidos.",
      },
      {
        q: "¿Cómo funciona un código de influencer?",
        a: "Si un influencer comparte un código contigo, puedes usarlo al momento de la compra para obtener un descuento adicional. Solo ingresa el código en la página del Promii antes de comprar.",
      },
      {
        q: "¿Puedo ver mis compras anteriores?",
        a: "Sí, en tu perfil encontrarás el historial completo de tus compras, incluyendo Promiis activos, canjeados y vencidos.",
      },
      {
        q: "¿Promii cobra comisión a los usuarios?",
        a: "No. El uso de Promii es completamente gratuito para los usuarios. Solo pagas el precio del Promii directamente al comercio.",
      },
    ],
  },
  {
    id: "influencers",
    title: "Para Influencers",
    icon: Users,
    color: COLORS.warning.main,
    bgColor: COLORS.warning.lighter,
    items: [
      {
        q: "¿Cómo me registro como influencer en Promii?",
        a: "Ve a la sección de influencers y completa el formulario de aplicación con tus datos y redes sociales. Nuestro equipo revisará tu solicitud y, una vez aprobada, tendrás acceso completo al panel de influencer.",
      },
      {
        q: "¿Cómo genero ingresos como influencer?",
        a: "Al conectar con merchants, obtienes códigos de referido únicos. Cada vez que un usuario compra un Promii usando tu código, generas una comisión. Cuanto más promociones y más ventas generes, más ganas.",
      },
      {
        q: "¿Cómo funcionan los códigos de referido?",
        a: "Cada código de referido es único y está vinculado a ti y a un Promii específico. Puede ser generado automáticamente o personalizado por el merchant. Tus seguidores lo usan al comprar para que se te acredite la venta.",
      },
      {
        q: "¿Qué porcentaje de comisión recibo?",
        a: "La comisión se negocia directamente con cada merchant y puede variar. Generalmente oscila entre el 5% y el 20% por venta, dependiendo del acuerdo. Los detalles aparecen en tu panel de ganancias.",
      },
      {
        q: "¿Cómo me pagan las comisiones?",
        a: "Las comisiones se negocian y pagan directamente entre tú y el merchant. Promii facilita la conexión pero no interviene en los pagos de comisiones.",
      },
      {
        q: "¿Puedo trabajar con varios comercios a la vez?",
        a: "Sí, puedes conectar con todos los merchants que desees y promocionar múltiples Promiis simultáneamente. No hay límite de partnerships.",
      },
      {
        q: "¿Qué pasa si uso mal un código de referido?",
        a: "El uso indebido de códigos (compartirlos de manera engañosa, usarlos tú mismo para autocompras, etc.) puede resultar en la suspensión de tu cuenta. Promii se reserva el derecho de tomar medidas en caso de fraude.",
      },
      {
        q: "¿Promii garantiza que ganaré dinero?",
        a: "No. Promii es una herramienta que facilita la conexión entre influencers y comercios, pero no garantiza ingresos ni comisiones. Tus resultados dependen de tu audiencia y estrategia de promoción.",
      },
      {
        q: "¿Cómo conecto con merchants?",
        a: "Desde tu panel de influencer puedes buscar comercios verificados, enviarles solicitudes de partnership y, una vez aprobadas, comenzar a generar códigos para sus Promiis.",
      },
    ],
  },
  {
    id: "merchants",
    title: "Para Comercios",
    icon: Store,
    color: COLORS.success.main,
    bgColor: COLORS.success.lighter,
    items: [
      {
        q: "¿Cómo registro mi negocio en Promii?",
        a: "Completa el formulario de aplicación para merchants con los datos de tu negocio. Nuestro equipo verificará la información y, una vez aprobado, tendrás acceso al panel de gestión para empezar a publicar promociones.",
      },
      {
        q: "¿Cuánto cuesta publicar en Promii?",
        a: "Actualmente puedes publicar Promiis de forma gratuita. En el futuro, podrán existir planes comerciales que impliquen pagos por publicación o funcionalidades premium.",
      },
      {
        q: "¿Cómo creo una promoción (Promii)?",
        a: "Desde tu dashboard, ve a 'Crear Promii'. Llena los datos: título, descripción, precio, descuento, fotos, ubicación, fechas de vigencia y condiciones. Una vez guardado, quedará como borrador hasta que lo actives.",
      },
      {
        q: "¿Cómo valido el código de un cliente?",
        a: "Cuando un cliente llega a tu establecimiento con un código, ve a la sección 'Validar' en tu dashboard. Ingresa o escanea el código y el sistema confirmará si es válido. Una vez validado, el Promii queda como canjeado.",
      },
      {
        q: "¿Puedo editar o pausar un Promii activo?",
        a: "Sí. Puedes editar los detalles de un Promii en cualquier momento y también pausarlo si necesitas detenerlo temporalmente. Al reactivarlo, volverá a estar visible para los usuarios.",
      },
      {
        q: "¿Cómo conecto con influencers?",
        a: "Desde tu dashboard puedes buscar influencers verificados, recibir solicitudes de partnership y asignar códigos de referido a Promiis específicos. Tú decides con quién trabajar y en qué condiciones.",
      },
      {
        q: "¿Promii garantiza que tendré ventas?",
        a: "No. Promii te proporciona la plataforma y las herramientas para llegar a más clientes, pero no garantiza un volumen de ventas específico. Tus resultados dependen de la calidad de tus ofertas y tu estrategia.",
      },
      {
        q: "¿Quién es responsable de los productos y servicios?",
        a: "El merchant es responsable absoluto de los productos y servicios ofrecidos a través de sus Promiis. Promii no interviene en la calidad, disponibilidad ni cumplimiento de las ofertas.",
      },
      {
        q: "¿Qué pasa con las fotos y contenido que subo?",
        a: "Todo contenido subido a Promii pasa a ser propiedad de la plataforma. Promii podrá utilizar dicho contenido para marketing, publicidad y posicionamiento SEO sin limitación territorial ni temporal.",
      },
      {
        q: "¿Puedo ver mis Promiis comprados como consumidor?",
        a: "Sí. Si además de ser merchant también compras Promiis de otros comercios, encontrarás tu historial de compras en la sección 'Mis Compras' de tu dashboard.",
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="border rounded-xl overflow-hidden transition-all duration-200"
      style={{
        borderColor: isOpen ? COLORS.primary.light : COLORS.border.light,
        backgroundColor: isOpen ? COLORS.primary.lighter + "30" : COLORS.background.primary,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
      >
        <span
          className="text-sm font-semibold leading-snug"
          style={{ color: COLORS.text.primary }}
        >
          {item.q}
        </span>
        <ChevronDown
          className="size-5 shrink-0 transition-transform duration-200"
          style={{
            color: COLORS.text.tertiary,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-4">
          <p
            className="text-sm leading-relaxed"
            style={{ color: COLORS.text.secondary }}
          >
            {item.a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  function toggleItem(key: string) {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const currentSection = FAQ_SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: COLORS.text.primary }}
          >
            Preguntas Frecuentes
          </h1>
          <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
            Encuentra respuestas a las dudas más comunes sobre Promii
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {FAQ_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: isActive ? section.bgColor : COLORS.background.primary,
                  color: isActive ? section.color : COLORS.text.secondary,
                  border: `1.5px solid ${isActive ? section.color : COLORS.border.light}`,
                  boxShadow: isActive ? `0 0 0 1px ${section.color}20` : undefined,
                }}
              >
                <Icon className="size-4" />
                {section.title}
              </button>
            );
          })}
        </div>

        {/* Section Header */}
        <div
          className="rounded-2xl border p-6 mb-6 flex items-center gap-4"
          style={{
            backgroundColor: currentSection.bgColor + "40",
            borderColor: currentSection.color + "30",
          }}
        >
          <div
            className="flex size-12 items-center justify-center rounded-xl shrink-0"
            style={{ backgroundColor: currentSection.bgColor }}
          >
            <currentSection.icon className="size-6" style={{ color: currentSection.color }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.text.primary }}>
              {currentSection.title}
            </h2>
            <p className="text-sm" style={{ color: COLORS.text.secondary }}>
              {currentSection.items.length} preguntas
            </p>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {currentSection.items.map((item, idx) => {
            const key = `${currentSection.id}-${idx}`;
            return (
              <AccordionItem
                key={key}
                item={item}
                isOpen={!!openItems[key]}
                onToggle={() => toggleItem(key)}
              />
            );
          })}
        </div>

        {/* Contact CTA */}
        <div
          className="mt-12 rounded-2xl border p-8 text-center"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h3 className="text-lg font-bold mb-2" style={{ color: COLORS.text.primary }}>
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-sm mb-5" style={{ color: COLORS.text.secondary }}>
            Escríbenos y te responderemos lo antes posible
          </p>
          <a
            href="mailto:ayuda@promii.shop"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.primary.light} 100%)`,
              color: "white",
            }}
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </div>
  );
}
