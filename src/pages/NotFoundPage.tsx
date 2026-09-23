import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
        <CardDescription>The page you requested does not exist.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild>
          <Link to="/">Return to the planner</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
