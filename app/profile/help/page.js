import { Mail, Phone, MessageSquare, ChevronDown } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      question: "How does Cashback work?",
      answer: "When you click through our links to shop at partner stores, we earn a commission. We pass the majority of this commission back to you as Cashback. It gets tracked in your KaroDeal account and can be withdrawn once confirmed."
    },
    {
      question: "Why is my Cashback not tracked?",
      answer: "Cashback usually tracks within 24-72 hours. Ensure you don't use ad-blockers, don't open other coupon sites in between, and complete your purchase in the same session. If it's still missing, you can file a 'Missing Cashback' claim."
    },
    {
      question: "How can I withdraw my earnings?",
      answer: "Once your Cashback is confirmed and you reach the minimum withdrawal threshold, you can request a payout via Bank Transfer, UPI, or Amazon Gift Cards in the 'Payments' section."
    },
    {
      question: "How long does it take for Cashback to be confirmed?",
      answer: "Retailers typically take 30 to 90 days to confirm a transaction after the return/exchange period of your order is over. Once they confirm, your pending Cashback will become confirmed."
    }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 p-5 md:p-8 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800">
      <div className="mb-8 border-b border-neutral-100 dark:border-neutral-800 pb-6">
        <h4 className="font-extrabold text-neutral-900 dark:text-white uppercase tracking-tight mb-2">
          Help & Support
        </h4>
        <p className="text-sm lg:text-[15px] xl:text-base text-neutral-500 dark:text-neutral-400 font-medium">Find answers to common questions or reach out to our team.</p>
      </div>

      <div className="space-y-10">
        {/* Contact Options */}
        <div>
          <h4 className="font-bold text-black dark:text-white mb-4">Contact Us</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shadow-sm border border-neutral-200 dark:border-neutral-700 text-black dark:text-white">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-black dark:text-white">Email Support</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">support@karodeal.in</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h4 className="font-bold text-black dark:text-white mb-4">Frequently Asked Questions</h4>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                <summary className="flex justify-between items-center font-semibold cursor-pointer list-none p-4 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors">
                  <span>{faq.question}</span>
                  <span className="transition group-open:rotate-180">
                    <ChevronDown className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                  </span>
                </summary>
                <div className="text-neutral-600 dark:text-neutral-300 text-[14px] p-4 pt-0 leading-relaxed bg-neutral-50 dark:bg-neutral-800/50">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
