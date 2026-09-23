import { useEffect } from 'react';

const productName = 'ELD Trip Planner';

export function useDocumentTitle(pageName: string) {
  useEffect(() => {
    document.title = `${pageName} | ${productName}`;
  }, [pageName]);
}
