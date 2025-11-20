import { IssueForm } from "@/components/issue-form"

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Report an Issue
          </h1>
          <p className="text-muted-foreground">
            Help improve your community by reporting civic issues
          </p>
        </div>
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-950 p-6 md:p-8 rounded-2xl shadow-xl border-2">
          <IssueForm />
        </div>
      </div>
    </div>
  )
}
