export const contactPhone = {
  display: '098 861 00 17',
  international: '+380988610017',
  whatsappDigits: '380988610017',
};

export const messengerChannels = [
  { name: 'Viber', href: 'viber://chat?number=%2B380988610017' },
  { name: 'WhatsApp', href: `https://wa.me/${contactPhone.whatsappDigits}` },
];

export function whatsappRequestUrl(message) {
  return `https://wa.me/${contactPhone.whatsappDigits}?text=${encodeURIComponent(message)}`;
}
