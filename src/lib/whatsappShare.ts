export const getWhatsAppShareLink = (phone: string, message: string) => {
  if (!phone) return '';
  // Strip all non-numeric characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // If the number doesn't have a country code and is 10 digits, add '91'
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  
  const encodedMessage = encodeURIComponent(message);
  
  // If we are in the browser, check if it's a mobile device
  if (typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
  
  // Default to WhatsApp Web for Desktop (bypasses the intermediate screen)
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
};

export const openWhatsAppShare = (phone: string, message: string) => {
  if (!phone) {
    console.error('No phone number provided for WhatsApp share');
    return;
  }
  const link = getWhatsAppShareLink(phone, message);
  window.open(link, 'whatsapp_share_tab');
};
