export const metadata = {
  title: 'Contact Us & Support | KaroDeal',
  description: 'Have a question about your cashback claim, missing reward, or partnership? Contact the KaroDeal support team. We are here to help.',
  keywords: ['Contact KaroDeal', 'Cashback Support', 'Help Desk', 'Customer Service', 'KaroDeal Contact'],
  alternates: {
    canonical: 'https://karodeal.in/contact',
  },
  openGraph: {
    title: 'Contact Us & Support | KaroDeal',
    description: 'Get in touch with the KaroDeal team for help with your deals, cashback claims, and inquiries.',
    url: 'https://karodeal.in/contact',
    siteName: 'KaroDeal',
    images: [{ url: 'https://karodeal.in/icon-512.png', width: 512, height: 512, alt: 'Contact KaroDeal' }],
  },
};

export default function ContactLayout({ children }) {
  return children;
}
