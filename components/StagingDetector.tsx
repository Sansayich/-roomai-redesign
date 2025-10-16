'use client'

import { useEffect, useState } from 'react'
import StagingNotice from '@/components/StagingNotice'

export default function StagingDetector() {
  const [isStaging, setIsStaging] = useState(false)

  useEffect(() => {
    // Проверяем домен в браузере
    if (typeof window !== 'undefined') {
      setIsStaging(window.location.hostname.includes('staging'))
    }
  }, [])

  if (isStaging) {
    return <StagingNotice />
  }

  return null
}
