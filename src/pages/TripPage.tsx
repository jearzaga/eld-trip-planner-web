import { useParams } from 'react-router';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function TripPage() {
  const { id } = useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip plan</CardTitle>
        <CardDescription>Trip {id} will appear here when results are implemented.</CardDescription>
      </CardHeader>
    </Card>
  );
}
