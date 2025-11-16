import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PropertyViewTrackerProps {
  propertyId: number;
  onViewCountChange?: (count: number) => void;
}

/**
 * PropertyViewTracker
 * 
 * Tracks property views in the current session and shows a lead capture
 * modal after the user has viewed 3 different properties.
 * 
 * This component:
 * - Tracks views via tRPC mutation
 * - Stores session ID in localStorage
 * - Shows modal when 3 views reached
 * - Allows user to dismiss or proceed to lead form
 */
export default function PropertyViewTracker({
  propertyId,
  onViewCountChange,
}: PropertyViewTrackerProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [hasShownModal, setHasShownModal] = useState(false);

  const trackViewMutation = trpc.properties.trackView.useMutation();

  // Initialize session ID and track view
  useEffect(() => {
    // Get or create session ID
    let sid = localStorage.getItem('property_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('property_session_id', sid);
    }
    setSessionId(sid);

    // Track this property view
    if (propertyId && sid) {
      trackViewMutation.mutate(
        { propertyId, sessionId: sid },
        {
          onSuccess: (result) => {
            setViewCount(result.sessionViewCount);
            onViewCountChange?.(result.sessionViewCount);

            // Show modal if we've hit 3 views and haven't shown it yet
            if (result.shouldShowLeadCapture && !hasShownModal) {
              setShowModal(true);
              setHasShownModal(true);
              // Mark that we've shown the modal for this session
              localStorage.setItem('lead_modal_shown', 'true');
            }
          },
          onError: (error) => {
            console.error('Failed to track property view:', error);
          },
        }
      );
    }
  }, [propertyId, hasShownModal, trackViewMutation, onViewCountChange]);

  const handleProceedToForm = () => {
    setShowModal(false);
    // Scroll to lead form or open lead capture modal
    const leadForm = document.getElementById('property-lead-form');
    if (leadForm) {
      leadForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
  };

  return (
    <AlertDialog open={showModal} onOpenChange={setShowModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Interested in These Properties?</AlertDialogTitle>
          <AlertDialogDescription>
            You've viewed {viewCount} properties. Let us know more about what you're looking for,
            and we'll help you find your perfect home!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-3">
            By providing your information, our team can:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Find properties matching your specific needs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Alert you to new listings before they're listed elsewhere</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Provide personalized mortgage pre-approval options</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Schedule tours at your convenience</span>
            </li>
          </ul>
        </div>
        <div className="flex gap-3">
          <AlertDialogCancel onClick={handleDismiss}>
            Continue Browsing
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleProceedToForm}>
            Tell Us More
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
