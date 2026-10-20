/**
 * Helper to detect and parse structured seller applications from contact messages.
 */
export function parseSellerMessage(rawMessage = '') {
  if (!rawMessage || typeof rawMessage !== 'string') return null;

  const isSeller = 
    rawMessage.includes('[E-COMMERCE SELLER LISTING APPLICATION]') ||
    rawMessage.includes('[SELLER PRODUCT LISTING INQUIRY]') ||
    rawMessage.includes('[SELLER') ||
    rawMessage.includes('Brand / Store Name:') ||
    rawMessage.includes('Store / Brand Name:') ||
    rawMessage.includes('E-Commerce Platform:');

  if (!isSeller) return null;

  const getField = (regex) => {
    const match = rawMessage.match(regex);
    return match && match[1] ? match[1].trim() : '';
  };

  const storeName = getField(/(?:Brand \/ Store Name|Store \/ Brand Name|Store Name & Platform):\s*([^\n]+)/i);
  const platform = getField(/(?:E-Commerce Platform|Platform):\s*([^\n]+)/i);
  const rawUrl = getField(/(?:Online Store URL|Product \/ Store Link|Store or Product Link|Store \/ Product Link|Store URL):\s*([^\n]+)/i);
  const contactPerson = getField(/(?:Contact Person|Contact Person Name):\s*([^\n]+)/i);
  const phone = getField(/(?:Phone \/ WhatsApp|WhatsApp \/ Phone|Email \/ Phone|Email \/ WhatsApp|Phone):\s*([^\n]+)/i);
  const category = getField(/(?:Product Categories|Product Category & Notes|Product Category|Note \/ Products Description|Details):\s*([\s\S]*)/i);

  let cleanUrl = rawUrl;
  if (cleanUrl && cleanUrl.toLowerCase() !== 'not provided' && cleanUrl.toLowerCase() !== 'none') {
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
  } else {
    cleanUrl = '';
  }

  return {
    isSeller: true,
    storeName: storeName || 'E-Commerce Store',
    platform: platform || 'Online Marketplace',
    storeUrl: cleanUrl,
    contactPerson: contactPerson || '',
    phone: phone && phone.toLowerCase() !== 'not provided' ? phone : '',
    category: category ? category.trim() : '',
  };
}
