"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/lib/stores/auth-store";
import { api } from "@/lib/api-client";
import { API_ENDPOINTS, COMPLAINT_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";
import DynamicMap from "@/components/dynamic-map";

export default function ReportPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    address: "",
    latitude: 0,
    longitude: 0,
    images: [] as string[],
  });

  const [locationSelected, setLocationSelected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?from=/report`);
    } else {
      // Initialize with user's location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData((prev) => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }));
          },
          (error) => {
            console.error("Error getting location:", error);
            // Default to Bhopal (from constants) if location access denied
            setFormData((prev) => ({
              ...prev,
              latitude: 23.2599,
              longitude: 77.4126,
            }));
          },
        );
      }
    }
  }, [isAuthenticated, router]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    setLocationSelected(true);
    toast.success("Location updated");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // In a real app, we would upload these to S3/Cloudinary here
    // For now, we'll simulate by creating a local object URL or mock
    // Assuming backend handles file upload separately or accepts base64
    // Checking lib/api-client or constants might reveal upload pattern
    // adhering to API_ENDPOINTS.FILES.UPLOAD

    setIsLoading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = (await api.post(
          API_ENDPOINTS.FILES.UPLOAD,
          formData,
          // @ts-ignore - axios types might need 'headers' property explicitly
          { headers: { "Content-Type": "multipart/form-data" } },
        )) as any;
        return response.data?.url || response.url; // Adjust based on actual API response
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!locationSelected && formData.latitude === 0) {
      toast.warning("Please confirm your location on the map");
      return;
    }

    setIsLoading(true);
    try {
      await api.post(API_ENDPOINTS.COMPLAINTS.CREATE, formData);
      toast.success("Complaint submitted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-muted/10 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Report a Complaint
            </h1>
            <p className="text-muted-foreground mt-2">
              Help us improve your community by reporting issues.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Issue Details
                </CardTitle>
                <CardDescription>
                  Provide clear information about the problem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Issue Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Pothole on Main Street"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPLAINT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.description.length}/1000 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Location
                </CardTitle>
                <CardDescription>
                  Pinpoint the exact location of the issue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Address (Optional)</Label>
                  <Input
                    placeholder="Enter nearest landmark or address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="h-[400px] w-full rounded-md overflow-hidden border">
                  <DynamicMap
                    height="400px"
                    showControls={false}
                    onLocationSelect={handleLocationSelect}
                    customCenter={
                      formData.latitude && formData.longitude
                        ? { lat: formData.latitude, lng: formData.longitude }
                        : undefined
                    }
                    issues={[]} // No existing issues to show on picker
                  />
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {locationSelected ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Location selected
                    </span>
                  ) : (
                    "Click on the map to mark the location"
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Step 3: Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-600" />
                  Photos
                </CardTitle>
                <CardDescription>
                  Upload visual proof (Optional, max 5 images).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden border group"
                    >
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }))
                        }
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <label className="border-2 border-dashed border-muted-foreground/25 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-md aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">
                        Add Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple={false} // Simplify logic
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Complaint
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
