/**
 * Central cashback calculation utility based on product sale price slabs
 * 
 * Slabs:
 * 0 to 399:       Without Review = 100, With Review = 200
 * 400 to 599:     Without Review = 150, With Review = 300
 * 600 to 799:     Without Review = 200, With Review = 400
 * 800 to 999:     Without Review = 250, With Review = 500
 * 1000 UP price:  Without Review = 300, With Review = 700
 */
export const calculateCashback = (salePrice) => {
  const price = Math.round(Number(salePrice) || 0);

  if (price <= 399) {
    return { withoutReview: 100, withReview: 200 };
  } else if (price <= 599) {
    return { withoutReview: 150, withReview: 300 };
  } else if (price <= 799) {
    return { withoutReview: 200, withReview: 400 };
  } else if (price <= 999) {
    return { withoutReview: 250, withReview: 500 };
  } else {
    // 1000 and above
    return { withoutReview: 300, withReview: 700 };
  }
};
