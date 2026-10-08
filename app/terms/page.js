export const metadata = {
  title: 'Terms & Conditions | KaroDeal',
};

export default function TermsPage() {
  return (
    <div className="page-container pt-12 md:pt-24 pb-24">
      <div className="border-b border-black pb-6 md:pb-8 mb-8 md:mb-12">
        <h3 className="font-black text-black uppercase tracking-tighter mb-4">Terms & Conditions</h3>
        <p className="text-neutral-500 font-bold tracking-widest uppercase text-[10px] md:text-xs">Last updated: October 7, 2026</p>
      </div>

      <div className="space-y-8 md:space-y-12 md:text-lg text-neutral-700 leading-relaxed">
        <p className="font-medium">
          Welcome to KaroDeal! Please read these terms and conditions carefully before using our platform. 
          By accessing or using KaroDeal, you agree to be bound by these Terms & Conditions.
        </p>

        <div>
          <h4 className="font-black text-black uppercase tracking-tighter mb-4 md:mb-6">1. General Platform Usage</h4>
          <p>
            KaroDeal provides a curated selection of discounts, deals, and cashback offers across top Indian e-commerce platforms (such as Flipkart, Amazon, Myntra, etc.). 
            The deals displayed on our website are subject to availability and may change without prior notice. We do not sell products directly; we act as a bridge between shoppers and retail platforms.
          </p>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-tighter mb-4 md:mb-6">2. How to Claim Cashback</h4>
          <p className="mb-4">To successfully track and claim your cashback, you must strictly follow these steps:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must click through the specific deal links provided on the KaroDeal platform before making your purchase.</li>
            <li>After successfully placing an order on the partner store, you must return to KaroDeal to submit a cashback claim.</li>
            <li>You may only submit a cashback claim ticket <strong>after 20 days</strong> from your original order date. This mandatory waiting period ensures the product's return window has expired.</li>
            <li>You are required to upload valid proofs, including a clear screenshot of the <strong>Invoice / Order Receipt</strong> and a <strong>Non-Return Proof</strong> (showing the return window has closed).</li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-tighter mb-4 md:mb-6">3. Mandatory Positive Review Policy</h4>
          <p>
            As part of our cashback verification process, it is <strong>mandatory to submit a product review</strong> on the partner store's platform (e.g., Flipkart, Amazon). 
            Furthermore, this must be a <strong>positive review</strong>. You must take a screenshot of your published positive review and upload it when submitting your claim. 
            Failure to provide a valid positive review screenshot will result in the rejection of your cashback claim.
          </p>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-tighter mb-4 md:mb-6">4. Claim Approval & Timeline</h4>
          <p>
            Once you have submitted your cashback claim along with all the required proofs (Invoice, Positive Review, and Non-Return Proof), our administration team will review your submission. 
            The admin review process typically takes between <strong>24 to 48 hours</strong>. 
            After verification, the admin will either <strong>Approve</strong> or <strong>Reject</strong> your claim based on the validity of your proofs.
          </p>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-tighter mb-4 md:mb-6">5. Wallet & Withdrawals</h4>
          <p>
            Upon approval of a claim, the promised cashback amount will be credited to your KaroDeal Wallet. 
            Users can request a payout/withdrawal to their bank account or UPI only when their Wallet balance reaches a <strong>minimum threshold of ₹1000</strong>. 
            Withdrawal requests for amounts lesser than ₹1000 will not be processed.
          </p>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-tighter mb-4 md:mb-6">6. Fraud & Account Suspension</h4>
          <p>
            Any attempt to manipulate the system, submit fake invoices, cancel orders after claiming, or upload deceptive review screenshots will lead to immediate rejection of the claim. 
            KaroDeal reserves the right to permanently suspend accounts and forfeit wallet balances of users found engaging in fraudulent activities.
          </p>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-tighter mb-4 md:mb-6">7. Third-Party Links</h4>
          <p>
            Our Service contains links to third-party web sites or services that are not owned or controlled by KaroDeal. 
            We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites. 
            We strongly advise you to read the terms and conditions and privacy policies of any third-party web sites that you visit.
          </p>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-tighter mb-4 md:mb-6">8. Changes to These Terms</h4>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </div>
      </div>
    </div>
  );
}
