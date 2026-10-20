export const metadata = {
  title: 'Privacy Policy | KaroDeal',
  description: 'Read KaroDeal’s Privacy Policy to understand how we collect, store, and safeguard your data while processing your cashback claims and discount offers.',
  alternates: {
    canonical: 'https://karodeal.in/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="page-container pt-12 md:pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6 md:pb-8 mb-8 md:mb-12">
          <h1 className="font-black text-black dark:text-white uppercase tracking-tighter mb-4 text-3xl sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-bold tracking-widest uppercase text-[10px] md:text-xs">
            Last updated: October 7, 2026
          </p>
        </div>

        <div className="space-y-8 md:space-y-12 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          <p className="font-medium">
            At KaroDeal, your privacy is our priority. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our website to discover deals and claim cashback.
          </p>

          <div>
            <h2 className="font-black text-black dark:text-white uppercase tracking-tight text-lg sm:text-xl md:text-2xl mb-3 md:mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">To provide you with our cashback services, we collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Information:</strong> Name, email address, and profile details provided during registration.</li>
              <li><strong>Claim Verification Data:</strong> Order IDs, invoice/receipt screenshots, product review screenshots, and non-return proofs submitted by you to claim cashback.</li>
              <li><strong>Payment Information:</strong> Bank account details or UPI IDs provided strictly for processing your wallet withdrawals.</li>
              <li><strong>Usage &amp; Tracking Data:</strong> IP addresses, browser types, and affiliate link tracking data to verify your purchases on partner sites.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-black text-black dark:text-white uppercase tracking-tight text-lg sm:text-xl md:text-2xl mb-3 md:mb-4">
              2. How We Use Your Information
            </h2>
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
            <h2 className="font-black text-black dark:text-white uppercase tracking-tight text-lg sm:text-xl md:text-2xl mb-3 md:mb-4">
              3. Tracking Technologies and Cookies
            </h2>
            <p>
              As a cashback platform, tracking cookies are essential to our service. When you click on a deal link on KaroDeal, we use affiliate cookies to track your outward journey to the partner retailer (e.g., Amazon, Flipkart). 
              This allows the retailer to identify that you came from KaroDeal, which is mandatory for your cashback to be tracked successfully. By using our service, you consent to the use of these tracking technologies.
            </p>
          </div>

          <div>
            <h2 className="font-black text-black dark:text-white uppercase tracking-tight text-lg sm:text-xl md:text-2xl mb-3 md:mb-4">
              4. Data Sharing &amp; Security
            </h2>
            <p>
              We <strong>do not sell</strong> your personal information to third parties. We may share basic tracking IDs with our affiliate partners solely for the purpose of validating your purchases. 
              The screenshots (invoices, reviews) and payment details you upload are stored securely and are only accessible by our admin team for verification and payout processing.
            </p>
          </div>

          <div>
            <h2 className="font-black text-black dark:text-white uppercase tracking-tight text-lg sm:text-xl md:text-2xl mb-3 md:mb-4">
              5. Data Retention
            </h2>
            <p>
              We retain your personal information, claim proofs, and payment details for as long as your account remains active or as needed to provide you services, comply with legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </div>

          <div>
            <h2 className="font-black text-black dark:text-white uppercase tracking-tight text-lg sm:text-xl md:text-2xl mb-3 md:mb-4">
              6. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our support team by email at: <strong>support@karodeal.in</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
