import moment from "moment";
import Tour from "../tour/tour.model";
import City from "../city/city.model";

export interface CartItemInput {
  tourId: string;
  locationFrom: string;
  departureDate: string | Date;
  // Allow additional dynamic properties from client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface CartItemOutput extends CartItemInput {
  avatar?: string;
  name?: string;
  slug?: string;
  departureDate: string;
  locationFromName?: string;
  priceNewAdult?: number;
  priceNewChildren?: number;
  priceNewBaby?: number;
  stockAdult?: number;
  stockChildren?: number;
  stockBaby?: number;
}

export async function buildCartDetails(cart: CartItemInput[]): Promise<CartItemOutput[]> {
  const cartDetails: CartItemOutput[] = [];

  for (const item of cart) {
    const tourDetail = await Tour.findOne({
      _id: item.tourId,
      status: "active",
      deleted: false,
    });

    const cityDetail = await City.findOne({
      _id: item.locationFrom,
    });

    if (tourDetail && cityDetail) {
      const cartItem: CartItemOutput = {
        ...item,
        avatar: tourDetail.avatar,
        name: tourDetail.name,
        slug: tourDetail.slug,
        departureDate: moment(item.departureDate).format("DD/MM/YYYY"),
        locationFromName: cityDetail.name || "",
        priceNewAdult: tourDetail.priceNewAdult,
        priceNewChildren: tourDetail.priceNewChildren,
        priceNewBaby: tourDetail.priceNewBaby,
        stockAdult: tourDetail.stockAdult,
        stockChildren: tourDetail.stockChildren,
        stockBaby: tourDetail.stockBaby,
      };

      cartDetails.push(cartItem);
    }
  }

  return cartDetails;
}
