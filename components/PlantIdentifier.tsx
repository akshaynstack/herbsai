"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const formSchema = z.object({
  image: z.instanceof(File).refine((file) => file.size <= 5000000, `Max image size is 5MB.`)
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported."
    )
});

interface PlantInfo {
  common_name: string;
  scientific_name: string;
  family: string;
  description: string;
  native_region: string;
  uses: string;
  interesting_facts: string;
}

export default function PlantIdentifier() {
  const [isLoading, setIsLoading] = useState(false);
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setPlantInfo(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', values.image);

      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to identify plant');
      }

      const data: PlantInfo = await response.json();
      setPlantInfo(data);
      toast({
        title: "Success",
        description: "Plant identified successfully!",
      });
    } catch (error) {
      console.error('Error identifying plant:', error);
      toast({
        title: "Error",
        description: "Failed to identify the plant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(100);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Upload Plant Image</CardTitle>
        <CardDescription>Upload or take a photo of a plant to identify it</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            setSelectedFileName(file.name);
                            toast({
                              title: "File selected",
                              description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
                            });
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button asChild variant="outline">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Image
                        </label>
                      </Button>
                      <Button asChild variant="outline">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Camera className="mr-2 h-4 w-4" />
                          Take Photo
                        </label>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedFileName && (
              <div className="text-sm text-muted-foreground">
                Selected file: {selectedFileName}
              </div>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Identify Plant
            </Button>
          </form>
        </Form>
        {isLoading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {plantInfo && (
          <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">{plantInfo.common_name}</h2>
            <p className="text-lg italic mb-4">{plantInfo.scientific_name}</p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="family">
                <AccordionTrigger>Family</AccordionTrigger>
                <AccordionContent>{plantInfo.family}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>{plantInfo.description}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="native-region">
                <AccordionTrigger>Native Region</AccordionTrigger>
                <AccordionContent>{plantInfo.native_region}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="uses">
                <AccordionTrigger>Uses</AccordionTrigger>
                <AccordionContent>{plantInfo.uses}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="interesting-facts">
                <AccordionTrigger>Interesting Facts</AccordionTrigger>
                <AccordionContent>{plantInfo.interesting_facts}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}