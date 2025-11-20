type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {

  const toast = ({ title, description, variant }: ToastProps) => {
    // Simple console log for now as full toast implementation is complex
    // and requires a provider.
    console.log(`Toast: ${title} - ${description} (${variant})`)
    // In a real app, we would add to state and show a UI element
  }

  return { toast }
}
