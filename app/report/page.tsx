'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  MapPin,
  Mic,
  Check,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { api, uploadFiles } from '@/lib/api-client';
import { API_ENDPOINTS, COMPLAINT_CATEGORIES, FILE_LIMITS } from '@/lib/constants';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('@/components/dynamic-map'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />,
});

const complaintSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  category: z.string().min(1, 'Please select a category'),
  sub_category: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  address_city: z.string().min(1, 'City is required'),
  address_state: z.string().min(1, 'State is required'),
  address_pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
  landmark: z.string().optional(),
  is_urgent: z.boolean().optional(),
  is_public: z.boolean().optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

const STEPS = [
  { id: 1, title: "What's the issue?", icon: AlertCircle },
  { id: 2, title: 'Where is it?', icon: MapPin },
  { id: 3, title: 'Tell us more', icon: Upload },
  { id: 4, title: 'Review & Submit', icon: Check },
];

export default function ReportComplaintPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState({ lat: 23.2599, lng: 77.4126 });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      latitude: 23.2599,
      longitude: 77.4126,
      is_urgent: false,
      is_public: true,
    },
  });

  const category = watch('category');
  const title = watch('title');
  const description = watch('description');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      if (images.length + files.length > FILE_LIMITS.MAX_IMAGES) {
        toast.error(`Maximum ${FILE_LIMITS.MAX_IMAGES} images allowed`);
        return;
      }

      const validFiles = files.filter(file => {
        if (!FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not a valid image type`);
          return false;
        }
        if (file.size > FILE_LIMITS.MAX_IMAGE_SIZE) {
          toast.error(`${file.name} exceeds ${FILE_LIMITS.MAX_IMAGE_SIZE / 1024 / 1024}MB limit`);
          return false;
        }
        return true;
      });

      setImages(prev => [...prev, ...validFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const uploadResponse = await uploadFiles(images);
        if (uploadResponse.success) {
          imageUrls = uploadResponse.data.urls || [];
        }
      }

      // Submit complaint
      const complaintData = {
        title: data.title,
        description: data.description,
        category: data.category,
        sub_category: data.sub_category,
        location: {
          lat: data.latitude,
          lng: data.longitude,
        },
        address: {
          city: data.address_city,
          state: data.address_state,
          pincode: data.address_pincode,
        },
        landmark: data.landmark,
        images: imageUrls,
        is_urgent: data.is_urgent,
        is_public: data.is_public,
      };

      const response = await api.post(API_ENDPOINTS.COMPLAINTS.CREATE, complaintData) as any;

      if (response.success) {
        toast.success('Complaint submitted successfully!');
        router.push(`/issues/${response.data.complaint_id}`);
      } else {
        toast.error(response.error?.message || 'Failed to submit complaint');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep >= step.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                      }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className="mt-2 text-sm font-medium text-gray-700">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 transition-colors ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Category */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="category">Complaint Category *</Label>
                    <Select onValueChange={(value) => setValue('category', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPLAINT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label>Select Location on Map *</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <DynamicMap
                        center={location}
                        onLocationSelect={(lat, lng) => {
                          setLocation({ lat, lng });
                          setValue('latitude', lat);
                          setValue('longitude', lng);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address_city">City *</Label>
                      <Input
                        id="address_city"
                        placeholder="Enter city"
                        {...register('address_city')}
                      />
                      {errors.address_city && (
                        <p className="text-sm text-red-500 mt-1">{errors.address_city.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address_state">State *</Label>
                      <Input
                        id="address_state"
                        placeholder="Enter state"
                        {...register('address_state')}
                      />
                      {errors.address_state && (
                        <p className="text-sm text-red-500 mt-1">{errors.address_state.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address_pincode">Pincode *</Label>
                      <Input
                        id="address_pincode"
                        placeholder="Enter 6-digit pincode"
                        {...register('address_pincode')}
                      />
                      {errors.address_pincode && (
                        <p className="text-sm text-red-500 mt-1">{errors.address_pincode.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="landmark">Landmark (Optional)</Label>
                      <Input
                        id="landmark"
                        placeholder="Nearby landmark"
                        {...register('landmark')}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="title">Complaint Title *</Label>
                    <Input
                      id="title"
                      placeholder="Brief title for your complaint (min 10 chars)"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed description of the issue (min 50 chars)"
                      rows={6}
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Upload Images (Max {FILE_LIMITS.MAX_IMAGES})</Label>
                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP up to 2MB each</p>
                      </label>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {images.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Review Your Complaint</h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">
                          {COMPLAINT_CATEGORIES.find(c => c.id === category)?.label || 'Not selected'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Title</p>
                        <p className="font-medium">{title || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="text-sm">{description || 'Not provided'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-sm">
                          {watch('address_city')}, {watch('address_state')} - {watch('address_pincode')}
                        </p>
                      </div>

                      {images.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Images ({images.length})</p>
                          <div className="flex gap-2">
                            {images.map((file, index) => (
                              <img
                                key={index}
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-20 h-20 object-cover rounded"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="agree_terms"
                      required
                    />
                    <Label htmlFor="agree_terms" className="cursor-pointer text-sm">
                      I agree to the terms and conditions and verify that the information provided is accurate
                    </Label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
