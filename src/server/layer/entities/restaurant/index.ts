import * as restaurantEntity from './restaurant';
import * as personelEntity from './personel';

export const restaurantEntities = {
    ...restaurantEntity,
    ...personelEntity
};

