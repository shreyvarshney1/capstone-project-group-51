"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { issueSchema, IssueFormValues } from "@/lib/validations/issue"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useOfflineDraft } from "@/components/offline-indicator"
import { useLanguage } from "@/components/language-selector"
import { 
  Mic, 
  MicOff, 
  MapPin, 
  Loader2, 
  Navigation, 
  Save, 
  Upload,
  Image as ImageIcon,
  X,
  Camera
} from "lucide-react"

// Speech recognition types
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function IssueForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const router = useRouter()
  
  // Offline draft management
  const { draft, saveDraft, clearDraft, isOnline } = useOfflineDraft("issue-form")
  const { t } = useLanguage()
  
  // Voice input state
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [activeVoiceField, setActiveVoiceField] = useState<"title" | "description" | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  
  // Location state
  const [isLocating, setIsLocating] = useState(false)
  const [locationAddress, setLocationAddress] = useState<string>("")
  const [locationError, setLocationError] = useState<string>("")
  
  // Image upload state
  const [images, setImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Draft saved indicator
  const [draftSaved, setDraftSaved] = useState(false)

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setVoiceSupported(!!SpeechRecognition)
    }
  }, [])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json() as { id: string; name: string }[]
          setCategories(data)
        }
      } catch (error) {
        console.error("Failed to fetch categories", error)
      }
    }
    fetchCategories()
  }, [])

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: draft ? {
      title: draft.title || "",
      description: draft.description || "",
      categoryId: draft.categoryId || "",
      latitude: draft.latitude || 28.6139, // Default to Delhi
      longitude: draft.longitude || 77.2090,
      isPublic: true,
      language: "en",
    } : {
      title: "",
      description: "",
      categoryId: "",
      latitude: 28.6139, // Default to Delhi
      longitude: 77.2090,
      isPublic: true,
      language: "en",
    },
  })

  // Auto-save draft when form values change
  const watchedValues = form.watch()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedValues.title || watchedValues.description) {
        saveDraft({
          ...watchedValues,
          savedAt: new Date().toISOString(),
        })
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 2000)
      }
    }, 1000) // Debounce by 1 second
    
    return () => clearTimeout(timeoutId)
  }, [watchedValues.title, watchedValues.description, watchedValues.categoryId])

  // Voice input functions
  const startVoiceInput = useCallback((field: "title" | "description") => {
    if (!voiceSupported) return
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = field === "description"
    recognition.interimResults = true
    recognition.lang = "en-IN" // Default to Indian English
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ""
      let interimTranscript = ""
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }
      
      if (finalTranscript) {
        const currentValue = form.getValues(field)
        form.setValue(field, currentValue + (currentValue ? " " : "") + finalTranscript)
      }
    }
    
    recognition.onerror = () => {
      setIsListening(false)
      setActiveVoiceField(null)
    }
    
    recognition.onend = () => {
      setIsListening(false)
      setActiveVoiceField(null)
    }
    
    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setActiveVoiceField(field)
  }, [voiceSupported, form])

  const stopVoiceInput = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      setActiveVoiceField(null)
    }
  }, [])

  // Get current location with reverse geocoding
  const getCurrentLocation = useCallback(async () => {
    setIsLocating(true)
    setLocationError("")
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        form.setValue("latitude", latitude)
        form.setValue("longitude", longitude)
        
        // Reverse geocoding using Nominatim (free OSM service)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "User-Agent": "CivicConnect/1.0" } }
          )
          if (response.ok) {
            const data = await response.json()
            setLocationAddress(data.display_name || "Location found")
          }
        } catch {
          setLocationAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        }
        
        setIsLocating(false)
      },
      (error) => {
        setLocationError(
          error.code === 1 ? "Location access denied. Please enable location permissions." :
          error.code === 2 ? "Location unavailable. Please try again." :
          "Location request timed out. Please try again."
        )
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [form])

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      alert("Maximum 5 images allowed")
      return
    }
    
    const newImages = [...images, ...files].slice(0, 5)
    setImages(newImages)
    
    // Generate preview URLs
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file))
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
    setImagePreviewUrls(newPreviewUrls)
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviewUrls[index])
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: IssueFormValues) {
    setIsSubmitting(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description)
      formData.append("categoryId", data.categoryId)
      formData.append("latitude", String(data.latitude))
      formData.append("longitude", String(data.longitude))
      if (locationAddress) {
        formData.append("address", locationAddress)
      }
      
      // Append images
      images.forEach((image, index) => {
        formData.append(`image${index}`, image)
      })

      const response = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          address: locationAddress || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit issue")
      }

      const issue = await response.json()
      
      // Clear draft on successful submission
      clearDraft()
      
      router.push(`/issues/${issue.id}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      
      if (!isOnline) {
        // Save as draft for offline sync
        saveDraft({
          ...data,
          savedAt: new Date().toISOString(),
          pendingSync: true,
        })
        alert("You're offline. Your report has been saved and will be submitted when you're back online.")
      } else {
        alert("Failed to submit issue. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Draft Indicator */}
        {draftSaved && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Save className="h-4 w-4" />
            Draft saved
          </div>
        )}
        
        {/* Offline Warning */}
        {!isOnline && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              You&apos;re currently offline
            </p>
            <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
              Your report will be saved locally and submitted when you&apos;re back online.
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Issue Title</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="e.g., Pothole on Main Street" 
                    {...field} 
                    className="h-11 border-2 focus-visible:ring-blue-600"
                  />
                </FormControl>
                {voiceSupported && (
                  <Button
                    type="button"
                    variant={isListening && activeVoiceField === "title" ? "destructive" : "outline"}
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => isListening && activeVoiceField === "title" ? stopVoiceInput() : startVoiceInput("title")}
                  >
                    {isListening && activeVoiceField === "title" ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <FormDescription>
                A concise title that describes the issue. {voiceSupported && "Use the mic button for voice input."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11 border-2 focus:ring-blue-600">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Description</FormLabel>
              <div className="relative">
                <FormControl>
                  <Textarea
                    placeholder="Please provide detailed information about the issue..."
                    className="resize-none min-h-[120px] border-2 focus-visible:ring-blue-600 pr-12"
                    {...field}
                  />
                </FormControl>
                {voiceSupported && (
                  <Button
                    type="button"
                    variant={isListening && activeVoiceField === "description" ? "destructive" : "ghost"}
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => isListening && activeVoiceField === "description" ? stopVoiceInput() : startVoiceInput("description")}
                  >
                    {isListening && activeVoiceField === "description" ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <FormDescription>
                Provide as much detail as possible. {voiceSupported && "Click the mic icon for voice-to-text."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="rounded-lg border-2 p-4 bg-blue-50 dark:bg-blue-950/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Location
          </h3>
          
          {/* Get Current Location Button */}
          <div className="mb-4">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={getCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Getting your location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Use My Current Location
                </>
              )}
            </Button>
            
            {locationError && (
              <p className="text-sm text-red-600 mt-2">{locationError}</p>
            )}
            
            {locationAddress && (
              <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-md border">
                <p className="text-xs text-muted-foreground mb-1">Detected location:</p>
                <p className="text-sm font-medium">{locationAddress}</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="any" 
                      placeholder="28.6139"
                      className="border-2" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="any" 
                      placeholder="77.2090"
                      className="border-2" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Use &quot;My Current Location&quot; for automatic GPS coordinates, or enter manually.
          </p>
        </div>
        
        {/* Image Upload Section */}
        <div className="rounded-lg border-2 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Photos (Optional)
          </h3>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          
          <div className="grid grid-cols-5 gap-2 mb-3">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2">
                <img 
                  src={url} 
                  alt={`Preview ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <ImageIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Add up to 5 photos to help describe the issue. Clear photos improve resolution time.
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-base font-semibold"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : !isOnline ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Draft (Offline)
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Submit Report
            </>
          )}
        </Button>
        
        {draft && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Draft saved at {new Date(draft.savedAt).toLocaleTimeString()}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                clearDraft()
                form.reset()
              }}
            >
              Clear Draft
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
