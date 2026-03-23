'use client'

import React from 'react'

interface AmbientBackgroundProps {
  /**
   * Primary accent color for the page (e.g., '#6c63ff' for Chat, '#F59E0B' for Skills)
   */
  accentColor?: string
  /**
   * Secondary accent color for the bottom glow (optional)
   */
  secondaryColor?: string
}

/**
 * Standardized High-End Background for OrchestrAI
 * Features:
 * 1. Multi-layered radial gradients based on page accent color
 * 2. SVG Noise texture to eliminate banding and add premium feel
 * 3. Fixed positioning for smooth scrolling
 */
export function AmbientBackground({ 
  accentColor = 'rgba(108, 99, 255, 0.06)', 
  secondaryColor = 'rgba(79, 70, 229, 0.04)' 
}: AmbientBackgroundProps) {
  // Ensure we have rgba formats for the styles if hex is passed
  const primaryGlow = accentColor.startsWith('#') ? `${accentColor}10` : accentColor
  const secondaryGlow = secondaryColor.startsWith('#') ? `${secondaryColor}0a` : secondaryColor

  return (
    <div 
      aria-hidden 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 0, 
        pointerEvents: 'none', 
        overflow: 'hidden',
        background: 'var(--bg-base)'
      }}
    >
      {/* Top-left Bloom */}
      <div 
        style={{
          position: 'absolute', 
          top: '-15%', 
          left: '-10%',
          width: '70vw', 
          height: '70vw',
          background: `radial-gradient(circle, ${primaryGlow} 0%, transparent 70%)`,
          filter: 'blur(90px)',
        }} 
      />
      
      {/* Center-right Depth Glow */}
      <div 
        style={{
          position: 'absolute', 
          top: '20%', 
          right: '-15%',
          width: '75vw', 
          height: '75vw',
          background: `radial-gradient(circle, ${secondaryGlow} 0%, transparent 65%)`,
          filter: 'blur(120px)',
        }} 
      />

      {/* Bottom Glow */}
      <div 
        style={{
          position: 'absolute', 
          bottom: '-25%', 
          left: '10%',
          width: '65vw', 
          height: '55vw',
          background: `radial-gradient(circle, ${primaryGlow} 0%, transparent 60%)`,
          filter: 'blur(100px)',
          opacity: 0.6
        }} 
      />

      {/* Premium SVG Noise Texture Overlay */}
      <div 
        style={{
          position: 'absolute', 
          inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }} 
      />
    </div>
  )
}
