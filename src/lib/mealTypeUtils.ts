import { MealType } from '@/types/enums'

/**
 * Auto-detect meal type based on time of day
 * @param time - Time string in format "HH:MM" or "HH:MM:SS"
 * @returns MealType or null if cannot be determined
 */
export function detectMealTypeFromTime(time: string | null | undefined): MealType | null {
  if (!time) return null

  try {
    // Parse time string
    const [hours] = time.split(':').map(Number)

    if (isNaN(hours) || hours < 0 || hours > 23) {
      return null
    }

    // Breakfast: 5:00 AM - 10:59 AM
    if (hours >= 5 && hours < 11) {
      return MealType.BREAKFAST
    }

    // Lunch: 11:00 AM - 3:59 PM
    if (hours >= 11 && hours < 16) {
      return MealType.LUNCH
    }

    // Dinner: 4:00 PM - 10:59 PM
    if (hours >= 16 && hours < 23) {
      return MealType.DINNER
    }

    // Late night / early morning - default to dinner
    if (hours >= 23 || hours < 5) {
      return MealType.DINNER
    }

    return null
  } catch (error) {
    console.error('Error detecting meal type from time:', error)
    return null
  }
}

/**
 * Auto-detect meal type from restaurant name or keywords
 * @param name - Restaurant or booking name
 * @returns MealType or null if cannot be determined
 */
export function detectMealTypeFromName(name: string | null | undefined): MealType | null {
  if (!name) return null

  const lowerName = name.toLowerCase()

  // Breakfast keywords
  const breakfastKeywords = [
    'breakfast', 'brunch', 'cafe', 'coffee', 'bakery',
    'bagel', 'pancake', 'waffle', 'morning'
  ]
  if (breakfastKeywords.some(keyword => lowerName.includes(keyword))) {
    return MealType.BREAKFAST
  }

  // Lunch keywords
  const lunchKeywords = [
    'lunch', 'deli', 'sandwich', 'salad bar', 'bistro'
  ]
  if (lunchKeywords.some(keyword => lowerName.includes(keyword))) {
    return MealType.LUNCH
  }

  // Dinner keywords
  const dinnerKeywords = [
    'dinner', 'steakhouse', 'fine dining', 'supper',
    'grill', 'tavern', 'pub'
  ]
  if (dinnerKeywords.some(keyword => lowerName.includes(keyword))) {
    return MealType.DINNER
  }

  return null
}

/**
 * Auto-detect meal type using multiple strategies
 * Priority: time-based > name-based
 * @param time - Time string
 * @param name - Restaurant or booking name
 * @returns MealType or null if cannot be determined
 */
export function autoDetectMealType(
  time: string | null | undefined,
  name: string | null | undefined
): MealType | null {
  // Try time-based detection first (more reliable)
  const timeBasedType = detectMealTypeFromTime(time)
  if (timeBasedType) {
    return timeBasedType
  }

  // Fall back to name-based detection
  const nameBasedType = detectMealTypeFromName(name)
  if (nameBasedType) {
    return nameBasedType
  }

  return null
}
