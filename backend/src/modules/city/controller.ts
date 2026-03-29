/**
 * The Pug app does not expose standalone city HTTP routes.
 * Admin tour screens load `cityList` inside tour controllers; client uses middleware only.
 * Reserved for a future REST admin API for cities.
 */
export const CityController = {} as const;
