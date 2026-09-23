import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function NotFoundPage() {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
        <CardDescription>The page you requested does not exist.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to="/">Return to the planner</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
