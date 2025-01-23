// src/global.d.ts

export {};

declare global {
  interface WPData {
    epubUrl: string;
    // Добавьте другие свойства, если они есть
  }

  interface Window {
    wpData?: WPData;
  }
}

declare module 'react-reader' {
  import React from 'react';

  export interface ReactReaderProps {
    url: string;
    title?: string;
    location?: string;
    locationChanged?: (loc: string) => void;
    tocChanged?: (toc: any[]) => void;
    renderComponent?: React.ComponentType<any>;
    loadingView?: React.ReactNode;
    styles?: any;
    [key: string]: any;
  }

  export class ReactReader extends React.Component<ReactReaderProps> {}
  export class EpubView extends React.Component<any> {}
}
