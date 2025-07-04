import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => (
  <div className="flex items-center gap-4 mb-6">
    <Button variant="outline" size="sm" onClick={onClick}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  </div>
);

interface LoadingStateProps {
  onBack: () => void;
}

export const LoadingState = ({ onBack }: LoadingStateProps) => (
  <div className="max-w-4xl mx-auto p-6">
    <BackButton onClick={onBack} />
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading character...</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

interface ErrorStateProps {
  error: string;
  onBack: () => void;
}

export const ErrorState = ({ error, onBack }: ErrorStateProps) => (
  <div className="max-w-4xl mx-auto p-6">
    <BackButton onClick={onBack} />
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  </div>
);

interface NotFoundStateProps {
  onBack: () => void;
}

export const NotFoundState = ({ onBack }: NotFoundStateProps) => (
  <div className="max-w-4xl mx-auto p-6">
    <BackButton onClick={onBack} />
    <Alert>
      <AlertDescription>Character not found</AlertDescription>
    </Alert>
  </div>
);