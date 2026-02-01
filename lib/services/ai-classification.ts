// =============================================
// AI CLASSIFICATION SERVICE
// Uses NLP for auto-categorization of complaints
// =============================================

import { ClassificationResult, DuplicateCheckResult, PriorityScoreResult } from "@/types"
import { prisma } from "@/lib/prisma"

// Category keywords for classification (can be extended with BERT model)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Infrastructure": [
    "road", "pothole", "bridge", "flyover", "footpath", "pavement",
    "construction", "building", "damaged", "broken", "crack"
  ],
  "Sanitation": [
    "garbage", "waste", "trash", "dump", "sewage", "drainage",
    "clogged", "smell", "dirty", "clean", "hygiene", "toilet"
  ],
  "Water Supply": [
    "water", "pipeline", "leakage", "tap", "supply", "contaminated",
    "drinking", "bore", "well", "tank", "overflow"
  ],
  "Electricity": [
    "power", "electricity", "light", "streetlight", "pole", "wire",
    "outage", "blackout", "transformer", "meter", "bill"
  ],
  "Public Safety": [
    "crime", "theft", "harassment", "unsafe", "security", "police",
    "accident", "danger", "violence", "threat"
  ],
  "Traffic": [
    "traffic", "signal", "parking", "congestion", "accident",
    "sign", "zebra", "crossing", "vehicle", "jam"
  ],
  "Public Transport": [
    "bus", "train", "metro", "auto", "taxi", "rickshaw",
    "station", "stop", "schedule", "fare", "crowded"
  ],
  "Healthcare": [
    "hospital", "clinic", "doctor", "medicine", "health",
    "ambulance", "emergency", "vaccine", "disease"
  ],
  "Education": [
    "school", "college", "education", "teacher", "student",
    "classroom", "library", "playground", "fees"
  ],
  "Environment": [
    "pollution", "air", "noise", "tree", "park", "garden",
    "green", "plastic", "environment", "smoke", "dust"
  ],
  "Housing": [
    "house", "building", "apartment", "rent", "encroachment",
    "illegal", "construction", "slum", "homeless"
  ],
  "Social Welfare": [
    "pension", "ration", "scheme", "benefit", "subsidy",
    "certificate", "license", "registration", "welfare"
  ],
  "Animal Control": [
    "stray", "dog", "cat", "animal", "cattle", "snake",
    "monkey", "bite", "rabies", "shelter"
  ],
  "Corruption": [
    "bribe", "corruption", "fraud", "scam", "illegal",
    "dishonest", "misuse", "abuse", "complaint"
  ],
  "Other": []
}

/**
 * Classifies an issue based on its title and description
 * Returns the most likely category with confidence score
 */
export async function classifyIssue(
  title: string, 
  description: string
): Promise<ClassificationResult> {
  const text = `${title} ${description}`.toLowerCase()
  const words = text.split(/\s+/)
  
  const scores: Record<string, number> = {}
  
  // Calculate scores for each category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 1
        // Bonus for title matches
        if (title.toLowerCase().includes(keyword)) {
          score += 0.5
        }
      }
    }
    scores[category] = score
  }
  
  // Sort categories by score
  const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score > 0)
  
  if (sortedCategories.length === 0) {
    return {
      category: "Other",
      confidence: 0.3,
      suggestedCategories: []
    }
  }
  
  const topCategory = sortedCategories[0][0]
  const topScore = sortedCategories[0][1]
  const totalScore = sortedCategories.reduce((sum, [, score]) => sum + score, 0)
  const confidence = Math.min(topScore / Math.max(totalScore, 1), 0.95)
  
  return {
    category: topCategory,
    confidence: Math.max(confidence, 0.5),
    suggestedCategories: sortedCategories.slice(1, 4).map(([cat, score]) => ({
      category: cat,
      confidence: score / totalScore
    }))
  }
}

/**
 * Calculates the Haversine distance between two points
 */
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}

/**
 * Calculates text similarity using Jaccard coefficient
 */
function textSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3))
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3))
  
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  
  return intersection.size / Math.max(union.size, 1)
}

/**
 * Checks for duplicate issues based on text similarity and geospatial proximity
 * Uses 500m radius for proximity check
 */
export async function checkForDuplicates(
  title: string,
  description: string,
  latitude: number,
  longitude: number,
  categoryId: string
): Promise<DuplicateCheckResult> {
  const PROXIMITY_RADIUS = 500 // meters
  const SIMILARITY_THRESHOLD = 0.4
  
  // Fetch recent issues in the same category
  const recentIssues = await prisma.issue.findMany({
    where: {
      categoryId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      },
      status: {
        notIn: ["CLOSED", "REJECTED"]
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      latitude: true,
      longitude: true
    },
    take: 100
  })
  
  const matches: DuplicateCheckResult["matchingIssues"] = []
  const fullText = `${title} ${description}`
  
  for (const issue of recentIssues) {
    const distance = haversineDistance(latitude, longitude, issue.latitude, issue.longitude)
    const similarity = textSimilarity(fullText, `${issue.title} ${issue.description}`)
    
    // Check if within proximity radius and has text similarity
    if (distance <= PROXIMITY_RADIUS && similarity >= SIMILARITY_THRESHOLD) {
      matches.push({
        id: issue.id,
        title: issue.title,
        similarity,
        distance
      })
    }
  }
  
  // Sort by similarity
  matches.sort((a, b) => b.similarity - a.similarity)
  
  return {
    isDuplicate: matches.length > 0 && matches[0].similarity > 0.6,
    confidence: matches.length > 0 ? matches[0].similarity : 0,
    matchingIssues: matches.slice(0, 5)
  }
}

/**
 * Performs simple sentiment analysis
 * Returns a score from -1 (very negative) to 1 (very positive)
 */
export function analyzeSentiment(text: string): number {
  const negativeWords = [
    "terrible", "horrible", "awful", "disgusting", "unacceptable",
    "dangerous", "urgent", "emergency", "critical", "severe",
    "worst", "pathetic", "shame", "failure", "negligence",
    "corrupt", "bribe", "illegal", "unsafe", "hazard"
  ]
  
  const positiveWords = [
    "good", "great", "nice", "thanks", "appreciate",
    "helpful", "clean", "safe", "proper", "working"
  ]
  
  const lowerText = text.toLowerCase()
  let score = 0
  
  for (const word of negativeWords) {
    if (lowerText.includes(word)) score -= 0.2
  }
  
  for (const word of positiveWords) {
    if (lowerText.includes(word)) score += 0.1
  }
  
  return Math.max(-1, Math.min(1, score))
}

/**
 * Calculates priority score based on multiple factors
 */
export async function calculatePriorityScore(
  issueId: string,
  sentimentScore: number,
  voteCount: number,
  categoryId: string,
  createdAt: Date
): Promise<PriorityScoreResult> {
  // Get category weight
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { slaHours: true }
  })
  
  // Lower SLA = higher priority
  const categoryWeight = category ? (168 - category.slaHours) / 168 : 0.5
  
  // Age weight: older issues get slightly higher priority
  const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  const ageWeight = Math.min(ageInDays / 7, 1) * 0.3
  
  // Normalize sentiment (more negative = higher priority)
  const sentimentWeight = (1 - sentimentScore) / 2
  
  // Normalize votes
  const voteWeight = Math.min(voteCount / 100, 1)
  
  // Calculate final score (0-100)
  const score = (
    sentimentWeight * 25 +
    voteWeight * 30 +
    categoryWeight * 25 +
    ageWeight * 20
  )
  
  return {
    score: Math.round(score),
    factors: {
      sentiment: sentimentWeight,
      communityVotes: voteWeight,
      categoryWeight,
      ageWeight
    }
  }
}
