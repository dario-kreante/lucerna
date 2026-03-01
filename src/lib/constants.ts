export const SITE = {
  name: "Lucerna",
  tagline: "Luz que te acompaña",
  url: "https://lucerna.cl",
  description:
    "Servicios funerarios dignos, transparentes y accesibles en Chile.",
  locale: "es-CL",
  whatsapp: "56900000000",
  phone: "+56 9 0000 0000",
  email: "contacto@lucerna.cl",
} as const;

export const NAV_LINKS = [
  { label: "Servicios", href: "/#servicios" },
  { label: "Cómo funciona", href: "/#como-funciona" },
  { label: "Checklist", href: "/checklist/" },
  { label: "Guía", href: "/guia/" },
] as const;

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Hola, necesito orientación sobre servicios funerarios.")}`;
