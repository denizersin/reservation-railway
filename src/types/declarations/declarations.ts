import { EnumTableShape } from '@/shared/enums/predefined-enums';
import 'react-grid-layout';

declare module 'react-grid-layout' {
  export interface Layout {
    tableId: number;
    shape:EnumTableShape
    // Add any other custom properties you need
  }
}