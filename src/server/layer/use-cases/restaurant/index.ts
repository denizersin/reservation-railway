import * as restaurantUseCase from './restaurant';
import * as personelUseCase from './personel';

export const restaurantUseCases = {
    ...restaurantUseCase,
    ...personelUseCase
}

