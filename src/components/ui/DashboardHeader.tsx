'use client'

import Link from 'next/link'
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline'

interface DashboardHeaderProps {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  showDashboardLink?: boolean
  children?: React.ReactNode
}

export default function DashboardHeader({
  title,
  description,
  backHref,
  backLabel,
  showDashboardLink = true,
  children
}: DashboardHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {backHref && (
                <Link
                  href={backHref}
                  className="text-gray-400 hover:text-gray-600 mr-4"
                  title={backLabel || '返回'}
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Link>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="mt-1 text-sm text-gray-600">{description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {showDashboardLink && (
                <Link
                  href="/dashboard"
                  className="btn btn-secondary flex items-center"
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  仪表板
                </Link>
              )}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
