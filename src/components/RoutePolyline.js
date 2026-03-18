/**
 * RoutePolyline Component - TheBetterLondon
 * Displays route polylines on the map
 * 
 * Features:
 * - Walking segments: grey dashed lines
 * - Bus segments: colored solid lines (route colors)
 * - Proper layering and styling
 */

import React from 'react';
import { Polyline } from 'react-native-maps';

const RoutePolyline = ({ route, visible = true }) => {
  if (!visible || !route || !route.steps) {
    return null;
  }

  return (
    <>
      {route.steps.map((step, index) => {
        if (!step.polyline || step.polyline.length === 0) {
          return null;
        }

        const isWalking = step.type === 'walk';
        const busColor = step.line?.color || '#2196F3';

        return (
          <Polyline
            key={`${route.id}-step-${index}`}
            coordinates={step.polyline}
            strokeColor={isWalking ? '#757575' : busColor}
            strokeWidth={isWalking ? 4 : 6}
            lineDashPattern={isWalking ? [10, 5] : undefined}
            zIndex={isWalking ? 1 : 2} // Bus routes on top of walking
            lineCap="round"
            lineJoin="round"
          />
        );
      })}
    </>
  );
};

export default RoutePolyline;
