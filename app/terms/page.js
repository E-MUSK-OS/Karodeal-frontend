export const metadata = {
  title: 'Terms & Conditions | KaroDeal',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 pt-12 md:pt-24">
      <div className="border-b border-black pb-6 md:pb-8 mb-8 md:mb-12">
        <h3 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter mb-4">Terms & Conditions</h3>
        <p className="text-neutral-500 font-bold tracking-widest uppercase text-[10px] md:text-xs">Last updated: August 15, 2026</p>
      </div>

      <div className="space-y-8 md:space-y-12  md:text-lg text-neutral-700 leading-relaxed">
        <p>Please read these terms and conditions carefully before using Our Service.</p>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">1. Acknowledgment</h4>
          <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
        </div>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">2. Links to Other Websites</h4>
          <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company. The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. We strongly advise You to read the terms and conditions and privacy policies of any third-party web sites or services that You visit.</p>
        </div>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">3. Limitation of Liability</h4>
          <p>Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.</p>
        </div>

        <div>
          <h4 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">4. Changes to These Terms and Conditions</h4>
          <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect.</p>
        </div>
      </div>
    </div>
  );
}
