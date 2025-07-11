'use client';

import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { IEncounter } from '@/lib/models/encounter/interfaces';

// Simple form schema for basic encounter editing
const encounterEditSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters'),
  difficulty: z.enum(['trivial', 'easy', 'medium', 'hard', 'deadly']).optional(),
  estimatedDuration: z.number().min(1).max(480).optional(),
  tags: z.string().max(200, 'Tags cannot exceed 200 characters'),
});

type EncounterEditForm = z.infer<typeof encounterEditSchema>;

interface FormError {
  message: string;
  details?: string;
}

function ErrorAlert({ error }: { error: FormError }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {error.message}
        {error.details && (
          <div className="text-xs mt-1">
            Details: {error.details}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

function PageLayout({ children, showBackButton = false, onBack }: {
  children: React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {showBackButton && onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <PageLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    </PageLayout>
  );
}

function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <PageLayout showBackButton onBack={onBack}>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-destructive mb-2">{error}</div>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    </PageLayout>
  );
}

function FormActions({
  onCancel,
  onSubmit,
  isSubmitting,
  isValid
}: {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="mb-2 sm:mb-0"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? 'Updating...' : 'Update Encounter'}
      </Button>
    </div>
  );
}

function transformEncounterToFormData(encounter: IEncounter): EncounterEditForm {
  return {
    name: encounter.name,
    description: encounter.description || '',
    difficulty: encounter.difficulty,
    estimatedDuration: encounter.estimatedDuration,
    tags: encounter.tags?.join(', ') || '',
  };
}

export default function EncounterEditPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const encounterId = params?.id as string;

  const [encounter, setEncounter] = useState<IEncounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<FormError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EncounterEditForm>({
    resolver: zodResolver(encounterEditSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (!encounterId || !session?.user?.id) return;

    const fetchEncounter = async () => {
      try {
        const response = await fetch(`/api/encounters/${encounterId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch encounter');
        }

        if (!data.encounter) {
          throw new Error('Encounter not found');
        }

        const encounterData = data.encounter;
        setEncounter(encounterData);

        // Populate form with encounter data
        const formData = transformEncounterToFormData(encounterData);
        form.reset(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load encounter');
      } finally {
        setLoading(false);
      }
    };

    fetchEncounter();
  }, [encounterId, session?.user?.id, form]);

  const navigateToEncounterDetail = () => {
    router.push(`/encounters/${encounterId}`);
  };

  const submitEncounterUpdate = async (data: EncounterEditForm, encounterId: string) => {
    const updateData = {
      name: data.name,
      description: data.description,
      difficulty: data.difficulty,
      estimatedDuration: data.estimatedDuration,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      updatedAt: new Date().toISOString(),
    };

    const response = await fetch(`/api/encounters/${encounterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to update encounter');
    }

    return result;
  };

  const handleSubmissionError = (err: unknown): FormError => {
    return {
      message: err instanceof Error ? err.message : 'Failed to update encounter',
    };
  };

  const onSubmit = async (data: EncounterEditForm) => {
    if (!encounterId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitEncounterUpdate(data, encounterId);
      router.push(`/encounters/${encounterId}`);
    } catch (err) {
      setSubmitError(handleSubmissionError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onBack={navigateToEncounterDetail} />;
  if (!encounter) return <ErrorState error="Encounter not found" onBack={navigateToEncounterDetail} />;

  const isFormValid = form.formState.isValid;

  return (
    <PageLayout>
      <Button variant="ghost" onClick={navigateToEncounterDetail} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Encounter
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Encounter</h1>
          <p className="text-muted-foreground">
            Update your encounter&apos;s information
          </p>
        </div>

        <Form {...form}>
          <div className="space-y-6">
            {submitError && <ErrorAlert error={submitError} />}

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter encounter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter encounter description"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trivial">Trivial</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="deadly">Deadly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter estimated duration"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tags separated by commas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>

        <FormActions
          onCancel={navigateToEncounterDetail}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          isValid={isFormValid}
        />
      </div>
    </PageLayout>
  );
}