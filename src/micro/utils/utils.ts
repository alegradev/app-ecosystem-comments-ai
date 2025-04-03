export const getAvatarColor = (name: string) => {
  // Vibrant, solid colors
  const colors = [
    '#4F46E5', // Indigo
    '#FBBF24', // Amber
    '#30ABA9', // Teal
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#10B981', // Emerald
    '#06B6D4', // Cyan
  ]

  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charSum % colors.length]
}
