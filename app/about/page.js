import Link from 'next/link';
import Button from '@/components/common/Button';

export const metadata = {
  title: 'About Us | Dealora',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 py-12 md:py-24 mb-16 md:mb-20">
      <div className="text-center mb-12 md:mb-24 border-b border-black pb-8 md:pb-12">
        <h1 className="text-4xl md:text-7xl font-black text-black uppercase tracking-tighter mb-4 md:mb-6">About</h1>
        <p className=" sm:text-lg md:text-xl text-neutral-500 font-bold uppercase tracking-widest max-w-2xl mx-auto">
          We curate the internet's best deals.
        </p>
      </div>

      <div className="space-y-16 md:space-y-24">
        <section>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-6 md:mb-8">Who we are</h2>
          <div className=" md:text-lg text-neutral-600 leading-relaxed space-y-4 md:space-y-6">
            <p>
              Dealora is India's premier shopping discovery platform. Founded with the vision of simplifying the online shopping experience, we bring together the best deals, discounts, and offers from across the internet into one unified, easy-to-use interface.
            </p>
            <p>
              We understand that comparing prices across platforms is tedious. Our team works around the clock to curate these offers so you don't have to.
            </p>
          </div>
        </section>

        <section className="border border-black p-6 md:p-12">
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-6 md:mb-8">What we do</h2>
          <ul className="space-y-6  md:text-lg text-neutral-600">
            <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-0">
              <span className="text-black font-black sm:mr-4 uppercase tracking-widest text-xl sm:text-base">01</span>
              <span><strong>CURATE THE BEST DEALS.</strong> We filter out the noise and only show you genuine discounts.</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-start border-t border-neutral-200 pt-6 gap-2 sm:gap-0">
              <span className="text-black font-black sm:mr-4 uppercase tracking-widest text-xl sm:text-base">02</span>
              <span><strong>VERIFY OFFERS.</strong> We ensure that the deals we list are active and provide real value.</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-start border-t border-neutral-200 pt-6 gap-2 sm:gap-0">
              <span className="text-black font-black sm:mr-4 uppercase tracking-widest text-xl sm:text-base">03</span>
              <span><strong>CATEGORIZE INTELLIGENTLY.</strong> Easily find exactly what you're looking for.</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter mb-6 md:mb-8">Our Mission</h2>
          <blockquote className="border-l-4 border-black pl-6 md:pl-8 text-xl sm:text-2xl md:text-4xl text-black font-black uppercase tracking-tighter leading-tight my-6 md:my-8">"To empower every shopper to make informed purchasing decisions and maximize their savings."
          </blockquote>
        </section>

        <div className="pt-12 md:pt-16 border-t border-black">
          <Link href="/deals">
            <Button size="lg" variant="primary" >
              Explore Deals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
