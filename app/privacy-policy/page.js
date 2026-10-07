export const metadata = {
  title: 'Privacy Policy | KaroDeal',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 pt-12 md:pt-24 pb-24">
      <div className="border-b border-black pb-6 md:pb-8 mb-8 md:mb-12">
        <h3 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter mb-4">Privacy Policy</h3>
        <p className="text-neutral-500 font-bold tracking-widest uppercase text-[10px] md:text-xs">Last updated: October 7, 2026</p>
      </div>

      <div className="space-y-8 md:space-y-12 md:text-lg text-neutral-700 leading-relaxed">
        <p className="font-medium">
          At KaroDeal, your privacy is our priority. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website to discover deals and claim cashback.
        </p>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">1. Information We Collect</h4>
          <p className="mb-4">To provide you with our cashback services, we collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Information:</strong> Name, email address, and profile details provided during registration.</li>
            <li><strong>Claim Verification Data:</strong> Order IDs, invoice/receipt screenshots, product review screenshots, and non-return proofs submitted by you to claim cashback.</li>
            <li><strong>Payment Information:</strong> Bank account details or UPI IDs provided strictly for processing your wallet withdrawals.</li>
            <li><strong>Usage & Tracking Data:</strong> IP addresses, browser types, and affiliate link tracking data to verify your purchases on partner sites.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">2. How We Use Your Information</h4>
          <p className="mb-4">The data we collect is primarily used to ensure a smooth cashback experience. Specifically, we use it to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Verify your purchases and product reviews to approve or reject cashback claims.</li>
            <li>Process withdrawal requests and securely transfer funds to your bank or UPI account.</li>
            <li>Track affiliate clicks to ensure we receive commissions from partner stores, which are then passed on to you as cashback.</li>
            <li>Prevent fraudulent activities, duplicate claims, or fake invoices.</li>
            <li>Send you important updates regarding your account, claim statuses, and new deals.</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">3. Tracking Technologies and Cookies</h4>
          <p>
            As a cashback platform, tracking cookies are essential to our service. When you click on a deal link on KaroDeal, we use affiliate cookies to track your outward journey to the partner retailer (e.g., Amazon, Flipkart). 
            This allows the retailer to identify that you came from KaroDeal, which is mandatory for your cashback to be tracked successfully. By using our service, you consent to the use of these tracking technologies.
          </p>
        </div>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">4. Data Sharing & Security</h4>
          <p>
            We <strong>do not sell</strong> your personal information to third parties. We may share basic tracking IDs with our affiliate partners solely for the purpose of validating your purchases. 
            The screenshots (invoices, reviews) and payment details you upload are stored securely and are only accessible by our admin team for verification and payout processing.
          </p>
        </div>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">5. Data Retention</h4>
          <p>
            We retain your personal information, claim proofs, and payment details for as long as your account remains active or as needed to provide you services, comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </div>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">6. Contact Us</h4>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our support team by email at: <strong>support@karodeal.in</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
