import StoreOfferCard from './StoreOfferCard';
import Slider from '@/components/common/Slider';

export default function DealGrid({ deals, cardType = 'deal', mobileGrid = false, tall = false, cardHeight }) {
  if (!deals || deals.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-neutral-800">
        <p className="text-sm lg:text-[15px] xl:text-base text-slate-500 dark:text-neutral-400 font-medium">No deals found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View: Slider (< 640px) */}
      {!mobileGrid && (
        <div className="block sm:hidden -mx-4 px-4">
          <Slider>
            {deals.map(deal => (
              <div key={deal.id} className="w-[85vw] shrink-0 snap-center">
                <StoreOfferCard deal={deal} fullWidth={true} tall={tall} cardHeight={cardHeight} />
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Grid View */}
      <div className={`${mobileGrid ? 'grid grid-cols-1' : 'hidden sm:grid'} sm:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center`}>
        {deals.map(deal => (
          <StoreOfferCard key={deal.id} deal={deal} fullWidth={true} tall={tall} cardHeight={cardHeight} />
        ))}
      </div>
    </>
  );
}
